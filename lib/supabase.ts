import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Supabase] Missing env vars, running in fallback mode');
    return null;
  }

  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

// ==================== Leads / Waitlist ====================

export interface LeadRecord {
  id?: string;
  email?: string | null;
  wechat?: string | null;
  phone?: string | null;
  name?: string | null;
  source?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
  status?: string;
  priority?: string;
  owner?: string | null;
  tags?: string[];
  notes?: string | null;
  first_contact_at?: string | null;
  last_contact_at?: string | null;
  next_follow_up_at?: string | null;
  converted_at?: string | null;
  trial_started_at?: string | null;
  paid_plan?: string | null;
  created_at?: string;
  updated_at?: string;
}

export async function upsertLead(lead: LeadRecord): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const normalizedEmail = lead.email?.trim().toLowerCase() || null;
  const normalizedWechat = lead.wechat?.trim() || null;

  if (!normalizedEmail && !normalizedWechat) return false;

  try {
    let existing: { id: string } | null = null;

    if (normalizedEmail) {
      const { data } = await client.from('leads').select('id').eq('email', normalizedEmail).maybeSingle();
      existing = data;
    }

    if (!existing && normalizedWechat) {
      const { data } = await client.from('leads').select('id').eq('wechat', normalizedWechat).maybeSingle();
      existing = data;
    }

    const payload = {
      ...(existing?.id ? { id: existing.id } : {}),
      ...lead,
      email: normalizedEmail,
      wechat: normalizedWechat,
      source: lead.source || 'waitlist-page',
      status: lead.status || 'new',
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from('leads').upsert(payload);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Supabase] upsertLead error:', error);
    return false;
  }
}

// ==================== Practice ====================

export interface PracticePortfolio {
  user_id: string;
  tier: string;
  balance: number;
  start_balance: number;
  total_trades: number;
  wins: number;
  losses: number;
  best_trade_pct: number;
  worst_trade_pct: number;
  avg_hold_time_min: number;
  max_drawdown_pct: number;
  streak_current: number;
  streak_best: number;
  days_active: number;
  state: any;
  created_at: string;
  updated_at: string;
}

export interface PracticeTrade {
  id?: string;
  user_id: string;
  coin: string;
  side: string;
  entry_price: number;
  exit_price: number;
  size: number;
  leverage: number;
  pnl: number;
  pnl_pct: number;
  reason?: string;
  entry_time: string;
  exit_time: string;
  ai_score?: number;
  ai_advice?: string;
}

export async function getPracticePortfolio(userId: string): Promise<PracticePortfolio | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('practice_portfolios')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Supabase] getPracticePortfolio error:', error);
    return null;
  }
}

export async function savePracticePortfolio(portfolio: Partial<PracticePortfolio>): Promise<boolean> {
  const client = getSupabase();
  if (!client || !portfolio.user_id) return false;

  try {
    const { error } = await client
      .from('practice_portfolios')
      .upsert(
        {
          ...portfolio,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Supabase] savePracticePortfolio error:', error);
    return false;
  }
}

export async function savePracticeTrade(trade: PracticeTrade): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('practice_trades').insert([trade]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Supabase] savePracticeTrade error:', error);
    return false;
  }
}

export async function getPracticeTrades(userId: string, limit = 50): Promise<PracticeTrade[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('practice_trades')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] getPracticeTrades error:', error);
    return [];
  }
}

// ==================== Review ====================

export interface Review {
  id?: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  entries: any[];
  mood?: string;
  ai_diagnosis?: string;
  score?: number;
  created_at?: string;
  updated_at?: string;
}

export async function getReviews(userId: string, limit = 30): Promise<Review[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] getReviews error:', error);
    return [];
  }
}

export async function getReviewByDate(userId: string, date: string): Promise<Review | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[Supabase] getReviewByDate error:', error);
    return null;
  }
}

export async function saveReview(review: Review): Promise<boolean> {
  const client = getSupabase();
  if (!client || !review.user_id || !review.date) return false;

  try {
    const { error } = await client
      .from('reviews')
      .upsert(
        {
          ...review,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date' }
      );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Supabase] saveReview error:', error);
    return false;
  }
}

// ==================== Sniper ====================

export interface SniperState {
  id: string;
  balance_sol: number;
  total_pnl_pct: number;
  total_pnl_sol: number;
  win_rate: number;
  total_trades: number;
  wins: number;
  losses: number;
  positions: any[];
  peak_balance?: number;
  max_drawdown?: number;
  start_time?: string;
  updated_at: string;
}

export interface SniperTrade {
  id?: string;
  symbol?: string;
  token?: string;
  side?: string;
  entry_price?: number;
  exit_price?: number;
  pnl_pct?: number;
  pnl_sol?: number;
  size_sol?: number;
  size_usd?: number;
  score?: number;
  reason?: string;
  entry_time?: string;
  exit_time?: string;
}

export async function getSniperState(): Promise<SniperState | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('sniper_state')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[Supabase] getSniperState error:', error);
    return null;
  }
}

export async function updateSniperState(state: Partial<SniperState>): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('sniper_state')
      .upsert(
        {
          id: 'current',
          ...state,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Supabase] updateSniperState error:', error);
    return false;
  }
}

export async function saveSniperTrade(trade: SniperTrade): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('sniper_trades').insert([trade]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[Supabase] saveSniperTrade error:', error);
    return false;
  }
}

export async function getSniperTrades(limit = 100): Promise<SniperTrade[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('sniper_trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[Supabase] getSniperTrades error:', error);
    return [];
  }
}
