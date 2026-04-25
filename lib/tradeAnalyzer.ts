// 交易分析器 - 基于历史交易生成优化建议

import { Trade } from './types';
import type { Locale } from './i18n';
import { i18nText } from './i18n-helpers';

/** 交易表现分析结果 */
export interface PerformanceAnalysis {
  winRate: number; // 胜率 (0-100)
  avgRR: number; // 平均盈亏比 (R:R)
  maxDrawdown: number; // 最大回撤百分比
  totalTrades: number; // 总交易笔数
  profitFactor: number; // 盈利因子
  avgWin: number; // 平均盈利
  avgLoss: number; // 平均亏损
  suggestions: string[]; // 优化建议
}

/** 分析交易表现并生成建议 */
export function analyzePerformance(trades: Trade[], locale: Locale = 'zh'): PerformanceAnalysis {
  if (trades.length === 0) {
    return {
      winRate: 0,
      avgRR: 0,
      maxDrawdown: 0,
      totalTrades: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      suggestions: [i18nText(locale, 'analysis.start_trading')],
    };
  }
  
  // 只分析已平仓的交易
  const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
  
  if (closedTrades.length === 0) {
    return {
      winRate: 0,
      avgRR: 0,
      maxDrawdown: 0,
      totalTrades: trades.length,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      suggestions: [i18nText(locale, 'analysis.no_closed_trades')],
    };
  }
  
  // 计算基础指标
  const wins = closedTrades.filter(t => (t.pnl || 0) > 0);
  const losses = closedTrades.filter(t => (t.pnl || 0) < 0);
  
  const winRate = (wins.length / closedTrades.length) * 100;
  
  const totalWin = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
  
  const avgWin = wins.length > 0 ? totalWin / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLoss / losses.length : 0;
  
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;
  const profitFactor = totalLoss > 0 ? totalWin / totalLoss : 0;
  
  // 计算最大回撤
  let peak = 10000; // 假设初始金额
  let maxDrawdown = 0;
  let equity = peak;
  
  closedTrades.forEach(t => {
    equity += (t.pnl || 0);
    if (equity > peak) {
      peak = equity;
    } else {
      const drawdown = ((peak - equity) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  });
  
  // 生成优化建议
  const suggestions: string[] = [];
  
  // 胜率建议
  if (winRate < 40) {
    suggestions.push(i18nText(locale, 'analysis.winrate_low'));
  } else if (winRate > 70) {
    suggestions.push(i18nText(locale, 'analysis.winrate_high'));
  }
  
  // 盈亏比建议
  if (avgRR < 1.0) {
    suggestions.push(i18nText(locale, 'analysis.rr_low'));
  } else if (avgRR < 1.5) {
    suggestions.push(i18nText(locale, 'analysis.rr_mid'));
  } else if (avgRR >= 2.0) {
    suggestions.push(i18nText(locale, 'analysis.rr_high'));
  }
  
  // 盈利因子建议
  if (profitFactor < 1.0) {
    suggestions.push(i18nText(locale, 'analysis.profit_factor_low'));
  } else if (profitFactor < 1.5) {
    suggestions.push(i18nText(locale, 'analysis.profit_factor_mid'));
  } else if (profitFactor >= 2.0) {
    suggestions.push(i18nText(locale, 'analysis.profit_factor_high'));
  }
  
  // 回撤建议
  if (maxDrawdown > 20) {
    suggestions.push(i18nText(locale, 'analysis.drawdown_high'));
  } else if (maxDrawdown > 15) {
    suggestions.push(i18nText(locale, 'analysis.drawdown_mid'));
  } else if (maxDrawdown <= 10) {
    suggestions.push(i18nText(locale, 'analysis.drawdown_low'));
  }
  
  // 交易数量建议
  if (closedTrades.length < 10) {
    suggestions.push(i18nText(locale, 'analysis.sample_low'));
  } else if (closedTrades.length >= 30) {
    suggestions.push(i18nText(locale, 'analysis.sample_high'));
  }
  
  // 止损止盈使用情况
  const hasStopLoss = closedTrades.filter(t => t.stopLoss).length;
  const hasTakeProfit = closedTrades.filter(t => t.takeProfit).length;
  
  if (hasStopLoss / closedTrades.length < 0.8) {
    suggestions.push(i18nText(locale, 'analysis.stop_loss_missing'));
  }
  
  if (hasTakeProfit / closedTrades.length < 0.8) {
    suggestions.push(i18nText(locale, 'analysis.take_profit_missing'));
  }
  
  // 杠杆使用建议
  const avgLeverage = closedTrades.reduce((sum, t) => sum + t.leverage, 0) / closedTrades.length;
  
  if (avgLeverage > 5) {
    suggestions.push(i18nText(locale, 'analysis.leverage_high'));
  } else if (avgLeverage > 3) {
    suggestions.push(i18nText(locale, 'analysis.leverage_mid'));
  }
  
  // 如果没有明显问题，给出正向建议
  if (suggestions.length === 0) {
    suggestions.push(i18nText(locale, 'analysis.overall_good'));
  }
  
  // 始终添加一条策略优化建议
  if (winRate < 50 || avgRR < 1.5) {
    suggestions.push(i18nText(locale, 'analysis.optimize_strategy'));
  }
  
  return {
    winRate,
    avgRR,
    maxDrawdown,
    totalTrades: closedTrades.length,
    profitFactor,
    avgWin,
    avgLoss,
    suggestions,
  };
}

/** 获取最近表现总结 */
export function getRecentPerformanceSummary(trades: Trade[], days: number = 7, locale: Locale = 'zh'): string {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentTrades = trades.filter(t => 
    t.status === 'closed' && 
    (t.closedAt || 0) > cutoff
  );
  
  if (recentTrades.length === 0) {
    return i18nText(locale, 'analysis.recent_none', { days });
  }
  
  const totalPnl = recentTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = recentTrades.filter(t => (t.pnl || 0) > 0).length;
  
  return i18nText(locale, 'analysis.recent_summary', {
    days,
    trades: recentTrades.length,
    wins,
    losses: recentTrades.length - wins,
    pnl: `${totalPnl > 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,
  });
}
