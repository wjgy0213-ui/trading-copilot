'use client';

import { useI18n } from '@/lib/i18n';
import {
  formatLocaleCurrency,
  formatLocaleDateTime,
  formatLocaleNumber,
  formatSignedLocalePercent,
} from '@/lib/i18n-helpers';

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

const SIDEBAR_TAB_IDS = ['tasks', 'agents', 'content', 'approvals', 'projects', 'memory', 'system', 'radar', 'factory', 'pipeline'] as const;
const SIDEBAR_TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tasks: LayoutGrid, agents: Bot, content: Sparkles, approvals: ClipboardCheck,
  projects: Briefcase, memory: FileText, system: Shield, radar: Radar,
  factory: Factory, pipeline: Layers3,
};

function timeAgo(isoStr: string, t: (key: string, fallback?: string) => string, locale: 'zh' | 'en'): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('missionControl.time.justNow');
  if (mins < 60) return t('missionControl.time.minutesAgo').replace('{mins}', formatLocaleNumber(mins, locale));
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('missionControl.time.hoursAgo').replace('{hrs}', formatLocaleNumber(hrs, locale));
  return t('missionControl.time.daysAgo').replace('{days}', formatLocaleNumber(Math.floor(hrs / 24), locale));
}

function formatUptime(isoStr: string, t: (key: string, fallback?: string) => string, locale: 'zh' | 'en'): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return t('missionControl.time.uptime').replace('{hrs}', formatLocaleNumber(hrs, locale)).replace('{mins}', formatLocaleNumber(mins, locale));
}

function formatUsd(value: number | undefined, locale: 'zh' | 'en', t: (key: string, fallback?: string) => string): string {
  if (value === undefined || Number.isNaN(value)) return t('missionControl.notAvailable');
  return formatLocaleCurrency(value, locale, 'USD', {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  });
}

