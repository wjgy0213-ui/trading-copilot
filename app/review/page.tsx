'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, AlertTriangle, Award, Zap, Brain, Target, Flame, Shield } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ReviewData {
  summary: {
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    totalPnl: number;
    totalFees: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    maxConsecLosses: number;
    avgDuration: number;
    score: number;
    grade: string;
  };
  timeAnalysis: Record<string, { wins: number; losses: number; pnl: number }>;
  tiltTrades: number;
  insights: { type: 'positive' | 'warning' | 'critical'; text: string; icon: string }[];
  tradeGroups: any[];
}

function ScoreRing({ score, grade, t }: { score: number; grade: string; t: (key: string) => string }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 65 ? '#3b82f6' : score >= 50 ? '#f59e0b' : score >= 35 ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-lg font-semibold text-gray-400">{t('review.gradePrefix')} {grade}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color = 'gray' }: any) {
  const colors: Record<string, string> = {
    green: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    red: 'from-red-500/10 to-red-500/5 border-red-500/20',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
    gray: 'from-gray-800/50 to-gray-800/30 border-gray-700/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-gray-100">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function HeatMap({ data, t }: { data: Record<string, { wins: number; losses: number; pnl: number }>; t: (key: string) => string }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxPnl = Math.max(...Object.values(data).map(d => Math.abs(d.pnl)), 1);

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" /> {t('review.heatmap_title')}
      </h3>
      <div className="grid grid-cols-12 gap-1">
        {hours.map(h => {
          const d = data[h] || { wins: 0, losses: 0, pnl: 0 };
          const intensity = Math.min(Math.abs(d.pnl) / maxPnl, 1);
          const isProfit = d.pnl >= 0;
          const bg = d.wins + d.losses === 0
            ? 'bg-gray-800/30'
            : isProfit
              ? `bg-emerald-500` 
              : `bg-red-500`;

          return (
            <div key={h} className="text-center" title={t('review.heatmapTooltip')
              .replace('{hour}', String(h))
              .replace('{pnl}', d.pnl.toFixed(2))
              .replace('{wins}', String(d.wins))
              .replace('{losses}', String(d.losses))}>
              <div className={`h-8 rounded ${bg} transition-all`} style={{ opacity: d.wins + d.losses === 0 ? 0.2 : 0.3 + intensity * 0.7 }} />
              <span className="text-[10px] text-gray-600">{h}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/60" /> {t('review.heatmap_profit')}</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/60" /> {t('review.heatmap_loss')}</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-800/50" /> {t('review.heatmap_none')}</span>
      </div>
    </div>
  );
}

function InsightsList({ insights }: { insights: ReviewData['insights'] }) {
  const bgMap = { positive: 'border-emerald-500/20 bg-emerald-500/5', warning: 'border-yellow-500/20 bg-yellow-500/5', critical: 'border-red-500/20 bg-red-500/5' };

  return (
    <div className="space-y-2">
      {insights.map((ins, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${bgMap[ins.type]}`}>
          <span className="text-lg">{ins.icon}</span>
          <span className="text-sm text-gray-200">{ins.text}</span>
        </div>
      ))}
    </div>
  );
}

function TradeList({ trades, t }: { trades: any[]; t: (key: string) => string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-300">{t('review.recent_trades')}</h3>
      </div>
      <div className="divide-y divide-gray-800/30 max-h-80 overflow-y-auto">
        {trades.map((t, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-800/20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-semibold text-gray-300">{t.symbol}</span>
              <span className="text-[10px] text-gray-500">{t.entries?.length || 0}→{t.exits?.length || 0}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">{t.duration ? `${(t.duration / 60000).toFixed(0)}m` : '-'}</span>
              <span className={`text-sm font-semibold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {t.pnl >= 0 ? '+' : ''}{t.pnl?.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const { t } = useI18n();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const [noTrades, setNoTrades] = useState(false);
  const [noTradesMsg, setNoTradesMsg] = useState('');

  useEffect(() => {
    fetch('/api/review')
      .then(r => r.json())
      .then(d => {
        if (d.noTrades) {
          setNoTrades(true);
          setNoTradesMsg(d.message || t('review.no_trades'));
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">{t('review.loading')}</div>
      </div>
    );
  }

  if (noTrades) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-white mb-2">{t('review.no_trades')}</h2>
          <p className="text-gray-400 mb-6">{noTradesMsg}</p>
          <a href="/elite" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl transition">
            {t('review.go_connect')}
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-red-400">{t('review.load_failed')}</div>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-gray-100">{t('review.heading')}</h1>
          </div>
          <p className="text-sm text-gray-500">{t('review.subtitle')}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
            <Shield className="w-3 h-3" /> {t('review.elite_badge')}
          </div>
        </div>

        {/* Score + Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 flex flex-col items-center justify-center">
            <ScoreRing score={s.score} grade={s.grade} t={t} />
            <p className="text-xs text-gray-500 mt-2">{t('review.score_label')}</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label={t('review.total_trades')} value={s.totalTrades} sub={`${s.wins}${t('review.wins_suffix')} ${s.losses}${t('review.losses_suffix')}`} icon={BarChart3} />
            <StatCard label={t('review.win_rate')} value={`${(s.winRate * 100).toFixed(0)}%`} icon={Target} color={s.winRate >= 0.5 ? 'green' : 'red'} />
            <StatCard label={t('review.net_pnl')} value={`$${s.totalPnl.toFixed(2)}`} icon={s.totalPnl >= 0 ? TrendingUp : TrendingDown} color={s.totalPnl >= 0 ? 'green' : 'red'} />
            <StatCard label={t('review.profit_factor')} value={s.profitFactor.toFixed(2)} icon={Zap} color={s.profitFactor >= 1.5 ? 'green' : s.profitFactor >= 1 ? 'yellow' : 'red'} />
            <StatCard label={t('review.fees')} value={`$${s.totalFees.toFixed(2)}`} sub={`${t('review.fees_pnl_pct')} ${(s.totalFees / Math.max(Math.abs(s.totalPnl), 1) * 100).toFixed(0)}%`} icon={Flame} color="yellow" />
            <StatCard label={t('review.max_consec_losses')} value={`${s.maxConsecLosses}${t('review.trades_suffix')}`} icon={AlertTriangle} color={s.maxConsecLosses >= 4 ? 'red' : 'gray'} />
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" /> {t('review.ai_diagnosis')}
          </h2>
          <InsightsList insights={data.insights} />
        </div>

        {/* Heatmap + Trade List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HeatMap data={data.timeAnalysis} t={t} />
          <TradeList trades={data.tradeGroups} t={t} />
        </div>

        {/* CTA for non-Elite */}
        <div className="text-center py-6 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border border-purple-500/10 rounded-xl">
          <p className="text-sm text-gray-400 mb-2">{t('review.demo_notice')}</p>
          <p className="text-xs text-gray-500 mb-4">{t('review.demo_desc')}</p>
          <a href="/elite" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-lg transition">
            <Shield className="w-4 h-4" /> {t('review.connect_exchange')}
          </a>
        </div>
      </div>
    </div>
  );
}
