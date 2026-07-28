'use client';

import { useCallback, useEffect, useState } from 'react';
import { Shield, AlertTriangle, TrendingDown, Link2, Zap, Target, RefreshCw, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { formatLocaleCurrency, formatLocaleNumber } from '@/lib/i18n-helpers';

interface RiskScore {
  overall: number;
  concentration: number;
  leverage: number;
  drawdown: number;
  correlation: number;
  liquidation: number;
}

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  leverage: number;
  unrealizedPnl: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
}

interface RiskData {
  score: RiskScore;
  alerts: { level: 'info' | 'warning' | 'critical'; categoryKey: 'status' | 'concentration' | 'leverage' | 'drawdown' | 'correlation' | 'liquidation'; category: string; title: string; detail: string; action: string }[];
  positions: Position[];
  balance: number;
  totalNotional: number;
  totalPnl: number;
}

const DIMENSIONS = [
  { key: 'concentration', labelKey: 'guardian.concentration', icon: Target, descKey: 'guardian.concentration_desc' },
  { key: 'leverage', labelKey: 'guardian.leverage', icon: Zap, descKey: 'guardian.leverage_desc' },
  { key: 'drawdown', labelKey: 'guardian.drawdown', icon: TrendingDown, descKey: 'guardian.drawdown_desc' },
  { key: 'correlation', labelKey: 'guardian.correlation', icon: Link2, descKey: 'guardian.correlation_desc' },
  { key: 'liquidation', labelKey: 'guardian.liquidation', icon: AlertTriangle, descKey: 'guardian.liquidation_desc' },
] as const;

