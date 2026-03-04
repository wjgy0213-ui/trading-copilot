import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getPracticePortfolio,
  savePracticePortfolio,
  savePracticeTrade,
  getPracticeTrades,
} from '@/lib/supabase';

// Trading Practice Mode — Virtual $10,000 paper trading with AI coaching
// Tiers: Bronze ($10K) → Silver ($50K) → Gold ($100K) → Platinum ($500K)

export const revalidate = 0; // No cache

interface PracticeState {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  balance: number;
  startBalance: number;
  positions: PracticePosition[];
  history: PracticeTrade[];
  stats: {
    totalTrades: number;
    wins: number;
    losses: number;
    bestTrade: number;     // % gain
    worstTrade: number;    // % loss
    avgHoldTime: number;   // minutes
    maxDrawdown: number;   // %
    streakCurrent: number; // positive = wins, negative = losses
    streakBest: number;
    daysActive: number;
  };
  achievements: string[];
  createdAt: string;
  lastActiveAt: string;
}

interface PracticePosition {
  id: string;
  coin: string;
  side: 'long' | 'short';
  entryPrice: number;
  size: number;        // USD notional
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: string;
}

interface PracticeTrade {
  id: string;
  coin: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPct: number;
  reason: string;
  entryTime: string;
  exitTime: string;
  aiScore?: number;     // AI coaching score 0-100
  aiAdvice?: string;    // What could be improved
}

// Tier unlock requirements
const TIERS = {
  bronze:   { balance: 10000,  unlockPnl: 0,    unlockWinRate: 0,  unlockTrades: 0, label: '🥉 Bronze' },
  silver:   { balance: 50000,  unlockPnl: 20,   unlockWinRate: 45, unlockTrades: 20, label: '🥈 Silver' },
  gold:     { balance: 100000, unlockPnl: 50,   unlockWinRate: 50, unlockTrades: 50, label: '🥇 Gold' },
  platinum: { balance: 500000, unlockPnl: 100,  unlockWinRate: 55, unlockTrades: 100, label: '💎 Platinum' },
};

// Coaching rules — grade each trade
function gradeTrade(trade: Omit<PracticeTrade, 'aiScore' | 'aiAdvice'>): { score: number; advice: string } {
  let score = 50;
  const advices: string[] = [];

  // Risk management
  if (trade.size / 10000 > 0.1) { // >10% of starting balance
    score -= 15;
    advices.push('仓位过大（>10%），建议控制在5%以内');
  } else if (trade.size / 10000 <= 0.05) {
    score += 10;
    advices.push('仓位控制良好 ✓');
  }

  // Stop loss usage
  if (trade.pnlPct < -10) {
    score -= 20;
    advices.push('亏损超过10%才出场，需要设置止损');
  } else if (trade.pnlPct < -5 && trade.pnlPct > -10) {
    score += 5;
    advices.push('止损在合理范围内 ✓');
  }

  // Win quality
  if (trade.pnlPct > 0) {
    score += 10;
    if (trade.pnlPct > 5) {
      score += 10;
      advices.push('不错的利润，但要确认是否过早止盈');
    }
  }

  // Leverage
  if (trade.leverage > 10) {
    score -= 15;
    advices.push(`${trade.leverage}x杠杆过高，新手建议≤5x`);
  } else if (trade.leverage <= 3) {
    score += 5;
    advices.push('保守杠杆 ✓');
  }

  // Hold time
  const holdMs = new Date(trade.exitTime).getTime() - new Date(trade.entryTime).getTime();
  const holdMin = holdMs / 60000;
  if (holdMin < 1) {
    score -= 10;
    advices.push('持仓不到1分钟，可能是冲动交易');
  }

  score = Math.max(0, Math.min(100, score));
  
  return {
    score,
    advice: advices.join(' | '),
  };
}

