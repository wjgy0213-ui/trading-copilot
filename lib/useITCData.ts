'use client';

import { useState, useEffect } from 'react';
import { ITCIndicators as mockIndicators, type ITCIndicator } from './mockData';

interface APIResponse {
  itc: Record<string, number>;
  fearGreed: { value: string; value_classification: string };
  prices: { BTC: number; ETH: number };
  timestamp: number;
}

// Map ITC API keys to our indicator IDs
const ITC_MAP: Record<string, { id: string; name: string; nameEn: string; category: ITCIndicator['category']; description: string }> = {
  BTC: { id: 'btc-risk', name: 'BTC 风险', nameEn: 'BTC Risk', category: 'crypto', description: '基于价格回归模型的BTC长周期风险值。0.3以下为历史性买入区间。' },
  ETH: { id: 'eth-risk', name: 'ETH 风险', nameEn: 'ETH Risk', category: 'crypto', description: '以太坊长周期风险指标。' },
  TOTAL: { id: 'total-market-risk', name: '市场总风险', nameEn: 'Total Market Risk', category: 'crypto', description: '加密货币总市值风险指标。' },
  SOL: { id: 'sol-risk', name: 'SOL 风险', nameEn: 'SOL Risk', category: 'crypto', description: 'Solana长周期风险指标。' },
  'BTC.D': { id: 'btc-dominance', name: 'BTC 市占率', nameEn: 'BTC Dominance', category: 'crypto', description: 'BTC市值占加密总市值比例。' },
  XRP: { id: 'xrp-risk', name: 'XRP 风险', nameEn: 'XRP Risk', category: 'crypto', description: 'XRP长周期风险指标。' },
  LINK: { id: 'link-risk', name: 'LINK 风险', nameEn: 'LINK Risk', category: 'crypto', description: 'Chainlink长周期风险指标。' },
  DOGE: { id: 'doge-risk', name: 'DOGE 风险', nameEn: 'DOGE Risk', category: 'crypto', description: 'Dogecoin长周期风险指标。' },
  BNB: { id: 'bnb-risk', name: 'BNB 风险', nameEn: 'BNB Risk', category: 'crypto', description: 'BNB长周期风险指标。' },
  AVAX: { id: 'avax-risk', name: 'AVAX 风险', nameEn: 'AVAX Risk', category: 'crypto', description: 'Avalanche长周期风险指标。' },
};

// Generate fake history around a real value (API only gives current snapshot)
function fakeHistory(value: number, days: number = 180): { timestamp: number; value: number }[] {
  const now = Date.now();
  const history: { timestamp: number; value: number }[] = [];
  // Walk backwards with random noise, ending at current value
  let v = value;
  const pts: number[] = [value];
  for (let i = 1; i <= days; i++) {
    v += (Math.random() - 0.52) * 0.03; // slight mean reversion
    v = Math.max(0, Math.min(1, v));
    pts.unshift(v);
  }
  for (let i = 0; i <= days; i++) {
    history.push({ timestamp: now - (days - i) * 86400000, value: pts[i] });
  }
  return history;
}

export function useITCData(): { indicators: ITCIndicator[]; prices: { BTC: number; ETH: number } | null; loading: boolean; error: string | null; isLive: boolean } {
  const [indicators, setIndicators] = useState<ITCIndicator[]>(mockIndicators);
  const [prices, setPrices] = useState<{ BTC: number; ETH: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/itc');
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data: APIResponse = await res.json();
        if (cancelled) return;

        // Build indicators from real ITC data
        const real: ITCIndicator[] = [];
        for (const [key, meta] of Object.entries(ITC_MAP)) {
          const val = data.itc[key];
          if (val !== undefined) {
            real.push({
              ...meta,
              value: val,
              history: fakeHistory(val),
            });
          }
        }

        // Add Fear & Greed from API
        if (data.fearGreed?.value) {
          const fgVal = parseInt(data.fearGreed.value) / 100;
          real.push({
            id: 'fear-greed', name: '恐惧贪婪指数', nameEn: 'Fear & Greed',
            value: fgVal, history: fakeHistory(fgVal),
            category: 'crypto',
            description: `市场情绪：${data.fearGreed.value_classification}。当前值 ${data.fearGreed.value}/100。`,
          });
        }

        setIndicators(real);
        setPrices(data.prices);
        setIsLive(true);
        setError(null);
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
          // Keep mock data as fallback
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { indicators, prices, loading, error, isLive };
}
