'use client';

import { getRank, getNextRank, getProgress } from '@/lib/rankSystem';

interface RankBadgeProps {
  totalTrades: number;
  winRate: number;
  showProgress?: boolean;
}

export default function RankBadge({ totalTrades, winRate, showProgress = false }: RankBadgeProps) {
  const rank = getRank(totalTrades, winRate);
  const next = getNextRank(totalTrades, winRate);
  const progress = getProgress(totalTrades, winRate);

  return (
    <div className={`rounded-xl p-5 border ${rank.bgColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{rank.icon}</span>
          <div>
            <div className={`text-lg font-bold ${rank.color}`}>{rank.name}段位</div>
            <div className="text-xs text-gray-500">{totalTrades} 笔交易 · 胜率 {(winRate * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
      
      {showProgress && next && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>距离 {next.icon} {next.name}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            需要: {next.minTrades} 笔交易 + {(next.minWinRate * 100).toFixed(0)}% 胜率
          </div>
        </div>
      )}
    </div>
  );
}
