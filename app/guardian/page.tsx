'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, TrendingDown, Layers, Link2, Zap, Target, RefreshCw, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface RiskData {
  score: { overall: number; concentration: number; leverage: number; drawdown: number; correlation: number; liquidation: number };
  alerts: { level: 'info' | 'warning' | 'critical'; category: string; title: string; detail: string; action: string }[];
  positions: any[];
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
  const offset = circumference - (score / 100) * circumference * 0.75; // 270 degree arc

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

function DimensionBar({ label, score, icon: Icon, desc }: { label: string; score: number; icon: any; desc?: string }) {
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
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500">{alert.category}</span>
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

function PositionRow({ p }: { p: any }) {
  const { t } = useI18n();
  const pnlColor = p.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400';
  const liqDist = p.liquidationPrice > 0 ? Math.abs(p.markPrice - p.liquidationPrice) / p.markPrice * 100 : 999;
  const liqColor = liqDist < 5 ? 'text-red-400' : liqDist < 10 ? 'text-yellow-400' : 'text-gray-400';
  const sideLabel = p.side === 'LONG' ? t('guardian.long') : p.side === 'SHORT' ? t('guardian.short') : p.side;

  return (
    <div className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-800/20 rounded">
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.side === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {sideLabel}
        </span>
        <span className="text-sm font-mono font-semibold text-gray-200">{p.symbol}</span>
        <span className="text-xs text-gray-500">{p.leverage}x</span>
      </div>
      <div className="flex items-center gap-6 text-right">
        <div>
          <div className="text-xs text-gray-500">{t('guardian.position_size')}</div>
          <div className="text-sm text-gray-300">${p.size.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('guardian.unrealized_pnl')}</div>
          <div className={`text-sm font-semibold ${pnlColor}`}>{p.unrealizedPnl >= 0 ? '+' : ''}${p.unrealizedPnl.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">{t('guardian.liq_distance')}</div>
          <div className={`text-sm font-semibold ${liqColor}`}>{liqDist.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}

export default function GuardianPage() {
  const { t } = useI18n();
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    fetch('/api/risk-guardian?mode=demo')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); setRefreshing(false); })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchData(); const i = setInterval(() => fetchData(true), 10000); return () => clearInterval(i); }, []);

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
          <button onClick={() => fetchData(true)} className={`p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Score + Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 flex flex-col items-center">
            <ScoreGauge score={data.score.overall} />
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span>{t('guardian.positions_count')} {data.positions.length}</span>
              <span>{t('guardian.total_exposure')} ${data.totalNotional.toLocaleString()}</span>
              <span className={data.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {t('guardian.unrealized_pnl')} {data.totalPnl >= 0 ? '+' : ''}${data.totalPnl.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-gray-400 mb-2">{t('guardian.five_dims')}</h3>
            {DIMENSIONS.map(d => (
              <DimensionBar key={d.key} label={t(d.labelKey)} score={(data.score as any)[d.key]} icon={d.icon} desc={t(d.descKey)} />
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
