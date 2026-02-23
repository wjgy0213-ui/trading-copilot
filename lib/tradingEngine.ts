// 交易引擎 - 处理开仓、平仓、盈亏计算

import { Account, Trade, PositionSide } from './types';
import { getAccount, saveAccount } from './storage';
import { v4 as uuidv4 } from 'uuid';

/** 开仓参数 */
export interface OpenPositionParams {
  side: PositionSide;
  size: number; // 投入金额
  leverage: number; // 杠杆倍数
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
}

/** 开仓 */
export function openPosition(params: OpenPositionParams): { success: boolean; message: string; trade?: Trade } {
  const account = getAccount();
  
  // 检查余额是否足够
  if (account.balance < params.size) {
    return { success: false, message: '余额不足' };
  }
  
  // 检查仓位大小（不超过总资金的50%）
  if (params.size > account.equity * 0.5) {
    return { success: false, message: '单笔仓位过大，建议不超过总资金的50%' };
  }
  
  // 检查杠杆
  if (params.leverage < 1 || params.leverage > 10) {
    return { success: false, message: '杠杆必须在1-10倍之间' };
  }
  
  // 创建交易
  const trade: Trade = {
    id: uuidv4(),
    side: params.side,
    entryPrice: params.currentPrice,
    size: params.size,
    leverage: params.leverage,
    stopLoss: params.stopLoss,
    takeProfit: params.takeProfit,
    status: 'open',
    openedAt: Date.now(),
  };
  
  // 更新账户
  account.balance -= params.size;
  account.positions.push(trade);
  saveAccount(account);
  
  return { success: true, message: '开仓成功', trade };
}

/** 平仓 */
export function closePosition(tradeId: string, currentPrice: number): { success: boolean; message: string; pnl?: number } {
  const account = getAccount();
  const positionIndex = account.positions.findIndex(p => p.id === tradeId);
  
  if (positionIndex === -1) {
    return { success: false, message: '找不到该持仓' };
  }
  
  const position = account.positions[positionIndex];
  
  // 计算盈亏
  const pnl = calculatePnL(position, currentPrice);
  const pnlPercent = (pnl / position.size) * 100;
  
  // 更新交易记录
  position.exitPrice = currentPrice;
  position.status = 'closed';
  position.closedAt = Date.now();
  position.pnl = pnl;
  position.pnlPercent = pnlPercent;
  
  // 更新账户
  account.balance += position.size + pnl;
  account.positions.splice(positionIndex, 1);
  account.closedTrades.push(position);
  account.totalPnl += pnl;
  
  // 计算胜率
  const wins = account.closedTrades.filter(t => (t.pnl || 0) > 0).length;
  account.winRate = account.closedTrades.length > 0 ? wins / account.closedTrades.length : 0;
  
  // 计算最大回撤
  account.maxDrawdown = calculateMaxDrawdown(account);
  
  // 更新权益
  account.equity = calculateEquity(account, currentPrice);
  
  saveAccount(account);
  
  return { success: true, message: `平仓成功，盈亏: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`, pnl };
}

/** 计算盈亏 */
export function calculatePnL(trade: Trade, currentPrice: number): number {
  const priceChange = trade.side === 'long' 
    ? currentPrice - trade.entryPrice 
    : trade.entryPrice - currentPrice;
  
  const priceChangePercent = priceChange / trade.entryPrice;
  const leveragedGain = priceChangePercent * trade.leverage;
  
  return trade.size * leveragedGain;
}

/** 计算账户权益（余额 + 未实现盈亏） */
export function calculateEquity(account: Account, currentPrice: number): number {
  const unrealizedPnL = account.positions.reduce((sum, pos) => {
    return sum + calculatePnL(pos, currentPrice);
  }, 0);
  
  return account.balance + unrealizedPnL;
}

/** 计算最大回撤 */
export function calculateMaxDrawdown(account: Account): number {
  if (account.closedTrades.length === 0) return 0;
  
  let peak = 500; // 初始资金
  let maxDrawdown = 0;
  
  account.closedTrades.forEach(trade => {
    const currentValue = peak + (trade.pnl || 0);
    const drawdown = (peak - currentValue) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
    peak = Math.max(peak, currentValue);
  });
  
  return maxDrawdown;
}

/** 检查是否触发止损止盈 */
export function checkStopLossAndTakeProfit(account: Account, currentPrice: number): string[] {
  const messages: string[] = [];
  
  account.positions.forEach(position => {
    // 检查止损
    if (position.stopLoss) {
      const shouldTriggerStopLoss = position.side === 'long' 
        ? currentPrice <= position.stopLoss 
        : currentPrice >= position.stopLoss;
      
      if (shouldTriggerStopLoss) {
        const result = closePosition(position.id, currentPrice);
        if (result.success) {
          messages.push(`触发止损：${result.message}`);
        }
      }
    }
    
    // 检查止盈
    if (position.takeProfit) {
      const shouldTriggerTakeProfit = position.side === 'long' 
        ? currentPrice >= position.takeProfit 
        : currentPrice <= position.takeProfit;
      
      if (shouldTriggerTakeProfit) {
        const result = closePosition(position.id, currentPrice);
        if (result.success) {
          messages.push(`触发止盈：${result.message}`);
        }
      }
    }
  });
  
  return messages;
}
