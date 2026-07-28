'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { formatCompactLocaleCurrency, formatLocaleCurrency, formatLocaleNumber, formatLocalePercent } from '@/lib/i18n-helpers';

interface Position {
  coin: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  size: number;
  unrealizedPnl: number;
  leverage: string;
}

interface Whale {
  address: string;
  label: string;
  accountValue: number;
  dayPnl: number;
  weekPnl: number;
  positions: Position[];
  totalNotional: number;
  longExposure: number;
  shortExposure: number;
}

interface TopCoin {
  coin: string;
  longCount: number;
  shortCount: number;
  totalSize: number;
  bias: string;
}

interface WhaleData {
  whales: Whale[];
  summary: {
    totalWhales: number;
    totalLongExposure: number;
    totalShortExposure: number;
    longShortRatio: number;
    topCoins: TopCoin[];
  };
}

function formatUsd(n: number, locale: 'en' | 'zh'): string {
  if (Math.abs(n) >= 1e3) {
    return formatCompactLocaleCurrency(n, locale, 'USD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.abs(n) >= 1e6 ? 1 : 0,
    });
  }

  return formatLocaleCurrency(n, locale, 'USD', { maximumFractionDigits: 0 });
}

function PnlBadge({ value, locale }: { value: number; locale: 'en' | 'zh' }) {
  if (value === 0) return <span className="text-gray-500">-</span>;
  const color = value > 0 ? 'text-green-400' : 'text-red-400';
  return <span className={`font-medium ${color}`}>{value > 0 ? '+' : ''}{formatUsd(Math.abs(value), locale)}</span>;
}

function BiasIndicator({ longPct, locale }: { longPct: number; locale: 'en' | 'zh' }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden flex">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${longPct}%` }} />
        <div className="h-full bg-red-500 transition-all" style={{ width: `${100 - longPct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-16 text-right">{formatLocalePercent(longPct / 100, locale, { maximumFractionDigits: 0 })} {t('whales.longShortLongSuffix')}</span>
    </div>
  );
}

export default function WhalesPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<WhaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/whales');
      if (res.ok) setData(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 60000); // 1min refresh
    return () => clearInterval(iv);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-3">{t('whales.loading')}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center text-gray-400">
        <p>{t('whales.load_failed')}</p>
      </div>
    );
  }

  const { whales, summary } = data;
  const totalExposure = summary.totalLongExposure + summary.totalShortExposure;
  const longPct = totalExposure > 0 ? (summary.totalLongExposure / totalExposure) * 100 : 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🐋</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {t('whales.tracker')}
              </span>
            </h1>
            <p className="text-gray-500 text-sm">{t('whales.subtitle')}</p>
          </div>
          <button onClick={fetchData} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-400">
            {t('whales.refresh')}
          </button>
        </div>

        {/* Consensus Overview */}
        <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 border border-cyan-500/20 mb-6">
          <h2 className="text-sm text-gray-400 mb-3">
            {t('whales.consensusTopTraders').replace('{count}', formatLocaleNumber(summary.totalWhales, locale))}
          </h2>
          
          {/* Long/Short Ratio */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-400">{t('whales.long')} {formatUsd(summary.totalLongExposure, locale)}</span>
              <span className="text-red-400">{t('whales.short')} {formatUsd(summary.totalShortExposure, locale)}</span>
            </div>
            <BiasIndicator longPct={longPct} locale={locale} />
          </div>

          {/* Top coins consensus */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {summary.topCoins.slice(0, 10).map(tc => (
              <div key={tc.coin} className="bg-gray-800/60 rounded-lg p-2 text-center">
                <div className="font-bold text-sm">{tc.coin}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-green-400 text-xs">
                    {t('whales.countPair')
                      .replace('{count}', formatLocaleNumber(tc.longCount, locale))
                      .replace('{label}', t('whales.longShortLongSuffix'))}
                  </span>
                  <span className="text-gray-600">/</span>
                  <span className="text-red-400 text-xs">
                    {t('whales.countPair')
                      .replace('{count}', formatLocaleNumber(tc.shortCount, locale))
                      .replace('{label}', t('whales.longShortShortSuffix'))}
                  </span>
                </div>
                <div className={`text-xs mt-0.5 ${
                  tc.bias === 'LONG' ? 'text-green-400' : tc.bias === 'SHORT' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {tc.bias === 'LONG' ? t('whales.bias_long') : tc.bias === 'SHORT' ? t('whales.bias_short') : t('whales.bias_neutral')}
                </div>
                <div className="text-xs text-gray-500">{formatUsd(tc.totalSize, locale)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Whale List */}
        <h2 className="text-lg font-semibold mb-3">{t('whales.trader_list')}</h2>
        <div className="space-y-3">
          {whales.map(w => {
            const isExpanded = expanded === w.address;
            const wLongPct = w.totalNotional > 0 ? (w.longExposure / w.totalNotional) * 100 : 50;
            
            return (
              <div key={w.address} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                {/* Whale header - clickable */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : w.address)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-800/80 transition-colors text-left"
                >
                  <div className="text-2xl">🐋</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{w.label}</span>
                      <span className="text-xs text-gray-500 font-mono">{w.address.slice(0, 6)}...{w.address.slice(-4)}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="text-gray-400">
                        {t('whales.accountSummary')
                          .replace('{value}', formatUsd(w.accountValue, locale))
                          .replace('{positions}', formatLocaleNumber(w.positions.length, locale))
                          .replace('{positionsLabel}', t('whales.positions'))}
                      </span>
                      <span>{t('whales.today')} <PnlBadge value={w.dayPnl} locale={locale} /></span>
                    </div>
                  </div>
                  <div className="w-32 hidden sm:block">
                    <BiasIndicator longPct={wLongPct} locale={locale} />
                  </div>
                  <span className="text-gray-500 text-lg">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {/* Expanded positions */}
                {isExpanded && (
                  <div className="border-t border-gray-700/50 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {w.positions.map((p, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                          p.side === 'LONG' ? 'bg-green-500/5 border border-green-500/10' : 'bg-red-500/5 border border-red-500/10'
                        }`}>
                          <div className={`text-xs px-2 py-0.5 rounded font-bold ${
                            p.side === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {p.side === 'LONG' ? t('whales.long') : t('whales.short')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{p.coin}</span>
                              <span className="text-xs text-gray-500">{t('whales.leverageValue').replace('{value}', p.leverage)}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {t('whales.entry')} {formatLocaleCurrency(p.entryPrice, locale, 'USD', {
                                minimumFractionDigits: p.entryPrice < 1 ? 4 : 0,
                                maximumFractionDigits: p.entryPrice < 1 ? 4 : 1,
                              })}
                              {' · '}{formatUsd(p.size, locale)}
                            </div>
                          </div>
                          <div className="text-right">
                            <PnlBadge value={p.unrealizedPnl} locale={locale} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Whale link */}
                    <div className="mt-3 text-center">
                      <a
                        href={`https://app.hyperliquid.xyz/leaderboard/${w.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                      >
                        {t('whales.view_on_hl')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>{t('whales.data_source')}</p>
          <p className="mt-1">{t('whales.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}
