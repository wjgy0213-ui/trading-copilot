'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { formatLocaleNumber, formatLocalePercent, getIntlLocale } from '@/lib/i18n-helpers';

interface Dimension {
  key?: 'fearGreed' | 'itcRisk' | 'priceMomentum' | 'fundingRate' | 'volatility';
  name: string;
  nameZh: string;
  score: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  detail: string;
  detailEn?: string;
  weight: number;
}

interface HealthData {
  score: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  light: 'green' | 'yellow' | 'red';
  suggestionKey?: string;
  suggestion: string;
  dimensions: Dimension[];
  timestamp: number;
}

function ScoreGauge({ score, light, scoreSuffix }: { score: number; light: string; scoreSuffix: string }) {
  const color = light === 'green' ? '#22c55e' : light === 'yellow' ? '#eab308' : '#ef4444';
  const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees
  
  return (
    <div className="relative w-64 h-36 mx-auto mb-2">
      <svg viewBox="0 0 200 110" className="w-full h-full">
        {/* Background arc */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1f2937" strokeWidth="16" strokeLinecap="round" />
        {/* Red zone 0-35 */}
        <path d="M 20 100 A 80 80 0 0 1 56 38" fill="none" stroke="#ef444466" strokeWidth="16" strokeLinecap="round" />
        {/* Yellow zone 35-60 */}
        <path d="M 56 38 A 80 80 0 0 1 120 22" fill="none" stroke="#eab30866" strokeWidth="16" strokeLinecap="round" />
        {/* Green zone 60-100 */}
        <path d="M 120 22 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e66" strokeWidth="16" strokeLinecap="round" />
        {/* Needle */}
        <line
          x1="100" y1="100"
          x2={100 + 60 * Math.cos((rotation * Math.PI) / 180)}
          y2={100 - 60 * Math.sin((-rotation * Math.PI) / 180)}
          stroke={color} strokeWidth="3" strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="6" fill={color} />
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-gray-400 text-sm">{scoreSuffix}</span>
      </div>
    </div>
  );
}

function TrafficLight({ light }: { light: string }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2 justify-center mb-4">
      <div className={`w-6 h-6 rounded-full border-2 ${light === 'red' ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-gray-700 border-gray-600'}`} />
      <div className={`w-6 h-6 rounded-full border-2 ${light === 'yellow' ? 'bg-yellow-500 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.6)]' : 'bg-gray-700 border-gray-600'}`} />
      <div className={`w-6 h-6 rounded-full border-2 ${light === 'green' ? 'bg-green-500 border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-gray-700 border-gray-600'}`} />
      <span className="ml-2 text-sm font-medium text-gray-300">
        {light === 'green' ? t('health.operable') : light === 'yellow' ? t('health.wait') : t('health.caution')}
      </span>
    </div>
  );
}

function DimensionBar({ dim, locale, t }: { dim: Dimension; locale: 'en' | 'zh'; t: (key: string, fallback?: string) => string }) {
  const color = dim.signal === 'bullish' ? 'bg-green-500' : dim.signal === 'bearish' ? 'bg-red-500' : 'bg-yellow-500';
  const textColor = dim.signal === 'bullish' ? 'text-green-400' : dim.signal === 'bearish' ? 'text-red-400' : 'text-yellow-400';
  const displayName = dim.key
    ? t(`health.dimension.${dim.key}.name`, locale === 'zh' ? dim.nameZh : dim.name)
    : locale === 'zh' ? dim.nameZh : dim.name;
  const secondaryName = locale === 'zh' ? dim.name : dim.nameZh;
  const detailText = dim.key
    ? t(`health.dimension.${dim.key}.detail`, locale === 'zh' ? dim.detail : (dim.detailEn || dim.detail))
    : locale === 'zh' ? dim.detail : (dim.detailEn || dim.detail);
  const weightText = t('health.weightPct').replace('{percent}', formatLocalePercent(dim.weight, locale, { maximumFractionDigits: 0 }).replace('%', ''));
  
  return (
    <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-white font-medium">{displayName}</span>
          <span className="text-gray-500 text-xs ml-2">{secondaryName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${textColor}`}>{dim.score}</span>
          <span className="text-xs text-gray-500">{weightText}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${dim.score}%` }} />
      </div>
      <p className="text-xs text-gray-400">{detailText}</p>
    </div>
  );
}

export default function HealthCheckPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/health-check');
      if (!res.ok) throw new Error(t('health.fetchFailed'));
      const json = await res.json();
      setData(json);
      setLastUpdate(new Intl.DateTimeFormat(getIntlLocale(locale), {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(json.timestamp)));
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('health.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {t('health.heading')}
            </span>
          </h1>
          <p className="text-gray-400 text-sm">{t('health.subtitle')}</p>
          {lastUpdate && (
            <p className="text-gray-600 text-xs mt-1">
              {t('health.updatedAtValue')
                .replace('{time}', lastUpdate)
                .replace('{interval}', t('health.refreshInterval'))}
            </p>
          )}
        </div>

        {loading && !data ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 mt-3">{t('health.scanning')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">
            <p>❌ {error}</p>
            <button onClick={fetchHealth} className="mt-4 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
              {t('health.retry')}
            </button>
          </div>
        ) : data ? (
          <>
            {/* Main Score */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 mb-6">
              <ScoreGauge score={data.score} light={data.light} scoreSuffix={t('health.scoreOutOf')} />
              <TrafficLight light={data.light} />
              <p className="text-center text-gray-300 text-sm px-4">{data.suggestionKey ? t(data.suggestionKey, data.suggestion) : data.suggestion}</p>
            </div>

            {/* Interpretation */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">{t('health.howToRead')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-red-400 font-bold">{formatLocaleNumber(0, locale)}-{formatLocaleNumber(39, locale)}</div>
                  <div className="text-gray-400">{t('health.danger')}</div>
                  <div className="text-gray-500 mt-1">{t('health.dangerHint')}</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-yellow-400 font-bold">{formatLocaleNumber(40, locale)}-{formatLocaleNumber(59, locale)}</div>
                  <div className="text-gray-400">{t('health.mixed')}</div>
                  <div className="text-gray-500 mt-1">{t('health.mixedHint')}</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-green-400 font-bold">{formatLocaleNumber(60, locale)}-{formatLocaleNumber(100, locale)}</div>
                  <div className="text-gray-400">{t('health.favorable')}</div>
                  <div className="text-gray-500 mt-1">{t('health.favorableHint')}</div>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <h2 className="text-lg font-semibold mb-3">{t('health.dimensions')}</h2>
            <div className="space-y-3 mb-8">
              {data.dimensions.map((dim) => (
                <DimensionBar key={dim.name} dim={dim} locale={locale} t={t} />
              ))}
            </div>

            {/* Refresh */}
            <div className="text-center pb-8">
              <button 
                onClick={fetchHealth} 
                disabled={loading}
                aria-label={t('health.refreshAria')}
                title={t('health.refreshAria')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? t('health.refreshing') : t('health.refreshNow')}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
