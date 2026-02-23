// 本地存储工具 - 使用localStorage存储交易数据

import { Account, Trade, AIScore } from './types';

const STORAGE_KEY = 'trading-copilot';

/** 默认账户 */
const DEFAULT_ACCOUNT: Account = {
  balance: 500,
  equity: 500,
  positions: [],
  closedTrades: [],
  totalPnl: 0,
  winRate: 0,
  maxDrawdown: 0,
};

/** 获取账户数据 */
export function getAccount(): Account {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNT;
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return DEFAULT_ACCOUNT;
  
  try {
    return JSON.parse(data) as Account;
  } catch {
    return DEFAULT_ACCOUNT;
  }
}

/** 保存账户数据 */
export function saveAccount(account: Account): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

/** 重置账户 */
export function resetAccount(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNT));
}

/** 获取AI评分记录 */
export function getAIScores(): Record<string, AIScore> {
  if (typeof window === 'undefined') return {};
  
  const data = localStorage.getItem(`${STORAGE_KEY}-scores`);
  if (!data) return {};
  
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/** 保存AI评分 */
export function saveAIScore(score: AIScore): void {
  if (typeof window === 'undefined') return;
  
  const scores = getAIScores();
  scores[score.tradeId] = score;
  localStorage.setItem(`${STORAGE_KEY}-scores`, JSON.stringify(scores));
}
