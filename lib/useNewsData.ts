'use client';

import { useState, useEffect } from 'react';
import { MOCK_NEWS, type NewsItem } from './mockNews';

export function useNewsData() {
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.news?.length > 0) {
          // Merge: real news first, then mock news as fallback filler
          const realNews: NewsItem[] = data.news.map((n: any, i: number) => ({
            id: `live-${i}`,
            ...n,
          }));
          // Append mock news with adjusted timestamps so they appear older
          const mockAged = MOCK_NEWS.map((n, i) => ({
            ...n,
            id: `mock-${i}`,
            timestamp: Date.now() - (i + realNews.length) * 3600000,
          }));
          setNews([...realNews, ...mockAged]);
          setIsLive(true);
        }
      } catch {
        // Keep mock data
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { news, loading, isLive };
}
