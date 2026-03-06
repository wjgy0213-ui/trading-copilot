'use client';

import { useState, useEffect } from 'react';
import { ITCIndicators as mockIndicators, type ITCIndicator } from './mockData';

interface APIResponse {
  itc: Record<string, number>;
  fearGreed: { value: string; value_classification: string };
  prices: { BTC: number; ETH: number };
  btcDominance: number | null;
  totalMarketCap: number | null;
  timestamp: number;
}

// Map ITC API keys to our indicator IDs
const ITC_MAP: Record<string, { id: string; name: string; nameEn: string; category: ITCIndicator['category']; description: string }> = {
  BTC: { id: 'btc-risk', name: 'BTC 风险', nameEn: 'BTC Risk', category: 'crypto', description: '基于价格回归模型的BTC长周期风险值。0.3以下为历史性买入区间。' },
  ETH: { id: 'eth-risk', name: 'ETH 风险', nameEn: 'ETH Risk', category: 'crypto', description: '以太坊长周期风险指标。' },
  TOTAL: { id: 'total-market-risk', name: '市场总风险', nameEn: 'Total Market Risk', category: 'crypto', description: '加密货币总市值风险指标。' },
  SOL: { id: 'sol-risk', name: 'SOL 风险', nameEn: 'SOL Risk', category: 'crypto', description: 'Solana长周期风险指标。' },
  'BTC.D': { id: 'btc-dominance-risk', name: 'BTC.D 风险', nameEn: 'BTC.D Risk', category: 'crypto', description: 'ITC BTC Dominance长周期风险指标（非真实市占率）。' },
  XRP: { id: 'xrp-risk', name: 'XRP 风险', nameEn: 'XRP Risk', category: 'crypto', description: 'XRP长周期风险指标。' },
  LINK: { id: 'link-risk', name: 'LINK 风险', nameEn: 'LINK Risk', category: 'crypto', description: 'Chainlink长周期风险指标。' },
  DOGE: { id: 'doge-risk', name: 'DOGE 风险', nameEn: 'DOGE Risk', category: 'crypto', description: 'Dogecoin长周期风险指标。' },
  BNB: { id: 'bnb-risk', name: 'BNB 风险', nameEn: 'BNB Risk', category: 'crypto', description: 'BNB长周期风险指标。' },
  AVAX: { id: 'avax-risk', name: 'AVAX 风险', nameEn: 'AVAX Risk', category: 'crypto', description: 'Avalanche长周期风险指标。' },
};

// Return single-point history (current snapshot only — API doesn't provide historical data)
function currentSnapshot(value: number): { timestamp: number; value: number }[] {
  return [{ timestamp: Date.now(), value }];
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
        // Fetch both ITC price-based and on-chain metrics in parallel
        const [itcRes, onChainRes] = await Promise.all([
          fetch('/api/itc'),
          fetch('/api/itc/on-chain').catch(() => null),
        ]);
        if (!itcRes.ok) throw new Error(`API ${itcRes.status}`);
        const data: APIResponse = await itcRes.json();
        if (cancelled) return;

        // Build indicators from real ITC data
        const real: ITCIndicator[] = [];
        for (const [key, meta] of Object.entries(ITC_MAP)) {
          const val = data.itc[key];
          if (val !== undefined) {
            real.push({
              ...meta,
              value: val,
              history: currentSnapshot(val),
            });
          }
        }

        // Add BTC Dominance from CoinGecko
        if (data.btcDominance !== undefined && data.btcDominance !== null) {
          const domVal = data.btcDominance / 100;
          real.push({
            id: 'btc-dominance', name: 'BTC 市占率', nameEn: 'BTC Dominance',
            value: domVal, history: currentSnapshot(domVal),
            category: 'crypto',
            description: `BTC市值占加密总市值${data.btcDominance.toFixed(1)}%。高=避险情绪强，低=山寨币季节。`,
          });
        }

        // Add Fear & Greed from API
        if (data.fearGreed?.value) {
          const fgVal = parseInt(data.fearGreed.value) / 100;
          real.push({
            id: 'fear-greed', name: '恐惧贪婪指数', nameEn: 'Fear & Greed',
            value: fgVal, history: currentSnapshot(fgVal),
            category: 'crypto',
            description: `市场情绪：${data.fearGreed.value_classification}。当前值 ${data.fearGreed.value}/100。`,
          });
        }

        // Add on-chain metrics
        if (onChainRes?.ok) {
          const onChain = await onChainRes.json();
          for (const m of (onChain.metrics || [])) {
            // Use risk (0-1) for display since dashboard expects 0-1 range
            const displayValue = Math.min(1, Math.max(0, m.risk));
            real.push({
              id: m.id,
              name: m.name,
              nameEn: m.nameEn,
              value: displayValue,
              history: currentSnapshot(displayValue),
              category: m.category === 'on-chain' ? 'on-chain' as any : m.category === 'weightless' ? 'weightless' as any : 'crypto',
              description: m.description,
            });
          }
        }

        setIndicators(real);
        setPrices(data.prices);
        setIsLive(true);
        setError(null);
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
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
