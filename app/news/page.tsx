'use client';

import { useState } from 'react';
import { MOCK_NEWS, NEWS_CATEGORIES, type NewsCategory, getSentimentBgColor, getSentimentLabel, getImpactColor, getImpactLabel } from '@/lib/mockNews';
import { Clock, Flame, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  return `${Math.floor(hours / 24)}天前`;
}

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  if (sentiment === 'bullish') return <TrendingUp className="w-3 h-3" />;
  if (sentiment === 'bearish') return <TrendingDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
};

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory | undefined>(undefined);
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

  let filtered = category ? MOCK_NEWS.filter(n => n.category === category) : MOCK_NEWS;
  if (sentimentFilter !== 'all') filtered = filtered.filter(n => n.sentiment === sentimentFilter);

  const bullishCount = MOCK_NEWS.filter(n => n.sentiment === 'bullish').length;
  const bearishCount = MOCK_NEWS.filter(n => n.sentiment === 'bearish').length;
  const highImpact = MOCK_NEWS.filter(n => n.impact === 'high');

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">市场资讯</h1>
          <p className="text-xs text-gray-500 mt-0.5">{MOCK_NEWS.length} 条资讯 · 实时更新</p>
        </div>
      </div>

      {/* Market Sentiment Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-gray-400">利好信号</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">{bullishCount}</div>
        </div>
        <div className="border border-red-500/20 bg-red-500/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-gray-400">利空信号</span>
          </div>
          <div className="text-2xl font-mono font-bold text-red-400">{bearishCount}</div>
        </div>
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-gray-400">高影响事件</span>
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400">{highImpact.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-1">
        <div className="flex gap-1">
          {NEWS_CATEGORIES.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setCategory(id === 'all' ? undefined : id as NewsCategory)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
                (id === 'all' && !category) || category === id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800'
              }`}>
              <span className="text-[10px]">{icon}</span>{label}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-gray-800" />
        <div className="flex gap-1">
          {[
            { id: 'all', label: '全部' },
            { id: 'bullish', label: '利好' },
            { id: 'bearish', label: '利空' },
          ].map(f => (
            <button key={f.id} onClick={() => setSentimentFilter(f.id)}
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
                    {item.title}
                  </h3>
                </div>

                {/* Summary */}
                <p className="text-xs text-gray-500 leading-relaxed mb-2.5">{item.summary}</p>

                {/* Tags */}
                {item.tags && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-400">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-[10px]">
                  <span className={`font-medium px-1.5 py-0.5 rounded ${getSentimentBgColor(item.sentiment)}`}>
                    <SentimentIcon sentiment={item.sentiment} />
                  </span>
                  <span className={`${getImpactColor(item.impact)}`}>{getImpactLabel(item.impact)}</span>
                  <span className="text-gray-600">{item.source}</span>
                  <span className="text-gray-600 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{formatTimeAgo(item.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-600 text-sm">暂无匹配的资讯</div>
      )}
    </div>
  );
}