// GET — fetch practice state (from Supabase if authenticated, fallback to default)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'prices') {
    // Fetch current prices
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await res.json();
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: 'Price fetch failed' }, { status: 500 });
    }
  }

  if (action === 'tiers') {
    return NextResponse.json(TIERS);
  }

  // Try to get user session
  const session = await getSession();
  const userId = session?.email;

  // If authenticated, try to fetch from Supabase
  if (userId) {
    const portfolio = await getPracticePortfolio(userId);
    if (portfolio) {
      // Convert DB format to frontend PracticeState format
      const history = await getPracticeTrades(userId, 100);
      
      const state: PracticeState = {
        tier: portfolio.tier as any,
        balance: Number(portfolio.balance),
        startBalance: Number(portfolio.start_balance),
        positions: portfolio.state?.positions || [],
        history: history.map(t => ({
          id: t.id!,
          coin: t.coin,
          side: t.side as any,
          entryPrice: Number(t.entry_price),
          exitPrice: Number(t.exit_price),
          size: Number(t.size),
          leverage: Number(t.leverage),
          pnl: Number(t.pnl),
          pnlPct: Number(t.pnl_pct),
          reason: t.reason || '',
          entryTime: t.entry_time,
          exitTime: t.exit_time,
          aiScore: t.ai_score,
          aiAdvice: t.ai_advice,
        })),
        stats: {
          totalTrades: portfolio.total_trades,
          wins: portfolio.wins,
          losses: portfolio.losses,
          bestTrade: Number(portfolio.best_trade_pct),
          worstTrade: Number(portfolio.worst_trade_pct),
          avgHoldTime: Number(portfolio.avg_hold_time_min),
          maxDrawdown: Number(portfolio.max_drawdown_pct),
          streakCurrent: portfolio.streak_current,
          streakBest: portfolio.streak_best,
          daysActive: portfolio.days_active,
        },
        achievements: portfolio.state?.achievements || [],
        createdAt: portfolio.created_at,
        lastActiveAt: portfolio.updated_at,
      };

      return NextResponse.json({
        state,
        tiers: TIERS,
        message: 'Loaded from cloud',
        source: 'supabase',
      });
    }
  }

  // Return default new state (not logged in or no data)
  const defaultState: PracticeState = {
    tier: 'bronze',
    balance: TIERS.bronze.balance,
    startBalance: TIERS.bronze.balance,
    positions: [],
    history: [],
    stats: {
      totalTrades: 0, wins: 0, losses: 0,
      bestTrade: 0, worstTrade: 0,
      avgHoldTime: 0, maxDrawdown: 0,
      streakCurrent: 0, streakBest: 0, daysActive: 0,
    },
    achievements: [],
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  return NextResponse.json({
    state: defaultState,
    tiers: TIERS,
    message: userId ? 'No saved data, starting fresh' : 'Guest mode - login to save progress',
    source: 'default',
  });
}

// POST — save state or grade a trade
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.action === 'grade') {
      const { score, advice } = gradeTrade(body.trade);
      return NextResponse.json({ score, advice });
    }

    if (body.action === 'save') {
      // Save portfolio state to Supabase
      const session = await getSession();
      if (!session?.email) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      const { state, trade } = body;
      const userId = session.email;

      // Save portfolio
      if (state) {
        const saved = await savePracticePortfolio({
          user_id: userId,
          tier: state.tier,
          balance: state.balance,
          start_balance: state.startBalance,
          total_trades: state.stats.totalTrades,
          wins: state.stats.wins,
          losses: state.stats.losses,
          best_trade_pct: state.stats.bestTrade,
          worst_trade_pct: state.stats.worstTrade,
          avg_hold_time_min: state.stats.avgHoldTime,
          max_drawdown_pct: state.stats.maxDrawdown,
          streak_current: state.stats.streakCurrent,
          streak_best: state.stats.streakBest,
          days_active: state.stats.daysActive,
          state: {
            positions: state.positions,
            achievements: state.achievements,
          },
        });

        if (!saved) {
          console.warn('[Practice] Failed to save to Supabase, client will use local state');
        }
      }

      // Save individual trade if provided
      if (trade) {
        await savePracticeTrade({
          user_id: userId,
          coin: trade.coin,
          side: trade.side,
          entry_price: trade.entryPrice,
          exit_price: trade.exitPrice,
          size: trade.size,
          leverage: trade.leverage,
          pnl: trade.pnl,
          pnl_pct: trade.pnlPct,
          reason: trade.reason,
          entry_time: trade.entryTime,
          exit_time: trade.exitTime,
          ai_score: trade.aiScore,
          ai_advice: trade.aiAdvice,
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