function formatPct(value: number | undefined, locale: 'zh' | 'en', t: (key: string, fallback?: string) => string): string {
  if (value === undefined || Number.isNaN(value)) return t('missionControl.notAvailable');
  return formatSignedLocalePercent(value, locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
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
  const { t, locale } = useI18n();
  const [sniperData, setSniperData] = useState<SniperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
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
  const trades = useMemo(() => sniperData?.trades || [], [sniperData?.trades]);
  const { buys, sells } = useMemo(() => groupTrades(trades), [trades]);

  const topPositions = positions.slice(0, 4);
  const watchlistPositions = positions.slice(4, 8);
  const recentExits = sells.slice(0, 4);
  const recentEntries = buys.slice(0, 4);

  const avgScore = positions.length
    ? positions.reduce((acc, [, pos]) => acc + pos.score, 0) / positions.length
    : 0;

  if (!authenticated) {
    const submitPassword = () => {
      if (password === ADMIN_PASS) {
        setPasswordError('');
        setAuthenticated(true);
        return;
      }
      setPasswordError(t('missionControl.invalidPassword'));
    };

    return (
      <div className="min-h-screen bg-[#060816] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Factory className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">{t('missionControl.adminTitle')}</h1>
            <p className="mt-2 text-sm text-gray-500">{t('missionControl.adminRequired')}</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitPassword();
            }}
            placeholder={t('missionControl.password')}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyan-400/40"
          />
          <p className="mt-2 text-xs text-gray-500">{t('missionControl.enterKeyHint')}</p>
          {passwordError ? <p className="mt-2 text-xs text-red-300">{passwordError}</p> : null}
          <button
            onClick={submitPassword}
            className="mt-4 w-full rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            {t('missionControl.enterControl')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060816] flex items-center justify-center" role="status" aria-live="polite" aria-label={t('common.loading')}>
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/40 border-t-cyan-300" aria-hidden="true" />
        <span className="sr-only">{t('common.loading')}</span>
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
              <div className="text-sm font-semibold tracking-wide text-white">{t('missionControl.adminTitle')}</div>
              <div className="text-xs text-gray-500">{t('missionControl.taskOS')}</div>
            </div>
          </div>

          <nav className="space-y-1">
            {SIDEBAR_TAB_IDS.map((tabId) => {
              const Icon = SIDEBAR_TAB_ICONS[tabId];
              const active = tabId === activeTab;
              return (
                <button
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-white/8 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
                      : 'text-gray-500 hover:bg-white/4 hover:text-gray-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-cyan-300' : 'text-gray-500'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{t(`missionControl.tab.${tabId}`)}</div>
                    <div className="truncate text-[11px] text-gray-500">{t(`missionControl.hint.${tabId}`)}</div>
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
                  {t('missionControl.factoryView')}
                </div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('missionControl.title')}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {t('missionControl.desc')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-2 text-gray-400">
                  {t('missionControl.lastSync')} <span className="ml-2 text-gray-200">{formatLocaleDateTime(lastRefresh, locale, { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
                <button
                  onClick={fetchData}
                  aria-label={t('missionControl.refresh')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-cyan-200 transition hover:bg-cyan-400/15"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('missionControl.refresh')}
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6">
            <div className="mb-5 lg:hidden">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">{t('missionControl.mobileNav')}</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SIDEBAR_TAB_IDS.map((tabId) => {
                  const active = tabId === activeTab;
                  return (
                    <button
                      key={tabId}
                      onClick={() => setActiveTab(tabId)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                        active
                          ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
                          : 'border-white/10 bg-white/[0.03] text-gray-400'
                      }`}
                    >
                      {t(`missionControl.tab.${tabId}`)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[26px] border border-emerald-400/15 bg-emerald-400/[0.04] p-4 shadow-[0_0_40px_rgba(16,185,129,0.06)]">
                <div className="mb-3 flex items-center gap-2 text-xs text-emerald-200">
                  <Activity className="h-4 w-4" />
                  {t('missionControl.runtime')}
                </div>
                <div className="text-2xl font-semibold text-white">{t('missionControl.running')}</div>
                <div className="mt-1 text-xs text-gray-400">
                  {state?.start_time ? `${t('missionControl.uptime')} ${formatUptime(state.start_time, t, locale)}` : t('missionControl.waitingData')}
                </div>
              </div>

              <div className="rounded-[26px] border border-cyan-400/15 bg-cyan-400/[0.04] p-4 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
                <div className="mb-3 flex items-center gap-2 text-xs text-cyan-200">
                  <Wallet className="h-4 w-4" />
                  {t('missionControl.portfolio')}
                </div>
                <div className="text-2xl font-semibold text-white">
                  {portfolio ? t('missionControl.valueSol').replace('{value}', formatLocaleNumber(portfolio.total_value_sol, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace('{unit}', t('missionControl.solUnit')) : t('missionControl.notAvailable')}
                </div>
                <div className={`mt-1 text-xs ${
                  (portfolio?.total_pnl_pct || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  {portfolio ? `${formatPct(portfolio.total_pnl_pct, locale, t)} · ${formatUsd(portfolio.total_value_usd, locale, t)}` : t('missionControl.noPortfolio')}
                </div>
              </div>

              <div className="rounded-[26px] border border-violet-400/15 bg-violet-400/[0.04] p-4 shadow-[0_0_40px_rgba(168,85,247,0.06)]">
                <div className="mb-3 flex items-center gap-2 text-xs text-violet-200">
                  <TrendingUp className="h-4 w-4" />
                  {t('missionControl.throughput')}
                </div>
                <div className="text-2xl font-semibold text-white">{formatLocaleNumber(state?.total_trades || 0, locale)} {t('missionControl.trades')}</div>
                <div className="mt-1 text-xs text-gray-400">
                  {state
                    ? t('missionControl.winsLosses')
                        .replace('{wins}', formatLocaleNumber(state.wins, locale))
                        .replace('{losses}', formatLocaleNumber(state.losses, locale))
                        .replace('{winRate}', formatLocaleNumber(portfolio?.win_rate ?? 0, locale, { maximumFractionDigits: 0 }))
                    : t('missionControl.notAvailable')}
                </div>
              </div>

              <div className="rounded-[26px] border border-amber-400/15 bg-amber-400/[0.04] p-4 shadow-[0_0_40px_rgba(251,191,36,0.06)]">
                <div className="mb-3 flex items-center gap-2 text-xs text-amber-200">
                  <Shield className="h-4 w-4" />
                  {t('missionControl.riskGuard')}
                </div>
                <div className="text-2xl font-semibold text-white">
                  {state ? formatPct(-Math.abs(state.max_drawdown), locale, t) : t('missionControl.notAvailable')}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {t('missionControl.peak')} {state ? t('missionControl.valueSol').replace('{value}', formatLocaleNumber(state.peak_balance, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace('{unit}', t('missionControl.solUnit')) : t('missionControl.notAvailable')}
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.15fr_1.15fr_0.95fr]">
              <Column title={t('missionControl.backlog')} subtitle={t('missionControl.backlogDesc')} count={topPositions.length} tone="violet">
                {topPositions.length ? (
                  topPositions.map(([addr, pos]) => (
                    <TaskCard
                      key={addr}
                      tone="violet"
                      title={pos.symbol}
                      subtitle={t('missionControl.card.entryTokens')
                        .replace('{entry}', formatUsd(pos.entry_price, locale, t))
                        .replace('{tokens}', formatLocaleNumber(pos.tokens || 0, locale))}
                      meta={timeAgo(pos.entry_time, t, locale)}
                      score={t('missionControl.card.score').replace('{score}', formatLocaleNumber(pos.score, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))}
                      pnl={formatPct(pos.pnl_pct, locale, t)}
                      footer={t('missionControl.card.peakSize')
                        .replace('{peak}', formatUsd(pos.peak_price, locale, t))
                          .replace('{size}', formatLocaleNumber(pos.size_sol, locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 }))}
                    />
                  ))
                ) : (
                  <TaskCard tone="violet" title={t('missionControl.noBacklog')} subtitle={t('missionControl.waitingEntries')} footer={t('missionControl.noActivePos')} />
                )}
              </Column>

              <Column title={t('missionControl.building')} subtitle={t('missionControl.buildingDesc')} count={Math.max(watchlistPositions.length, recentEntries.length)} tone="blue">
                {recentEntries.length ? (
                  recentEntries.map((trade, idx) => (
                    <TaskCard
                      key={`${trade.symbol}-${trade.ts}-${idx}`}
                      tone="blue"
                      title={`${t(`missionControl.action.${trade.action}`)} ${trade.symbol}`}
                      subtitle={trade.reason || t('missionControl.newExecution')}
                      meta={timeAgo(trade.ts, t, locale)}
                      score={trade.score !== undefined ? t('missionControl.card.score').replace('{score}', formatLocaleNumber(trade.score, locale, { maximumFractionDigits: 0 })) : undefined}
                      footer={trade.size_sol !== undefined ? t('missionControl.card.size').replace('{size}', formatLocaleNumber(trade.size_sol, locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 })) : t('missionControl.awaitingDetail')}
                    />
                  ))
                ) : null}

                {watchlistPositions.map(([addr, pos]) => (
                  <TaskCard
                    key={addr}
                    tone="blue"
                    title={t('missionControl.card.watch').replace('{symbol}', pos.symbol)}
                    subtitle={t('missionControl.card.currentEntry')
                      .replace('{current}', formatUsd(pos.current_price, locale, t))
                      .replace('{entry}', formatUsd(pos.entry_price, locale, t))}
                    meta={timeAgo(pos.entry_time, t, locale)}
                      score={t('missionControl.card.score').replace('{score}', formatLocaleNumber(pos.score, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))}
                      pnl={formatPct(pos.pnl_pct, locale, t)}
                    footer={`${t('missionControl.dexReady')} · ${pos.partial_sold ? t('missionControl.partialSold') : t('missionControl.fullPosLive')}`}
                  />
                ))}

                {!recentEntries.length && !watchlistPositions.length ? (
                  <TaskCard tone="blue" title={t('missionControl.noBuildLane')} subtitle={t('missionControl.noBuildItems')} footer={t('missionControl.factoryQuiet')} />
                ) : null}
              </Column>

              <Column title={t('missionControl.qa')} subtitle={t('missionControl.qaDesc')} count={Math.max(recentExits.length, 3)} tone="amber">
                {recentExits.length ? (
                  recentExits.map((trade, idx) => (
                    <TaskCard
                      key={`${trade.symbol}-${trade.ts}-${idx}`}
                      tone="amber"
                      title={`${t(`missionControl.action.${trade.action}`)} ${trade.symbol}`}
                      subtitle={trade.reason || t('missionControl.exitRecorded')}
                      meta={timeAgo(trade.ts, t, locale)}
                      pnl={trade.pnl_pct !== undefined ? formatPct(trade.pnl_pct, locale, t) : undefined}
                      footer={trade.size_sol !== undefined ? t('missionControl.card.closed').replace('{size}', formatLocaleNumber(trade.size_sol, locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 })) : t('missionControl.exitSnapshot')}
                    />
                  ))
                ) : (
                  <TaskCard tone="amber" title={t('missionControl.noRecentExits')} subtitle={t('missionControl.qaClean')} footer={t('missionControl.noSellEvents')} />
                )}

                <TaskCard
                  tone="amber"
                  title={t('missionControl.systemHealth')}
                  subtitle={t('missionControl.card.dataSource').replace('{source}', sniperData?.source || t('missionControl.unknownSource'))}
                  score={t('missionControl.card.avgScore').replace('{score}', avgScore ? formatLocaleNumber(avgScore, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : t('missionControl.notAvailable'))}
                  footer={t('missionControl.card.cashSol')
                    .replace('{cash}', state ? t('missionControl.valueSol').replace('{value}', formatLocaleNumber(state.balance_sol, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace('{unit}', t('missionControl.solUnit')) : t('missionControl.notAvailable'))
                    .replace('{solPrice}', portfolio ? formatUsd(portfolio.sol_price, locale, t) : t('missionControl.notAvailable'))}
                />

                <TaskCard
                  tone="amber"
                  title={t('missionControl.executionNote')}
                  subtitle={t('missionControl.executionNoteDesc')}
                  footer={t('missionControl.card.activeTabShell').replace('{tab}', t(`missionControl.tab.${activeTab}`))}
                />
              </Column>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">{t('missionControl.recentTape')}</div>
                    <div className="mt-1 text-xs text-gray-500">{t('missionControl.tapeDesc')}</div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-400">
                    {formatLocaleNumber(trades.length, locale)} {t('missionControl.events')}
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
                          <span className="text-xs text-gray-500">{t(`missionControl.action.${trade.action}`)}</span>
                          {trade.score !== undefined ? (
                            <span className="rounded-full border border-white/8 px-2 py-0.5 text-[11px] text-gray-300">
                              {formatLocaleNumber(trade.score, locale, { maximumFractionDigits: 0 })}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 truncate text-xs text-gray-500">{trade.reason || t('missionControl.noReasonLogged')}</div>
                      </div>
                      <div className="text-right text-xs">
                        {trade.pnl_pct !== undefined ? (
                          <div className={trade.pnl_pct >= 0 ? 'text-emerald-300' : 'text-red-300'}>{formatPct(trade.pnl_pct, locale, t)}</div>
                        ) : (
                          <div className="text-gray-400">—</div>
                        )}
                        <div className="mt-1 text-gray-600">{timeAgo(trade.ts, t, locale)}</div>
                      </div>
                    </div>
                  ))}

                  {!trades.length ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-gray-500">
                      {t('missionControl.noTradeActivity')}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-cyan-300" />
                  <div>
                    <div className="text-sm font-semibold text-white">{t('missionControl.operatorNotes')}</div>
                    <div className="text-xs text-gray-500">{t('missionControl.notesDesc')}</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-300">
                  <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                    <div className="mb-1 font-medium text-white">{t('missionControl.note1Title')}</div>
                    <div className="text-xs leading-5 text-gray-500">
                      {t('missionControl.note1Desc')}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                    <div className="mb-1 font-medium text-white">{t('missionControl.note2Title')}</div>
                    <div className="text-xs leading-5 text-gray-500">
                      {t('missionControl.note2Desc')}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                    <div className="mb-1 font-medium text-white">{t('missionControl.note3Title')}</div>
                    <div className="text-xs leading-5 text-gray-500">
                      {t('missionControl.note3Desc')}
                    </div>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 text-xs text-cyan-200">
                  <ChevronRight className="h-3.5 w-3.5" />
                  {t('missionControl.currentNote')}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
