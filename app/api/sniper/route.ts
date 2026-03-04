import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE = join(process.cwd(), '..', '..', 'trading', 'scripts', 'meme_sniper');
const STATE_FILE = join(BASE, 'paper_state.json');
const HISTORY_FILE = join(BASE, 'trade_history.jsonl');

// In production (Vercel), read from a different mechanism
// For now, we'll serve mock data if files don't exist and provide an API
// that the local dev server can use

interface Position {
  symbol: string;
  entry_price: number;
  entry_sol_price: number;
  size_sol: number;
  size_usd: number;
  tokens: number;
  entry_time: string;
  peak_price: number;
  score: number;
  partial_sold: boolean;
  current_price?: number;
  pnl_pct?: number;
}

interface SniperState {
  balance_sol: number;
  positions: Record<string, Position>;
  total_trades: number;
  wins: number;
  losses: number;
  total_pnl_sol: number;
  peak_balance: number;
  max_drawdown: number;
  start_time: string;
}

interface TradeRecord {
  action: string;
  symbol: string;
  token: string;
  price?: number;
  entry_price?: number;
  exit_price?: number;
  pnl_pct?: number;
  pnl_sol?: number;
  reason?: string;
  score?: number;
  size_sol?: number;
  size_usd?: number;
  ts: string;
}

async function fetchCurrentPrices(addresses: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  // Batch fetch from DexScreener
  for (const addr of addresses.slice(0, 10)) {
    try {
      const res = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${addr}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Pick pair with highest liquidity
          const sorted = data.sort((a: any, b: any) => 
            ((b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
          );
          const price = parseFloat(sorted[0].priceUsd || '0');
          if (price > 0) prices[addr] = price;
        }
      }
    } catch {}
  }
  return prices;
}

export async function GET() {
  try {
    let state: SniperState;
    let trades: TradeRecord[] = [];

    if (existsSync(STATE_FILE)) {
      state = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    } else {
      // Demo/Vercel fallback
      return NextResponse.json({
        state: null,
        trades: [],
        live_prices: {},
        message: 'Sniper not running on this environment',
      });
    }

    // Read trade history (last 50)
    if (existsSync(HISTORY_FILE)) {
      const lines = readFileSync(HISTORY_FILE, 'utf-8').trim().split('\n').filter(Boolean);
      trades = lines.slice(-50).map(l => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(Boolean) as TradeRecord[];
    }

    // Fetch current prices for open positions
    const addresses = Object.keys(state.positions);
    const prices = addresses.length > 0 ? await fetchCurrentPrices(addresses) : {};

    // Enrich positions with current price and PnL
    const enrichedPositions: Record<string, Position & { current_price: number; pnl_pct: number; pnl_usd: number }> = {};
    let totalUnrealizedSol = 0;

    for (const [addr, pos] of Object.entries(state.positions)) {
      const currentPrice = prices[addr] || pos.entry_price;
      const pnlPct = pos.entry_price > 0 ? ((currentPrice / pos.entry_price) - 1) * 100 : 0;
      const currentValueUsd = pos.tokens * currentPrice;
      const pnlUsd = currentValueUsd - pos.size_usd;

      enrichedPositions[addr] = {
        ...pos,
        current_price: currentPrice,
        pnl_pct: Math.round(pnlPct * 10) / 10,
        pnl_usd: Math.round(pnlUsd * 100) / 100,
      };

      totalUnrealizedSol += pnlUsd / (pos.entry_sol_price || 85);
    }

    // Calculate portfolio stats
    const solPrice = Object.values(state.positions)[0]?.entry_sol_price || 85;
    const totalPositionValue = Object.values(enrichedPositions).reduce(
      (sum, p) => sum + p.tokens * p.current_price, 0
    );
    const totalValueSol = state.balance_sol + totalPositionValue / solPrice;
    const startBalance = 10; // CONFIG paper_balance
    const totalPnlPct = ((totalValueSol / startBalance) - 1) * 100;
    const winRate = (state.wins + state.losses) > 0
      ? (state.wins / (state.wins + state.losses)) * 100
      : 0;

    return NextResponse.json({
      state: {
        ...state,
        positions: enrichedPositions,
      },
      portfolio: {
        total_value_sol: Math.round(totalValueSol * 10000) / 10000,
        total_value_usd: Math.round(totalValueSol * solPrice * 100) / 100,
        total_pnl_pct: Math.round(totalPnlPct * 10) / 10,
        unrealized_pnl_sol: Math.round(totalUnrealizedSol * 10000) / 10000,
        win_rate: Math.round(winRate * 10) / 10,
        sol_price: solPrice,
      },
      trades: trades.reverse(), // newest first
      timestamp: Date.now(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
