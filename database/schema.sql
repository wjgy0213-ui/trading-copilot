-- Trading Copilot Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends NextAuth)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null, -- NextAuth user id
  display_name text,
  tier text default 'free', -- free/pro/elite
  created_at timestamptz default now()
);

-- Practice: virtual portfolio
create table practice_portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  tier text default 'bronze', -- bronze/silver/gold/platinum
  balance numeric default 10000,
  start_balance numeric default 10000,
  total_trades int default 0,
  wins int default 0,
  losses int default 0,
  best_trade_pct numeric default 0,
  worst_trade_pct numeric default 0,
  avg_hold_time_min numeric default 0,
  max_drawdown_pct numeric default 0,
  streak_current int default 0,
  streak_best int default 0,
  days_active int default 0,
  state jsonb default '{}', -- full PracticeState object for compatibility
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Practice: trade history  
create table practice_trades (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  coin text not null,
  side text not null, -- long/short
  entry_price numeric not null,
  exit_price numeric not null,
  size numeric not null,
  leverage numeric not null,
  pnl numeric not null,
  pnl_pct numeric not null,
  reason text,
  entry_time timestamptz not null,
  exit_time timestamptz not null,
  ai_score int,
  ai_advice text,
  created_at timestamptz default now()
);

-- Create index for user queries
create index practice_trades_user_id_idx on practice_trades(user_id, created_at desc);

-- Review: trade journal
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  date date not null,
  entries jsonb default '[]', -- array of trade entries
  mood text, -- emotion tag
  ai_diagnosis text,
  score int,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Create index for user+date queries
create index reviews_user_date_idx on reviews(user_id, date desc);

-- Sniper: public dashboard data (no user_id, global)
create table sniper_state (
  id text primary key default 'current',
  balance_sol numeric,
  total_pnl_pct numeric,
  total_pnl_sol numeric,
  win_rate numeric,
  total_trades int,
  wins int,
  losses int,
  positions jsonb default '[]',
  peak_balance numeric,
  max_drawdown numeric,
  start_time timestamptz,
  updated_at timestamptz default now()
);

-- Sniper: trade history
create table sniper_trades (
  id uuid primary key default gen_random_uuid(),
  symbol text,
  token text,
  side text,
  entry_price numeric,
  exit_price numeric,
  pnl_pct numeric,
  pnl_sol numeric,
  size_sol numeric,
  size_usd numeric,
  score numeric,
  reason text,
  entry_time timestamptz,
  exit_time timestamptz,
  created_at timestamptz default now()
);

-- Create index for time-based queries
create index sniper_trades_created_at_idx on sniper_trades(created_at desc);

-- Insert initial Sniper state
insert into sniper_state (id, balance_sol, total_pnl_pct, total_pnl_sol, win_rate, total_trades, wins, losses, positions)
values ('current', 10.0, 0, 0, 0, 0, 0, 0, '[]'::jsonb)
on conflict (id) do nothing;

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table practice_portfolios enable row level security;
alter table practice_trades enable row level security;
alter table reviews enable row level security;
alter table sniper_state enable row level security;
alter table sniper_trades enable row level security;

-- Profiles: users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid()::text = user_id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid()::text = user_id);

-- Practice portfolios: users can access their own
create policy "Users can read own portfolio"
  on practice_portfolios for select
  using (auth.uid()::text = user_id);

create policy "Users can insert own portfolio"
  on practice_portfolios for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update own portfolio"
  on practice_portfolios for update
  using (auth.uid()::text = user_id);

-- Practice trades: users can access their own
create policy "Users can read own trades"
  on practice_trades for select
  using (auth.uid()::text = user_id);

create policy "Users can insert own trades"
  on practice_trades for insert
  with check (auth.uid()::text = user_id);

-- Reviews: users can access their own
create policy "Users can read own reviews"
  on reviews for select
  using (auth.uid()::text = user_id);

create policy "Users can insert own reviews"
  on reviews for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update own reviews"
  on reviews for update
  using (auth.uid()::text = user_id);

-- Sniper: public read-only (no auth required)
create policy "Sniper state is public"
  on sniper_state for select
  using (true);

create policy "Sniper trades are public"
  on sniper_trades for select
  using (true);

-- Service role can do anything (for backend API calls)
-- These are handled automatically by Supabase when using the service key
