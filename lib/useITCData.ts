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
const ITC_MAP: Record<string, { id: string; name: string; nameEn: string; category: ITCIndicator['category']; description: string; descriptionEn: string }> = {
  BTC: { id: 'btc-risk', name: 'BTC 风险', nameEn: 'BTC Risk', category: 'crypto', description: '基于价格回归模型的BTC长周期风险值。0.3以下为历史性买入区间。', descriptionEn: 'BTC long-cycle risk based on price regression models. Below 0.3 has historically marked deep value zones.' },
  ETH: { id: 'eth-risk', name: 'ETH 风险', nameEn: 'ETH Risk', category: 'crypto', description: '以太坊长周期风险指标。', descriptionEn: 'Ethereum long-cycle risk indicator.' },
  TOTAL: { id: 'total-market-risk', name: '市场总风险', nameEn: 'Total Market Risk', category: 'crypto', description: '加密货币总市值风险指标。', descriptionEn: 'Aggregate crypto market-cap risk gauge.' },
  SOL: { id: 'sol-risk', name: 'SOL 风险', nameEn: 'SOL Risk', category: 'crypto', description: 'Solana长周期风险指标。', descriptionEn: 'Solana long-cycle risk indicator.' },
  'BTC.D': { id: 'btc-dominance-risk', name: 'BTC.D 风险', nameEn: 'BTC.D Risk', category: 'crypto', description: 'ITC BTC Dominance长周期风险指标（非真实市占率）。', descriptionEn: 'ITC BTC Dominance long-cycle risk indicator, not the spot market dominance share.' },
  XRP: { id: 'xrp-risk', name: 'XRP 风险', nameEn: 'XRP Risk', category: 'crypto', description: 'XRP长周期风险指标。', descriptionEn: 'XRP long-cycle risk indicator.' },
  LINK: { id: 'link-risk', name: 'LINK 风险', nameEn: 'LINK Risk', category: 'crypto', description: 'Chainlink长周期风险指标。', descriptionEn: 'Chainlink long-cycle risk indicator.' },
  DOGE: { id: 'doge-risk', name: 'DOGE 风险', nameEn: 'DOGE Risk', category: 'crypto', description: 'Dogecoin长周期风险指标。', descriptionEn: 'Dogecoin long-cycle risk indicator.' },
  BNB: { id: 'bnb-risk', name: 'BNB 风险', nameEn: 'BNB Risk', category: 'crypto', description: 'BNB长周期风险指标。', descriptionEn: 'BNB long-cycle risk indicator.' },
  AVAX: { id: 'avax-risk', name: 'AVAX 风险', nameEn: 'AVAX Risk', category: 'crypto', description: 'Avalanche长周期风险指标。', descriptionEn: 'Avalanche long-cycle risk indicator.' },
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
            descriptionEn: `Bitcoin accounts for ${data.btcDominance.toFixed(1)}% of total crypto market cap. Higher usually means stronger defensive positioning, lower can hint at alt rotation.`,
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
            descriptionEn: `Market sentiment is ${data.fearGreed.value_classification}. Current reading: ${data.fearGreed.value}/100.`,
          });
        }

        // Add on-chain metrics
        if (onChainRes?.ok) {
          const onChain = await onChainRes.json();
          for (const m of (onChain.metrics || [])) {
            // For display: use risk (0-1) when meaningful, otherwise derive from value
            let displayValue: number;
            if (m.id === 'running-roi') {
              // ROI: map -50%..+200% → 0..1 scale (negative=low risk, high positive=high risk)
              displayValue = Math.min(1, Math.max(0, (m.value + 0.5) / 2.5));
            } else if (m.id === 'log-regression') {
              // Ratio to fair value: 0..2 → 0..1 (below 1 = undervalued)
              displayValue = Math.min(1, Math.max(0, m.value / 2));
            } else if (m.id === 'cowen-corridor') {
              // Already 0-1 (position in corridor)
              displayValue = Math.min(1, Math.max(0, m.value));
            } else {
              displayValue = Math.min(1, Math.max(0, m.risk));
            }
            const category: ITCIndicator['category'] =
              m.category === 'on-chain' || m.category === 'weightless' || m.category === 'price'
                ? m.category
                : 'crypto';
            real.push({
              id: m.id,
              name: m.name,
              nameEn: m.nameEn,
              value: displayValue,
              history: currentSnapshot(displayValue),
              category,
              description: m.description,
              descriptionEn: m.nameEn,
            });
          }
        }

        setIndicators(real);
        setPrices(data.prices);
        setIsLive(true);
        setError(null);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error');
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
