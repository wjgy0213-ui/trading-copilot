// 交易分析器 - 基于历史交易生成优化建议

import { Trade } from './types';

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
export function analyzePerformance(trades: Trade[]): PerformanceAnalysis {
  if (trades.length === 0) {
    return {
      winRate: 0,
      avgRR: 0,
      maxDrawdown: 0,
      totalTrades: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      suggestions: ['开始交易以获取分析数据'],
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
      suggestions: ['暂无已平仓交易，继续练习'],
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
    suggestions.push('⚠️ 胜率偏低（<40%），建议优化入场时机，等待更明确的信号');
  } else if (winRate > 70) {
    suggestions.push('✅ 胜率优秀（>70%），继续保持，可适当提高盈亏比目标');
  }
  
  // 盈亏比建议
  if (avgRR < 1.0) {
    suggestions.push('⚠️ 盈亏比过低（<1:1），建议拉大止盈目标或收紧止损');
  } else if (avgRR < 1.5) {
    suggestions.push('💡 盈亏比可以提升，尝试将止盈设置为止损的2倍以上');
  } else if (avgRR >= 2.0) {
    suggestions.push('✅ 盈亏比优秀（>=2:1），风险管理做得很好');
  }
  
  // 盈利因子建议
  if (profitFactor < 1.0) {
    suggestions.push('🔴 盈利因子<1，整体亏损，建议暂停实盘，回顾交易记录找问题');
  } else if (profitFactor < 1.5) {
    suggestions.push('💡 盈利因子偏低，可通过提高胜率或盈亏比来改善');
  } else if (profitFactor >= 2.0) {
    suggestions.push('✅ 盈利因子优秀（>=2.0），策略表现稳健');
  }
  
  // 回撤建议
  if (maxDrawdown > 20) {
    suggestions.push('⚠️ 最大回撤过大（>20%），建议减小仓位或优化止损策略');
  } else if (maxDrawdown > 15) {
    suggestions.push('💡 回撤稍大，可考虑降低单笔风险敞口');
  } else if (maxDrawdown <= 10) {
    suggestions.push('✅ 回撤控制优秀（<=10%），风险管理到位');
  }
  
  // 交易数量建议
  if (closedTrades.length < 10) {
    suggestions.push('📊 交易样本较少（<10笔），继续积累数据以获得更准确的分析');
  } else if (closedTrades.length >= 30) {
    suggestions.push('✅ 交易样本充足（>=30笔），数据统计更具参考价值');
  }
  
  // 止损止盈使用情况
  const hasStopLoss = closedTrades.filter(t => t.stopLoss).length;
  const hasTakeProfit = closedTrades.filter(t => t.takeProfit).length;
  
  if (hasStopLoss / closedTrades.length < 0.8) {
    suggestions.push('⚠️ 大部分交易未设置止损，这非常危险！强烈建议每笔交易都设置止损');
  }
  
  if (hasTakeProfit / closedTrades.length < 0.8) {
    suggestions.push('💡 建议每笔交易都设置止盈目标，避免盈利回吐');
  }
  
  // 杠杆使用建议
  const avgLeverage = closedTrades.reduce((sum, t) => sum + t.leverage, 0) / closedTrades.length;
  
  if (avgLeverage > 5) {
    suggestions.push('⚠️ 平均杠杆过高（>5x），高杠杆会放大风险，建议降低杠杆倍数');
  } else if (avgLeverage > 3) {
    suggestions.push('💡 杠杆适中，但仍需谨慎控制仓位大小');
  }
  
  // 如果没有明显问题，给出正向建议
  if (suggestions.length === 0) {
    suggestions.push('🎉 整体表现良好，继续保持纪律，稳定执行策略');
  }
  
  // 始终添加一条策略优化建议
  if (winRate < 50 || avgRR < 1.5) {
    suggestions.push('🔧 考虑在策略工坊回测不同参数，找到更适合当前市场的策略');
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
export function getRecentPerformanceSummary(trades: Trade[], days: number = 7): string {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recentTrades = trades.filter(t => 
    t.status === 'closed' && 
    (t.closedAt || 0) > cutoff
  );
  
  if (recentTrades.length === 0) {
    return `最近${days}天无交易记录`;
  }
  
  const totalPnl = recentTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = recentTrades.filter(t => (t.pnl || 0) > 0).length;
  
  return `最近${days}天：${recentTrades.length}笔交易，${wins}胜${recentTrades.length - wins}负，${totalPnl > 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
}
