'use client';

import { useI18n } from '@/lib/i18n';
import { formatLocaleNumber } from '@/lib/i18n-helpers';

import { useState } from 'react';
import { NEWS_CATEGORIES, type NewsCategory, getSentimentBgColor, getSentimentLabel, getImpactColor, getImpactLabel, localizeNewsText } from '@/lib/mockNews';
import { useNewsData } from '@/lib/useNewsData';
import { Clock, Flame, TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from 'lucide-react';

function formatTimeAgo(timestamp: number, t: (key: string) => string, locale: 'zh' | 'en'): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return t('news.minutesAgoValue').replace('{value}', formatLocaleNumber(mins, locale));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('news.hoursAgoValue').replace('{value}', formatLocaleNumber(hours, locale));
  return t('news.daysAgoValue').replace('{value}', formatLocaleNumber(Math.floor(hours / 24), locale));
}

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  if (sentiment === 'bullish') return <TrendingUp className="w-3 h-3" />;
  if (sentiment === 'bearish') return <TrendingDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
};

export default function NewsPage() {
  const { t, locale } = useI18n();
  const formatCount = (value: number) => formatLocaleNumber(value, locale);
  const [category, setCategory] = useState<NewsCategory | undefined>(undefined);
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const { news: MOCK_NEWS, isLive } = useNewsData();

  let filtered = category ? MOCK_NEWS.filter(n => n.category === category) : MOCK_NEWS;
  if (sentimentFilter !== 'all') filtered = filtered.filter(n => n.sentiment === sentimentFilter);

  const bullishCount = MOCK_NEWS.filter(n => n.sentiment === 'bullish').length;
  const bearishCount = MOCK_NEWS.filter(n => n.sentiment === 'bearish').length;
  const highImpact = MOCK_NEWS.filter(n => n.impact === 'high');

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">{t('news.title')}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{t('news.countLabel').replace('{count}', formatCount(MOCK_NEWS.length))}</p>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
          isLive ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-300'
        }`}>
          {isLive ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {isLive ? t('news.live') : t('news.delayed')}
        </div>
      </div>

      {/* Market Sentiment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-gray-400">{t('news.bullish')}</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">{formatCount(bullishCount)}</div>
        </div>
        <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-gray-400">{t('news.bearish')}</span>
          </div>
          <div className="text-2xl font-mono font-bold text-red-400">{formatCount(bearishCount)}</div>
        </div>
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-gray-400">{t('news.highImpact')}</span>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400">{formatCount(highImpact.length)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-1">
        <div className="flex gap-1">
          {NEWS_CATEGORIES.map(({ id, label, labelEn, icon }) => (
            <button key={id} onClick={() => setCategory(id === 'all' ? undefined : id as NewsCategory)}
              aria-pressed={(id === 'all' && !category) || category === id}
              aria-label={t('news.categoryFilterLabel').replace('{label}', locale === 'en' ? labelEn : label)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
                (id === 'all' && !category) || category === id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800'
              }`}>
              <span className="text-[10px]">{icon}</span>{locale === 'en' ? labelEn : label}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-gray-800" />
        <div className="flex gap-1">
          {[
            { id: 'all', label: t('news.all') },
            { id: 'bullish', label: t('news.bullish') },
            { id: 'bearish', label: t('news.bearish') },
          ].map(f => (
            <button key={f.id} onClick={() => setSentimentFilter(f.id)}
              aria-pressed={sentimentFilter === f.id}
              aria-label={t('news.sentimentFilterLabel').replace('{label}', f.label)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                sentimentFilter === f.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="space-y-2">
        {filtered.map(item => (
          <div key={item.id} className="border border-gray-800/50 rounded-lg p-4 bg-gray-900/30 hover:bg-gray-900/60 transition-all group">
            <div className="flex items-start gap-3">
              {/* Sentiment dot */}
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                item.sentiment === 'bullish' ? 'bg-emerald-400' : item.sentiment === 'bearish' ? 'bg-red-400' : 'bg-gray-500'
              }`} />

              <div className="flex-1 min-w-0">
                {/* Title + Impact */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors leading-snug">
                    {item.impact === 'high' && <Flame className="w-3 h-3 text-red-400 inline mr-1 -mt-0.5" />}
                    {localizeNewsText(item.title, locale as 'zh' | 'en')}
                  </h3>
                </div>

                {/* Summary */}
                <p className="text-xs text-gray-500 leading-relaxed mb-2.5">{localizeNewsText(item.summary, locale as 'zh' | 'en')}</p>

                {/* Tags */}
                {item.tags && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.map((tag) => {
                      const localizedTag = localizeNewsText(tag, locale as 'zh' | 'en');
                      return <span key={localizedTag} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-400">#{localizedTag}</span>;
                    })}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-[10px]">
                  <span className={`font-medium px-1.5 py-0.5 rounded ${getSentimentBgColor(item.sentiment)}`}>
                    <SentimentIcon sentiment={item.sentiment} />
                  </span>
                  <span className="text-gray-500">{getSentimentLabel(item.sentiment, locale as 'zh' | 'en')}</span>
                  <span className={`${getImpactColor(item.impact)}`}>{getImpactLabel(item.impact, locale as 'zh' | 'en')}</span>
                  <span className="text-gray-600">{localizeNewsText(item.source, locale as 'zh' | 'en')}</span>
                  <span className="text-gray-600 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{formatTimeAgo(item.timestamp, t, locale)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-600 text-sm">{t('news.noResults')}</div>
      )}
    </div>
  );
}
