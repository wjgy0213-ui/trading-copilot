'use client';

import { useState } from 'react';
import { MOCK_NEWS, NEWS_CATEGORIES, NewsCategory, getSentimentColor, getSentimentBgColor, getSentimentLabel, getNewsByCategory } from '@/lib/mockNews';
import { Newspaper, TrendingUp, Clock } from 'lucide-react';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | undefined>(undefined);

  const filteredNews = getNewsByCategory(selectedCategory);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor(diff / (60 * 1000));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else {
      return `${minutes}分钟前`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
            加密资讯
          </h1>
          <p className="text-gray-400">实时追踪市场动态，把握交易机会</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === undefined
                  ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              全部
            </button>
            {NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400'
                    : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* News Timeline */}
        <div className="space-y-4">
          {filteredNews.map((news) => (
            <div
              key={news.id}
              className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Sentiment Indicator */}
                <div className={`w-1 h-full rounded-full ${
                  news.sentiment === 'bullish' ? 'bg-green-500' : news.sentiment === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
                }`} />

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 leading-tight">{news.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSentimentBgColor(news.sentiment)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            news.sentiment === 'bullish' ? 'bg-green-400' : news.sentiment === 'bearish' ? 'bg-red-400' : 'bg-gray-400'
                          }`} />
                          {getSentimentLabel(news.sentiment)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {NEWS_CATEGORIES.find(c => c.id === news.category)?.name}
                        </span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{news.source}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm whitespace-nowrap">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(news.timestamp)}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-400 text-sm leading-relaxed">{news.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-orange-950/20 border border-orange-800/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Newspaper className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-1">关于资讯来源</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                资讯内容整合自金色财经、CoinDesk、链上数据平台等权威来源。情绪标签由算法自动判断，仅供参考。
                请结合多方信息独立判断，理性决策。
              </p>
              <p className="text-xs text-gray-600 mt-2">
                * 资讯每小时更新，不构成投资建议
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
