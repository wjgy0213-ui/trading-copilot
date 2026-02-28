'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BarChart3, ArrowRight } from 'lucide-react';
import { Trade } from '@/lib/types';
import { analyzePerformance, PerformanceAnalysis } from '@/lib/tradeAnalyzer';

interface TradeInsightsProps {
  trades: Trade[];
}

export default function TradeInsights({ trades }: TradeInsightsProps) {
  const analysis = useMemo(() => analyzePerformance(trades), [trades]);

  if (analysis.totalTrades === 0 && analysis.suggestions.length <= 1) return null;

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <span className="font-semibold text-sm">交易分析</span>
        <span className="text-xs text-gray-500 ml-auto">{analysis.totalTrades}笔交易</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="胜率" value={`${(analysis.winRate * 100).toFixed(0)}%`} good={analysis.winRate >= 0.45} />
        <Stat label="盈亏比" value={`1:${analysis.avgRR.toFixed(1)}`} good={analysis.avgRR >= 1.5} />
        <Stat label="盈利因子" value={analysis.profitFactor.toFixed(1)} good={analysis.profitFactor >= 1.2} />
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        {analysis.suggestions.map((s, i) => (
          <div key={i} className="text-xs p-2 rounded-lg border bg-blue-900/10 border-blue-700/20 text-blue-300">
            {s}
          </div>
        ))}
      </div>

      {/* CTA */}
      {analysis.totalTrades >= 5 && (
        <Link
          href="/strategy"
          className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-400 hover:text-blue-300 py-2 rounded-lg bg-blue-900/10 hover:bg-blue-900/20 transition"
        >
          优化我的策略 <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm font-bold ${good ? 'text-green-400' : 'text-yellow-400'}`}>{value}</div>
    </div>
  );
}
