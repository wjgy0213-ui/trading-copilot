export interface Rank {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  minTrades: number;
  minWinRate: number;
}

export const RANKS: Rank[] = [
  { name: '青铜', icon: '🥉', color: 'text-orange-400', bgColor: 'bg-orange-400/10 border-orange-400/20', minTrades: 0, minWinRate: 0 },
  { name: '白银', icon: '🥈', color: 'text-gray-300', bgColor: 'bg-gray-300/10 border-gray-300/20', minTrades: 10, minWinRate: 0.3 },
  { name: '黄金', icon: '🏅', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/20', minTrades: 30, minWinRate: 0.45 },
  { name: '铂金', icon: '💎', color: 'text-cyan-400', bgColor: 'bg-cyan-400/10 border-cyan-400/20', minTrades: 60, minWinRate: 0.55 },
  { name: '钻石', icon: '👑', color: 'text-purple-400', bgColor: 'bg-purple-400/10 border-purple-400/20', minTrades: 100, minWinRate: 0.6 },
];

export function getRank(totalTrades: number, winRate: number): Rank {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalTrades >= r.minTrades && winRate >= r.minWinRate) {
      rank = r;
    }
  }
  return rank;
}

export function getNextRank(totalTrades: number, winRate: number): Rank | null {
  const current = getRank(totalTrades, winRate);
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function getProgress(totalTrades: number, winRate: number): number {
  const next = getNextRank(totalTrades, winRate);
  if (!next) return 100;
  const current = getRank(totalTrades, winRate);
  const tradeProgress = Math.min(1, (totalTrades - current.minTrades) / (next.minTrades - current.minTrades));
  const winRateProgress = next.minWinRate > 0 ? Math.min(1, winRate / next.minWinRate) : 1;
  return Math.floor((tradeProgress * 0.5 + winRateProgress * 0.5) * 100);
}
