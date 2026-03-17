'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Bot,
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  Factory,
  FileText,
  Gauge,
  Layers3,
  LayoutGrid,
  Radar,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';

interface Position {
  symbol: string;
  entry_price: number;
  size_sol: number;
  size_usd: number;
  tokens: number;
  entry_time: string;
  peak_price: number;
  score: number;
  partial_sold: boolean;
  current_price: number;
  pnl_pct: number;
  pnl_usd: number;
  address?: string;
}

interface Trade {
  action: 'BUY' | 'SELL';
  symbol: string;
  score?: number;
  size_sol?: number;
  pnl_pct?: number;
  reason?: string;
  ts: string;
}

interface SniperData {
  state: {
    balance_sol: number;
    positions: Record<string, Position>;
    total_trades: number;
    wins: number;
    losses: number;
    total_pnl_sol: number;
    max_drawdown: number;
    peak_balance: number;
    start_time: string;
  };
  portfolio: {
    total_value_sol: number;
    total_value_usd: number;
    total_pnl_pct: number;
    win_rate: number;
    sol_price: number;
  };
  trades: Trade[];
  source?: string;
}

const ADMIN_PASS = '0sw-wx3NdFPNvEqIeEdi4rGnD-FGnyk8';

type SidebarTab = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
};

const SIDEBAR_TABS: SidebarTab[] = [
  { id: 'tasks', label: 'Tasks', icon: LayoutGrid, hint: 'mission queue' },
  { id: 'agents', label: 'Agents', icon: Bot, hint: 'worker status' },
  { id: 'content', label: 'Content', icon: Sparkles, hint: 'publish flow' },
  { id: 'approvals', label: 'Approvals', icon: ClipboardCheck, hint: 'needs review' },
  { id: 'projects', label: 'Projects', icon: Briefcase, hint: 'active bets' },
  { id: 'memory', label: 'Memory', icon: FileText, hint: 'recent context' },
  { id: 'system', label: 'System', icon: Shield, hint: 'runtime health' },
  { id: 'radar', label: 'Radar', icon: Radar, hint: 'signals & news' },
  { id: 'factory', label: 'Factory', icon: Factory, hint: 'build pipeline' },
  { id: 'pipeline', label: 'Pipeline', icon: Layers3, hint: 'execution lanes' },
];

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatUptime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

function formatUsd(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function formatPct(value?: number): string {
  if (value === undefined || Number.isNaN(value)) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function groupTrades(trades: Trade[]) {
  const buys = trades.filter((t) => t.action === 'BUY');
  const sells = trades.filter((t) => t.action === 'SELL');
  return { buys, sells };
}

function columnTone(type: 'blue' | 'amber' | 'violet') {
  if (type === 'blue') {
    return {
      frame: 'border-cyan-500/20 bg-cyan-500/[0.03]',
      pill: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
      dot: 'bg-cyan-300',
      glow: 'shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_45px_rgba(34,211,238,0.08)]',
      accent: 'from-cyan-500/30 via-cyan-400/10 to-transparent',
    };
  }
  if (type === 'amber') {
    return {
      frame: 'border-amber-500/20 bg-amber-500/[0.03]',
      pill: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
      dot: 'bg-amber-300',
      glow: 'shadow-[0_0_0_1px_rgba(251,191,36,0.08),0_0_45px_rgba(251,191,36,0.08)]',
      accent: 'from-amber-500/30 via-amber-400/10 to-transparent',
    };
  }
  return {
    frame: 'border-violet-500/20 bg-violet-500/[0.03]',
    pill: 'border-violet-400/25 bg-violet-400/10 text-violet-100',
    dot: 'bg-violet-300',
    glow: 'shadow-[0_0_0_1px_rgba(168,85,247,0.08),0_0_45px_rgba(168,85,247,0.08)]',
    accent: 'from-violet-500/30 via-violet-400/10 to-transparent',
  };
}

function TaskCard({
  title,
  subtitle,
  meta,
  score,
  pnl,
  footer,
  tone = 'blue',
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  score?: string;
  pnl?: string;
  footer?: string;
  tone?: 'blue' | 'amber' | 'violet';
}) {
  const styles = columnTone(tone);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border px-5 py-4 backdrop-blur-sm ${styles.frame} ${styles.glow}`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${styles.accent}`} />
      <div className="relative">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="text-[15px] font-semibold leading-5 text-white">{title}</div>
            {subtitle ? <div className="mt-1 text-xs text-gray-400">{subtitle}</div> : null}
          </div>
          {meta ? <div className="shrink-0 text-[11px] text-gray-500">{meta}</div> : null}
        </div>

        {(score || pnl) && (
          <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
            {score ? <span className={`rounded-full border px-2.5 py-1 ${styles.pill}`}>{score}</span> : null}
            {pnl ? (
              <span
                className={`rounded-full border px-2.5 py-1 ${
                  pnl.startsWith('-')
                    ? 'border-red-400/25 bg-red-400/10 text-red-200'
                    : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
                }`}
              >
                {pnl}
              </span>
            ) : null}
          </div>
        )}

        {footer ? <div className="text-xs text-gray-500">{footer}</div> : null}
      </div>
    </div>
  );
}

