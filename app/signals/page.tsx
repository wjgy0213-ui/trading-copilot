'use client';

import { useEffect, useState } from 'react';
import { Radio, TrendingUp, TrendingDown, Minus, Layers, Link2, BarChart3, Globe, Activity, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { formatLocaleNumber } from '@/lib/i18n-helpers';

interface Signal {
  source: string;
  layer: 'onchain' | 'technical' | 'macro';
  asset: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  detail: string;
}

interface FusedSignal {
  asset: string;
  conviction: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  grade: string;
  layers: { onchain: number; technical: number; macro: number };
  signals: Signal[];
  summary: string;
}

interface SignalsData {
  fused: FusedSignal[];
  totalSignals: number;
  fearGreed: number;
  timestamp: number;
}

const LAYER_META: Record<string, { labelKey: string; icon: any; color: string }> = {
  onchain: { labelKey: 'signals.layer_onchain', icon: Link2, color: 'purple' },
  technical: { labelKey: 'signals.layer_technical', icon: Activity, color: 'blue' },
  macro: { labelKey: 'signals.layer_macro', icon: Globe, color: 'amber' },
};

function ConvictionMeter({ conviction, grade }: { conviction: number; grade: string }) {
  const { t } = useI18n();
  const pct = (conviction + 100) / 2; // -100~100 → 0~100
  const color = conviction > 30 ? '#10b981' : conviction > 0 ? '#3b82f6' : conviction > -30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-red-400">{t('signals.very_bearish')}</span>
        <span className="text-gray-500">{t('signals.mid')}</span>
        <span className="text-emerald-400">{t('signals.very_bullish')}</span>
      </div>
      <div className="relative h-3 bg-gradient-to-r from-red-500/30 via-gray-700/30 to-emerald-500/30 rounded-full overflow-hidden">
        <div className="absolute top-0 bottom-0 w-0.5 bg-gray-600 left-1/2" />
        <div className="absolute top-0 bottom-0 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-700"
          style={{ left: `calc(${pct}% - 6px)`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold" style={{ color }}>
          {conviction > 0 ? '+' : ''}{conviction}
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          grade === 'A' ? 'bg-emerald-500/20 text-emerald-400' :
          grade === 'B' ? 'bg-blue-500/20 text-blue-400' :
          grade === 'C' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
        }`}>
          {t('signals.confidence')} {grade}
        </span>
      </div>
    </div>
  );
}

function LayerBar({ layer, score }: { layer: string; score: number }) {
  const { t } = useI18n();
  const meta = LAYER_META[layer];
  const colors: Record<string, string> = { purple: 'bg-purple-500', blue: 'bg-blue-500', amber: 'bg-amber-500' };
  const width = Math.abs(score);
  const isPositive = score >= 0;

  return (
    <div className="flex items-center gap-2">
      <meta.icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className="text-[11px] text-gray-400 w-8 shrink-0">{t(meta.labelKey)}</span>
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700" />
          {isPositive ? (
            <div className={`absolute left-1/2 top-0 bottom-0 ${colors[meta.color]} rounded-r-full transition-all duration-500`}
              style={{ width: `${width / 2}%` }} />
          ) : (
            <div className={`absolute top-0 bottom-0 ${colors[meta.color]} rounded-l-full transition-all duration-500`}
              style={{ right: '50%', width: `${width / 2}%` }} />
          )}
        </div>
        <span className={`text-[10px] font-mono w-8 text-right ${score > 0 ? 'text-emerald-400' : score < 0 ? 'text-red-400' : 'text-gray-500'}`}>
          {score > 0 ? '+' : ''}{score}
        </span>
      </div>
    </div>
  );
}

function SignalRow({ signal }: { signal: Signal }) {
  const { t } = useI18n();
  const dirIcon = signal.direction === 'bullish' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> :
    signal.direction === 'bearish' ? <TrendingDown className="w-3 h-3 text-red-400" /> :
    <Minus className="w-3 h-3 text-gray-500" />;
  const meta = LAYER_META[signal.layer];

  return (
    <div className="flex items-start gap-2 py-1.5">
      {dirIcon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-200">{signal.source}</span>
          <span className={`text-[9px] px-1 py-0.5 rounded bg-gray-800 text-gray-500`}>{t(meta.labelKey)}</span>
          <span className="text-[10px] text-gray-600">{t('signals.strength')} {signal.strength}</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5">{signal.detail}</p>
      </div>
    </div>
  );
}

function AssetCard({ fused }: { fused: FusedSignal }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const dirColor = fused.direction === 'bullish' ? 'border-emerald-500/20' : fused.direction === 'bearish' ? 'border-red-500/20' : 'border-gray-700/30';
  const dirBg = fused.direction === 'bullish' ? 'from-emerald-500/5' : fused.direction === 'bearish' ? 'from-red-500/5' : 'from-gray-800/30';
  const dirLabel = fused.direction === 'bullish' ? t('signals.bullish') : fused.direction === 'bearish' ? t('signals.bearish') : t('signals.neutral');
  const dirLabelColor = fused.direction === 'bullish' ? 'text-emerald-400' : fused.direction === 'bearish' ? 'text-red-400' : 'text-gray-400';

  return (
    <div className={`bg-gradient-to-br ${dirBg} to-transparent border ${dirColor} rounded-xl overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-100">{fused.asset}</span>
            <span className={`text-sm font-semibold ${dirLabelColor}`}>{dirLabel}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold" style={{
              color: fused.conviction > 30 ? '#10b981' : fused.conviction > 0 ? '#3b82f6' : fused.conviction > -30 ? '#f59e0b' : '#ef4444'
            }}>
              {fused.conviction > 0 ? '+' : ''}{fused.conviction}
            </span>
          </div>
        </div>

        <ConvictionMeter conviction={fused.conviction} grade={fused.grade} />

        <div className="mt-4 space-y-1.5">
          {Object.entries(fused.layers).map(([k, v]) => (
            <LayerBar key={k} layer={k} score={v} />
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-4 leading-relaxed">{fused.summary}</p>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={expanded ? t('signals.collapse') : t('signals.expandCount').replace('{count}', String(fused.signals.length)).replace('{label}', t('signals.signals_suffix'))}
        title={expanded ? t('signals.collapse') : t('signals.expandCount').replace('{count}', String(fused.signals.length)).replace('{label}', t('signals.signals_suffix'))}
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-gray-800/30 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/20 transition"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? t('signals.collapse') : t('signals.expandCount').replace('{count}', String(fused.signals.length)).replace('{label}', t('signals.signals_suffix'))}
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t border-gray-800/20 pt-3 space-y-0.5">
          {fused.signals.map((s, i) => <SignalRow key={i} signal={s} />)}
        </div>
      )}
    </div>
  );
}