function ScoreGauge({ score }: { score: number }) {
  const { t } = useI18n();
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : score >= 20 ? '#f97316' : '#ef4444';
  const label = score >= 80 ? t('guardian.safe') : score >= 60 ? t('guardian.good') : score >= 40 ? t('guardian.caution') : score >= 20 ? t('guardian.danger') : t('guardian.critical');
  const circumference = 2 * Math.PI * 58;
  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 128 128" style={{ transform: 'rotate(135deg)' }}>
        <circle cx="64" cy="64" r="58" fill="none" stroke="#1f2937" strokeWidth="10" strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} strokeLinecap="round" />
        <circle cx="64" cy="64" r="58" fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${circumference * 0.75 * (score / 100)} ${circumference}`} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-sm font-medium mt-1" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, icon: Icon, desc }: { label: string; score: number; icon: LucideIcon; desc?: string }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : score >= 20 ? 'bg-orange-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-blue-400' : score >= 40 ? 'text-yellow-400' : score >= 20 ? 'text-orange-400' : 'text-red-400';

  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className={`w-4 h-4 ${textColor} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-300">{label}</span>
          <span className={`text-xs font-bold ${textColor}`}>{score}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-[10px] text-gray-600">{desc}</span>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: RiskData['alerts'][0] }) {
  const { t } = useI18n();
  const styles = {
    critical: 'border-red-500/30 bg-red-500/5',
    warning: 'border-yellow-500/30 bg-yellow-500/5',
    info: 'border-emerald-500/30 bg-emerald-500/5',
  };
  const icons = { critical: '🔴', warning: '⚠️', info: '✅' };

  return (
    <div className={`border rounded-lg p-3 ${styles[alert.level]}`}>
      <div className="flex items-start gap-2">
        <span className="text-sm">{icons[alert.level]}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-200">{alert.title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{alert.category || t(`guardian.alertCategory.${alert.categoryKey}`, alert.categoryKey)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{alert.detail}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-300">
            <ChevronRight className="w-3 h-3" />
            <span>{alert.action}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PositionRow({ p }: { p: Position }) {
  const { t, locale } = useI18n();
  const pnlColor = p.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400';
  const liqDist = p.liquidationPrice > 0 ? Math.abs(p.markPrice - p.liquidationPrice) / p.markPrice * 100 : 999;
  const liqColor = liqDist < 5 ? 'text-red-400' : liqDist < 10 ? 'text-yellow-400' : 'text-gray-400';
  const sideLabel = p.side === 'LONG' ? t('guardian.long') : p.side === 'SHORT' ? t('guardian.short') : p.side;
  const leverageLabel = t('guardian.leverageValue').replace('{value}', formatLocaleNumber(p.leverage, locale, { maximumFractionDigits: 0 }));

  return (
    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-800/20 rounded">
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.side === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {sideLabel}
        </span>
        <span className="text-sm font-mono font-semibold text-gray-200">{p.symbol}</span>
        <span className="text-xs text-gray-500">{leverageLabel}</span>
      </div>
      <div className="flex items-center gap-6 text-right">
        <div>
          <div className="text-xs text-gray-500">{t('guardian.position_size')}</div>
          <div className="text-sm text-gray-300">{formatLocaleCurrency(p.size, locale, 'USD', { maximumFractionDigits: 0 })}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('guardian.unrealized_pnl')}</div>
          <div className={`text-sm font-semibold ${pnlColor}`}>{p.unrealizedPnl >= 0 ? '+' : ''}{formatLocaleCurrency(Math.abs(p.unrealizedPnl), locale, 'USD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('guardian.liq_distance')}</div>
          <div className={`text-sm font-semibold ${liqColor}`}>{formatLocaleNumber(liqDist, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</div>
        </div>
      </div>
    </div>
  );
}

export default function GuardianPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/risk-guardian?mode=demo');
      const nextData = await response.json() as RiskData;
      setData(nextData);
    } catch {
      // Keep the last successful snapshot when a refresh fails.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    setRefreshing(true);
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [fetchData, refreshData]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">{t('guardian.loading')}</div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="text-red-400">{t('guardian.error')}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-orange-400" />
              <h1 className="text-2xl font-bold text-gray-100">{t('guardian.title')}</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('guardian.subtitle')}</p>
          </div>
          <button
            onClick={refreshData}
            aria-label={t('guardian.refreshAria')}
            title={t('guardian.refreshAria')}
            className={`p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Score + Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 flex flex-col items-center">
            <ScoreGauge score={data.score.overall} />
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span>{t('guardian.positionsCountValue').replace('{count}', formatLocaleNumber(data.positions.length, locale))}</span>
              <span>{t('guardian.totalExposureValue').replace('{value}', formatLocaleCurrency(data.totalNotional, locale, 'USD', { maximumFractionDigits: 0 }))}</span>
              <span className={data.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {t('guardian.unrealizedPnlValue').replace('{value}', `${data.totalPnl >= 0 ? '+' : ''}${formatLocaleCurrency(Math.abs(data.totalPnl), locale, 'USD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
              </span>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-gray-400 mb-2">{t('guardian.five_dims')}</h3>
            {DIMENSIONS.map(d => (
              <DimensionBar key={d.key} label={t(d.labelKey)} score={data.score[d.key]} icon={d.icon} desc={t(d.descKey)} />
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">{t('guardian.alerts')}</h2>
          <div className="space-y-2">
            {data.alerts.map((a, i) => <AlertCard key={i} alert={a} />)}
          </div>
        </div>

        {/* Positions */}
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800/50">
            <h3 className="text-sm font-semibold text-gray-300">{t('guardian.current_positions')}</h3>
          </div>
          <div className="divide-y divide-gray-800/20">
            {data.positions.map((p, i) => <PositionRow key={i} p={p} />)}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6 bg-gradient-to-r from-orange-500/5 to-red-500/5 border border-orange-500/10 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">{t('guardian.demo_title')}</p>
          <p className="text-xs text-gray-500 mb-4">{t('guardian.demo_desc')}</p>
          <a href="/elite" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition">
            <Shield className="w-4 h-4" /> {t('guardian.connect_exchange')}
          </a>
        </div>
      </div>
    </div>
  );
}
