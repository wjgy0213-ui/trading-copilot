#!/usr/bin/env node
/**
 * Sync Sniper local state to Supabase
 * 
 * Usage:
 *   ts-node scripts/sync-sniper-to-supabase.ts
 *   
 * Or via API:
 *   curl -X POST http://localhost:3000/api/sniper/sync
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

const BASE = join(process.cwd(), '..', '..', 'trading', 'scripts', 'meme_sniper');
const STATE_FILE = join(BASE, 'paper_state.json');
const HISTORY_FILE = join(BASE, 'trade_history.jsonl');

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
}

interface LocalState {
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

async function syncToSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment');
    console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  if (!existsSync(STATE_FILE)) {
    console.error(`❌ State file not found: ${STATE_FILE}`);
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // 1. Read local state
  console.log('📖 Reading local state...');
  const state: LocalState = JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  
  // Convert positions object to array
  const positionsArray = Object.entries(state.positions).map(([addr, pos]) => ({
    ...pos,
    symbol: addr,
  }));

  // 2. Upsert sniper_state
  console.log('☁️  Syncing state to Supabase...');
  const { error: stateError } = await supabase
    .from('sniper_state')
    .upsert({
      id: 'current',
      balance_sol: state.balance_sol,
      total_pnl_pct: ((state.balance_sol / 10) - 1) * 100, // assuming start balance = 10 SOL
      total_pnl_sol: state.total_pnl_sol,
      win_rate: state.total_trades > 0 ? (state.wins / state.total_trades) * 100 : 0,
      total_trades: state.total_trades,
      wins: state.wins,
      losses: state.losses,
      positions: positionsArray,
      peak_balance: state.peak_balance,
      max_drawdown: state.max_drawdown,
      start_time: state.start_time,
      updated_at: new Date().toISOString(),
    });

  if (stateError) {
    console.error('❌ Failed to sync state:', stateError);
    process.exit(1);
  }

  console.log('✅ State synced successfully');

  // 3. Sync trade history
  if (existsSync(HISTORY_FILE)) {
    console.log('📜 Reading trade history...');
    const lines = readFileSync(HISTORY_FILE, 'utf-8').trim().split('\n').filter(Boolean);
    const trades: TradeRecord[] = lines.map(l => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean) as TradeRecord[];

    console.log(`📤 Syncing ${trades.length} trades...`);

    // Get existing trades to avoid duplicates
    const { data: existingTrades } = await supabase
      .from('sniper_trades')
      .select('token, entry_time, exit_time')
      .limit(1000);

    const existingKeys = new Set(
      (existingTrades || []).map(t => `${t.token}-${t.entry_time || ''}-${t.exit_time || ''}`)
    );

    // Insert only new trades
    const newTrades = trades
      .filter(t => {
        const key = `${t.token}-${t.action === 'BUY' ? t.ts : ''}-${t.action === 'SELL' ? t.ts : ''}`;
        return !existingKeys.has(key);
      })
      .map(t => ({
        symbol: t.symbol,
        token: t.token,
        side: t.action,
        entry_price: t.action === 'BUY' ? t.price : null,
        exit_price: t.action === 'SELL' ? t.price : t.exit_price,
        pnl_pct: t.pnl_pct,
        pnl_sol: t.pnl_sol,
        size_sol: t.size_sol,
        size_usd: t.size_usd,
        score: t.score,
        reason: t.reason,
        entry_time: t.action === 'BUY' ? t.ts : null,
        exit_time: t.action === 'SELL' ? t.ts : null,
      }));

    if (newTrades.length > 0) {
      // Batch insert (Supabase supports up to 1000 rows per request)
      for (let i = 0; i < newTrades.length; i += 100) {
        const batch = newTrades.slice(i, i + 100);
        const { error: tradesError } = await supabase
          .from('sniper_trades')
          .insert(batch);

        if (tradesError) {
          console.error(`❌ Failed to sync trades batch ${i / 100 + 1}:`, tradesError);
        } else {
          console.log(`✅ Synced batch ${i / 100 + 1} (${batch.length} trades)`);
        }
      }
    } else {
      console.log('ℹ️  No new trades to sync');
    }
  }

  console.log('🎉 Sync complete!');
}

// Run if called directly
if (require.main === module) {
  syncToSupabase().catch(err => {
    console.error('💥 Sync failed:', err);
    process.exit(1);
  });
}

export { syncToSupabase };