function Column({
  title,
  subtitle,
  count,
  tone,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  tone: 'blue' | 'amber' | 'violet';
  children: React.ReactNode;
}) {
  const styles = columnTone(tone);

  return (
    <div className={`relative rounded-[30px] border p-4 ${styles.frame}`}>
      <div className={`pointer-events-none absolute left-5 top-20 bottom-5 w-px bg-gradient-to-b ${styles.accent}`} />
      <div className="mb-4 flex items-start justify-between gap-4 pl-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gray-300">{title}</h3>
          </div>
          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs ${styles.pill}`}>{count}</span>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function MissionControlPage() {
  const [sniperData, setSniperData] = useState<SniperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('factory');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/sniper');
      if (res.ok) {
        const data = await res.json();
        setSniperData(data);
        setLastRefresh(new Date());
      }
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchData();
    const iv = setInterval(fetchData, 15000);
    return () => clearInterval(iv);
  }, [authenticated, fetchData]);

  const state = sniperData?.state;
  const portfolio = sniperData?.portfolio;
  const positions = useMemo(
    () => (state ? Object.entries(state.positions).sort(([, a], [, b]) => b.score - a.score) : []),
    [state]
  );
  const trades = sniperData?.trades || [];
  const { buys, sells } = useMemo(() => groupTrades(trades), [trades]);

  const topPositions = positions.slice(0, 4);
  const watchlistPositions = positions.slice(4, 8);
  const recentExits = sells.slice(0, 4);
  const recentEntries = buys.slice(0, 4);

  const avgScore = positions.length
    ? positions.reduce((acc, [, pos]) => acc + pos.score, 0) / positions.length
    : 0;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#060816] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Factory className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">Mission Control</h1>
            <p className="mt-2 text-sm text-gray-500">Admin access required</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password === ADMIN_PASS) setAuthenticated(true);
            }}
            placeholder="Password"
            className="mb-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
          />
          <button
            onClick={() => {
              if (password === ADMIN_PASS) setAuthenticated(true);
            }}
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Enter Control Center
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060816] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/40 border-t-cyan-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-[248px] shrink-0 border-r border-white/6 bg-black/30 px-4 py-5 lg:block">
          <div className="mb-6 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide text-white">Mission Control</div>
              <div className="text-xs text-gray-500">Task operating system</div>
            </div>
          </div>

          <nav className="space-y-1">
            {SIDEBAR_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-white/8 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
                      : 'text-gray-500 hover:bg-white/4 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-cyan-300' : 'text-gray-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{tab.label}</div>
                    <div className="truncate text-[11px] text-gray-500">{tab.hint}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-hidden">
          <div className="border-b border-white/6 bg-black/20 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-cyan-300/80">
                  <Gauge className="h-3.5 w-3.5" />
                  Factory view
                </div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">任务控制中心</h1>
                <p className="mt-1 text-sm text-gray-500">
                  按左侧 tab 组织任务流，当前先聚焦 Mission Control / Factory 的执行界面。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2 text-gray-400">
                  Last sync <span className="ml-2 text-gray-200">{lastRefresh.toLocaleTimeString()}</span>
                </div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-cyan-200 transition hover:bg-cyan-400/15"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[26px] border border-emerald-400/15 bg-emerald-400/[0.04] p-4 shadow-[0_0_40px_rgba(16,185,129,0.06)]">
                <div className="mb-3 flex items-center gap-2 text-xs text-emerald-200">
                  <Activity className="h-4 w-4" />
                  Runtime
                </div>
                <div className="text-2xl font-semibold text-white">Running</div>
                <div className="mt-1 text-xs text-gray-400">
                  {state?.start_time ? `Uptime ${formatUptime(state.start_time)}` : 'Waiting for data'}
                </div>
              </div>

              <div className="rounded-[26px] border border-cyan-400/15 bg-cyan-400/[0.04] p-4 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
                <div className="mb-3 flex items-center gap-2 text-xs text-cyan-200">
                  <Wallet className="h-4 w-4" />
                  Portfolio
                </div>
                <div className="text-2xl font-semibold text-white">
                  {portfolio ? `${portfolio.total_value_sol.toFixed(2)} SOL` : 'N/A'}
                </div>
                <div className={`mt-1 text-xs ${
                  (portfolio?.total_pnl_pct || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  {portfolio ? `${formatPct(portfolio.total_pnl_pct)} · ${formatUsd(portfolio.total_value_usd)}` : 'No portfolio snapshot'}
                </div>
              </div>

              <div className="rounded-[26px] border border-violet-400/15 bg-violet-400/[0.04] p-4 shadow-[0_0_40px_rgba(168,85,247,0.06)]">
                <div className="mb-3 flex items-center gap-2 text-xs text-violet-200">
                  <TrendingUp className="h-4 w-4" />
                  Throughput
                </div>
                <div className="text-2xl font-semibold text-white">{state?.total_trades || 0} trades</div>
                <div className="mt-1 text-xs text-gray-400">
                  {state ? `${state.wins}W / ${state.losses}L · ${portfolio?.win_rate.toFixed(0)}% win rate` : 'N/A'}
                </div>
              </div>

              <div className="rounded-[26px] border border-amber-400/15 bg-amber-400/[0.04] p-4 shadow-[0_0_40px_rgba(251,191,36,0.06)]">
                <div className="mb-3 flex items-center gap-2 text-xs text-amber-200">
                  <Shield className="h-4 w-4" />
                  Risk guard
                </div>
                <div className="text-2xl font-semibold text-white">
                  {state ? `${state.max_drawdown.toFixed(1)}%` : 'N/A'}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Peak {state ? `${state.peak_balance.toFixed(2)} SOL` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.15fr_1.15fr_0.95fr]">
              <Column title="Backlog" subtitle="Highest-conviction positions currently in play" count={topPositions.length} tone="violet">
                {topPositions.length ? (
                  topPositions.map(([addr, pos]) => (
                    <TaskCard
                      key={addr}
                      tone="violet"
                      title={pos.symbol}
                      subtitle={`Entry ${formatUsd(pos.entry_price)} · ${pos.tokens?.toLocaleString() || 0} tokens`}
                      meta={timeAgo(pos.entry_time)}
                      score={`Score ${pos.score.toFixed(1)}`}
                      pnl={formatPct(pos.pnl_pct)}
                      footer={`Peak ${formatUsd(pos.peak_price)} · Size ${pos.size_sol.toFixed(3)} SOL`}
                    />
                  ))
                ) : (
                  <TaskCard tone="violet" title="No live backlog" subtitle="Waiting for qualified entries" footer="No active positions in this lane." />
                )}
              </Column>

              <Column title="Building" subtitle="Fresh entries and watch items moving through execution" count={Math.max(watchlistPositions.length, recentEntries.length)} tone="blue">
                {recentEntries.length ? (
                  recentEntries.map((trade, idx) => (
                    <TaskCard
                      key={`${trade.symbol}-${trade.ts}-${idx}`}
                      tone="blue"
                      title={`${trade.action} ${trade.symbol}`}
                      subtitle={trade.reason || 'New execution logged'}
                      meta={timeAgo(trade.ts)}
                      score={trade.score !== undefined ? `Score ${trade.score.toFixed(0)}` : undefined}
                      footer={trade.size_sol !== undefined ? `Size ${trade.size_sol.toFixed(3)} SOL` : 'Awaiting more detail'}
                    />
                  ))
                ) : null}

                {watchlistPositions.map(([addr, pos]) => (
                  <TaskCard
                    key={addr}
                    tone="blue"
                    title={`Watch ${pos.symbol}`}
                    subtitle={`Current ${formatUsd(pos.current_price)} · Entry ${formatUsd(pos.entry_price)}`}
                    meta={timeAgo(pos.entry_time)}
                    score={`Score ${pos.score.toFixed(1)}`}
                    pnl={formatPct(pos.pnl_pct)}
                    footer={`Dexscreener ready · ${pos.partial_sold ? 'Partial sold' : 'Full position live'}`}
                  />
                ))}

                {!recentEntries.length && !watchlistPositions.length ? (
                  <TaskCard tone="blue" title="No active build lane" subtitle="No recent buys or watchlist items" footer="Factory is quiet right now." />
                ) : null}
              </Column>

              <Column title="QA" subtitle="Closed-loop checks, exits, and system sanity" count={Math.max(recentExits.length, 3)} tone="amber">
                {recentExits.length ? (
                  recentExits.map((trade, idx) => (
                    <TaskCard
                      key={`${trade.symbol}-${trade.ts}-${idx}`}
                      tone="amber"
                      title={`${trade.action} ${trade.symbol}`}
                      subtitle={trade.reason || 'Exit recorded'}
                      meta={timeAgo(trade.ts)}
                      pnl={trade.pnl_pct !== undefined ? formatPct(trade.pnl_pct) : undefined}
                      footer={trade.size_sol !== undefined ? `Closed ${trade.size_sol.toFixed(3)} SOL` : 'Exit snapshot'}
                    />
                  ))
                ) : (
                  <TaskCard tone="amber" title="No recent exits" subtitle="QA lane is clean" footer="No sell-side events in the recent buffer." />
                )}

                <TaskCard
                  tone="amber"
                  title="System health"
                  subtitle={`Data source: ${sniperData?.source || 'unknown source'}`}
                  score={`Avg score ${avgScore ? avgScore.toFixed(1) : 'N/A'}`}
                  footer={`Cash balance ${state ? `${state.balance_sol.toFixed(2)} SOL` : 'N/A'} · SOL ${portfolio ? formatUsd(portfolio.sol_price) : 'N/A'}`}
                />

                <TaskCard
                  tone="amber"
                  title="Execution note"
                  subtitle="This page is now laid out as a left-tab operating system"
                  footer={`Active tab: ${activeTab} · Mission Control shell ready for more modules`}
                />
              </Column>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Recent execution tape</div>
                    <div className="mt-1 text-xs text-gray-500">Latest activity flowing through the control center</div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-400">
                    {trades.length} events
                  </span>
                </div>

                <div className="space-y-2">
                  {trades.slice(0, 8).map((trade, i) => (
                    <div
                      key={`${trade.symbol}-${trade.ts}-${i}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-3"
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          trade.action === 'BUY'
                            ? 'bg-emerald-400/10 text-emerald-300'
                            : 'bg-red-400/10 text-red-300'
                        }`}
                      >
                        {trade.action === 'BUY' ? '↑' : '↓'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{trade.symbol}</span>
                          <span className="text-xs text-gray-500">{trade.action}</span>
                          {trade.score !== undefined ? (
                            <span className="rounded-full border border-white/8 px-2 py-0.5 text-[11px] text-gray-300">
                              {trade.score.toFixed(0)}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 truncate text-xs text-gray-500">{trade.reason || 'No reason logged'}</div>
                      </div>
                      <div className="text-right text-xs">
                        {trade.pnl_pct !== undefined ? (
                          <div className={trade.pnl_pct >= 0 ? 'text-emerald-300' : 'text-red-300'}>{formatPct(trade.pnl_pct)}</div>
                        ) : (
                          <div className="text-gray-400">—</div>
                        )}
                        <div className="mt-1 text-gray-600">{timeAgo(trade.ts)}</div>
                      </div>
                    </div>
                  ))}

                  {!trades.length ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-gray-500">
                      No trade activity yet.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-cyan-300" />
                  <div>
                    <div className="text-sm font-semibold text-white">Operator notes</div>
                    <div className="text-xs text-gray-500">What this redesign is optimizing for</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                    <div className="mb-1 font-medium text-white">1. 左侧 tab 固定导航</div>
                    <div className="text-xs leading-5 text-gray-500">
                      先把页面结构做成更像操作系统 / 控制中心，而不是普通 dashboard。
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                    <div className="mb-1 font-medium text-white">2. 中间多列任务流</div>
                    <div className="text-xs leading-5 text-gray-500">
                      用 Backlog / Building / QA 三列承接任务推进感，更接近你给的参考图。
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                    <div className="mb-1 font-medium text-white">3. 为后续模块预留壳</div>
                    <div className="text-xs leading-5 text-gray-500">
                      现在先把 shell 和观感拉齐，后面再把 approvals、content、agents 等真实数据逐步接进来。
                    </div>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 text-xs text-cyan-200">
                  <ChevronRight className="h-3.5 w-3.5" />
                  当前这版适合作为任务控制中心 V2 外观底板
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
