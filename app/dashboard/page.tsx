'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getRiskColor, getRiskBgColor, getRiskLabel, getRiskStrokeColor, type ITCIndicator } from '@/lib/mockData';
import { useITCData } from '@/lib/useITCData';
import { useI18n } from '@/lib/i18n';
import { formatLocaleCurrency, formatLocaleNumber, formatSignedLocalePercent, getIntlLocale, i18nText } from '@/lib/i18n-helpers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceLine } from 'recharts';
import { Activity, TrendingUp, TrendingDown, X, Maximize2, BarChart3, Globe, Link2, Wifi, WifiOff, ArrowRight, CircleDot, Gamepad2, Sparkles } from 'lucide-react';

function DetailModal({ indicator, onClose, t, locale }: { indicator: ITCIndicator; onClose: () => void; t: (key: string) => string; locale: string }) {
  const [range, setRange] = useState<30 | 90 | 180>(90);
  const color = getRiskStrokeColor(indicator.value);
  const data = indicator.history.slice(-range);
  const pct = Math.round(indicator.value * 100);
  const prev7 = indicator.history[indicator.history.length - 8]?.value || indicator.value;
  const change7d = ((indicator.value - prev7) / prev7 * 100).toFixed(1);
  const prev30 = indicator.history[indicator.history.length - 31]?.value || indicator.value;
  const change30d = ((indicator.value - prev30) / prev30 * 100).toFixed(1);
  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  
  const displayName = locale === 'en' ? (indicator.nameEn || indicator.name) : indicator.name;
  const displayDesc: string = indicator.description || '';
  const intlLocale = getIntlLocale(locale as 'en' | 'zh');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-semibold">{displayName}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5">
          <div className="bg-gray-800/50 rounded-lg p-3">
            {/* Current Value */}<div className="text-[10px] text-gray-500 mb-1">{t('dashboard.currentValue')}</div>
            <div className={`text-2xl font-mono font-bold ${getRiskColor(indicator.value)}`}>{pct}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 mb-1">{t('dashboard.change7d')}</div>
            <div className={`text-lg font-mono font-semibold ${Number(change7d) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatSignedLocalePercent(Number(change7d), locale as 'en' | 'zh', { maximumFractionDigits: 1 })}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 mb-1">{t('dashboard.change30d')}</div>
            <div className={`text-lg font-mono font-semibold ${Number(change30d) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatSignedLocalePercent(Number(change30d), locale as 'en' | 'zh', { maximumFractionDigits: 1 })}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 mb-1">{t('dashboard.range')}</div>
            <div className="text-sm font-mono text-gray-300">{t('dashboard.rangeDisplay').replace('{min}', formatLocaleNumber(Math.round(min * 100), locale as 'en' | 'zh')).replace('{max}', formatLocaleNumber(Math.round(max * 100), locale as 'en' | 'zh'))}</div>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex gap-1.5 px-5 mb-3">
          {([30, 90, 180] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${range === r ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800'}`}>
              {r}{t('dashboard.days')}
            </button>
          ))}
        </div>

        {/* Full Chart */}
        <div className="px-5 pb-3" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleDateString(intlLocale, { month: 'short', day: 'numeric' })} tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
              <YAxis domain={[0, 1]} tickFormatter={v => formatLocaleNumber(Math.round(v * 100), locale as 'en' | 'zh')} tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelFormatter={v => new Date(v).toLocaleDateString(intlLocale)}
                formatter={(v: number | undefined) => [`${formatLocaleNumber(Math.round((v || 0) * 100), locale as 'en' | 'zh')}%`, displayName]} />
              <ReferenceLine y={0.3} stroke="#34d399" strokeDasharray="5 5" strokeOpacity={0.4} />
              <ReferenceLine y={0.7} stroke="#f87171" strokeDasharray="5 5" strokeOpacity={0.4} />
              <defs>
                <linearGradient id={`grad-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${indicator.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Description */}
        <div className="px-5 pb-5">
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 leading-relaxed">{displayDesc}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${getRiskBgColor(indicator.value)}`}>
                {i18nText(locale as 'en' | 'zh', getRiskLabel(indicator.value))}
              </span>
              <span className="text-[10px] text-gray-600">{t('dashboard.modal_category')}: {
                indicator.category === 'crypto' ? t('dashboard.modal_cat_crypto') :
                indicator.category === 'on-chain' ? t('dashboard.modal_cat_onchain') :
                indicator.category === 'price' ? t('dashboard.modal_cat_price') :
                indicator.category === 'weightless' ? t('dashboard.modal_cat_weightless') :
                indicator.category === 'macro' ? t('dashboard.modal_cat_macro') : t('dashboard.modal_cat_onchain')
              }</span>
            </div>
          </div>

          {/* ITC chart link removed per user request */}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_TABS = [
  { id: 'all', labelKey: 'dashboard.cat_all', icon: BarChart3 },
  { id: 'crypto', labelKey: 'dashboard.cat_crypto', icon: Activity },
  { id: 'on-chain', labelKey: 'dashboard.cat_onchain', icon: Link2 },
  { id: 'price', labelKey: 'dashboard.cat_price', icon: Activity },
  { id: 'weightless', labelKey: 'dashboard.cat_weightless', icon: Activity },
  { id: 'macro', labelKey: 'dashboard.cat_macro', icon: Globe },
] as const;

const START_HERE_PATHS = [
  {
    titleKey: 'dashboard.path.beginner.title',
    subtitleKey: 'dashboard.path.beginner.subtitle',
    badgeKey: 'dashboard.path.beginner.badge',
    accent: 'emerald',
    fitKey: 'dashboard.path.beginner.fit',
    ctaHref: '/health',
    ctaLabelKey: 'dashboard.path.beginner.cta',
  },
  {
    titleKey: 'dashboard.path.intermediate.title',
    subtitleKey: 'dashboard.path.intermediate.subtitle',
    badgeKey: 'dashboard.path.intermediate.badge',
    accent: 'cyan',
    fitKey: 'dashboard.path.intermediate.fit',
    ctaHref: '/practice',
    ctaLabelKey: 'dashboard.path.intermediate.cta',
  },
  {
    titleKey: 'dashboard.path.advanced.title',
    subtitleKey: 'dashboard.path.advanced.subtitle',
    badgeKey: 'dashboard.path.researcher.badge',
    accent: 'violet',
    fitKey: 'dashboard.path.researcher.fit',
    ctaHref: '/strategy',
    ctaLabelKey: 'dashboard.path.researcher.cta',
  },
] as const;

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const [selected, setSelected] = useState<ITCIndicator | null>(null);
  const [category, setCategory] = useState<string>('all');
  const { indicators: ITCIndicators, prices, loading: dataLoading, error: dataError, isLive } = useITCData();

  const filtered = category === 'all' ? ITCIndicators : ITCIndicators.filter(i => i.category === category);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">{t('dashboard.title')}</h1>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
            {ITCIndicators.length} {t('dashboard.subtitle_indicators')} · {t('dashboard.subtitle_click')}
            {isLive ? <span className="inline-flex items-center gap-1 text-emerald-400"><Wifi className="w-3 h-3" />{t('dashboard.live')}</span> : <span className="inline-flex items-center gap-1 text-gray-600"><WifiOff className="w-3 h-3" />{t('dashboard.simulated')}</span>}
            {prices && <span className="text-gray-500">{t('dashboard.priceSummary').replace('{btc}', formatLocaleCurrency(prices.BTC, locale, 'USD', { maximumFractionDigits: 0 })).replace('{eth}', formatLocaleCurrency(prices.ETH, locale, 'USD', { maximumFractionDigits: 0 }))}</span>}
          </p>
        </div>
        <div className="flex gap-1">
          {CATEGORY_TABS.map(({ id, labelKey, icon: Icon }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                category === id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800'
              }`}>
              <Icon className="w-3 h-3" />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Start Here */}
      <div className="mb-5 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950/30 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <CircleDot className="w-3 h-3" /> {t('dashboard.startHere')}
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">{t('dashboard.pathHeader')}</h2>
            <p className="mt-2 max-w-3xl text-sm text-gray-400">
              {t('dashboard.pathIntro')}
            </p>
          </div>
          <div className="rounded-xl border border-gray-800 bg-black/20 px-4 py-3 text-sm text-gray-300">
            <div className="text-[11px] uppercase tracking-[0.16em] text-gray-500">{t('dashboard.recommendedPath')}</div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium">
              <Link href="/health" className="rounded-full bg-gray-800 px-3 py-1.5 hover:bg-gray-700 transition-colors">{t('dashboard.step1')}</Link>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <Link href="/practice" className="rounded-full bg-gray-800 px-3 py-1.5 hover:bg-gray-700 transition-colors">{t('dashboard.step2')}</Link>
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <Link href="/strategy" className="rounded-full bg-gray-800 px-3 py-1.5 hover:bg-gray-700 transition-colors">{t('dashboard.step3')}</Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {START_HERE_PATHS.map((path) => {
            const badgeStyles = {
              emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
              cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
              violet: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
            }[path.accent];

            return (
              <div key={path.titleKey} className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${badgeStyles}`}>
                      {t(path.badgeKey)}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{t(path.titleKey)}</h3>
                    <p className="mt-1 text-sm text-gray-400">{t(path.subtitleKey)}</p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-500">{t(path.fitKey)}</p>

                <div className="mt-4 space-y-2 rounded-xl border border-gray-800 bg-gray-900/50 p-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> {t('dashboard.tip1')}</div>
                  <div className="flex items-center gap-2"><Gamepad2 className="w-4 h-4 text-cyan-400" /> {t('dashboard.tip2')}</div>
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" /> {t('dashboard.tip3')}</div>
                </div>

                <Link
                  href={path.ctaHref}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-emerald-300 transition-colors"
                >
                  {t(path.ctaLabelKey)} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: t('dashboard.low_risk'), count: ITCIndicators.filter(i => i.value < 0.3).length, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
          { label: t('dashboard.mid_risk'), count: ITCIndicators.filter(i => i.value >= 0.3 && i.value < 0.7).length, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
          { label: t('dashboard.high_risk'), count: ITCIndicators.filter(i => i.value >= 0.7).length, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`border rounded-lg p-3 ${s.bg}`}>
            <div className="text-[10px] text-gray-500">{s.label}</div>
            <div className={`text-2xl font-mono font-bold ${s.color}`}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(indicator => {
          const pct = Math.round(indicator.value * 100);
          const color = getRiskStrokeColor(indicator.value);
          const prev = indicator.history[indicator.history.length - 8]?.value || indicator.value;
          const isUp = indicator.value > prev;

          return (
            <div key={indicator.id} onClick={() => setSelected(indicator)}
              className="border border-gray-800/50 rounded-lg p-3.5 bg-gray-900/30 hover:bg-gray-900/60 hover:border-gray-700 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">{locale === 'en' ? (indicator.nameEn || indicator.name) : indicator.name}</span>
                <Maximize2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-2xl font-mono font-bold ${getRiskColor(indicator.value)}`}>{pct}</span>
                <div className={`flex items-center gap-0.5 text-[10px] ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {isUp ? '↑' : '↓'}
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="h-10 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={indicator.history.slice(-30)}>
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getRiskBgColor(indicator.value)}`}>
                  {i18nText(locale as 'en' | 'zh', getRiskLabel(indicator.value))}
                </span>
                <span className="text-[9px] text-gray-600">{locale === 'en' ? (indicator.nameEn || indicator.name) : indicator.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-5 border border-gray-800 rounded-lg p-3 bg-gray-900/30">
        <div className="flex gap-4 text-[10px] text-gray-500 justify-center">
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />{t('dashboard.legend_low')}</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />{t('dashboard.legend_mid')}</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />{t('dashboard.legend_high')}</span>
        </div>
      </div>

      {/* Next Step Recommendations */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-gray-900 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">{t('dashboard.nextStep')}</div>
          <h3 className="mt-2 text-lg font-semibold text-white">{t('dashboard.nextStepTitle')}</h3>
          <p className="mt-2 text-sm text-gray-400">{t('dashboard.nextStepDesc2')}</p>
          <Link
            href="/practice"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
          >
            {t('dashboard.goToPractice2')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-gray-900 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">{t('dashboard.nextStep2')}</div>
          <h3 className="mt-2 text-lg font-semibold text-white">{t('dashboard.nextStepTitle2')}</h3>
          <p className="mt-2 text-sm text-gray-400">{t('dashboard.nextStepDesc3')}</p>
          <Link
            href="/strategy"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
          >
            {t('dashboard.goToStrategy')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && <DetailModal indicator={selected} onClose={() => setSelected(null)} t={t} locale={locale} />}
    </div>
  );
}