export default function SignalsPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<SignalsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch('/api/signals')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">{t('signals.loading')}</div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="text-red-400">{t('signals.error')}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold text-gray-100">{t('signals.title')}</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('signals.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-gray-600">{t('signals.fearGreedShort')}</div>
              <div className={`text-sm font-bold ${data.fearGreed <= 25 ? 'text-red-400' : data.fearGreed >= 75 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {formatLocaleNumber(data.fearGreed, locale)}
              </div>
            </div>
            <button onClick={fetchData} aria-label={t('signals.refreshAria')} title={t('signals.refreshAria')} className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition">
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {formatLocaleNumber(data.totalSignals, locale)} {t('signals.sources')}</span>
          <span>{t('signals.layers_filter')}</span>
          <span>{formatLocaleNumber(data.fused.length, locale)} {t('signals.assets')}</span>
        </div>

        {/* Fused signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.fused.map(f => <AssetCard key={f.asset} fused={f} />)}
        </div>

        {/* Methodology */}
        <div className="bg-gray-900/30 border border-gray-800/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">{t('signals.methodology')}</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-purple-400 font-bold text-lg">35%</div>
              <div className="text-xs text-gray-400">{t('signals.onchain')}</div>
              <div className="text-[10px] text-gray-600 mt-1">{t('signals.onchain_detail')}</div>
            </div>
            <div>
              <div className="text-blue-400 font-bold text-lg">35%</div>
              <div className="text-xs text-gray-400">{t('signals.technical')}</div>
              <div className="text-[10px] text-gray-600 mt-1">{t('signals.technical_detail')}</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold text-lg">30%</div>
              <div className="text-xs text-gray-400">{t('signals.macro')}</div>
              <div className="text-[10px] text-gray-600 mt-1">{t('signals.macro_detail')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
