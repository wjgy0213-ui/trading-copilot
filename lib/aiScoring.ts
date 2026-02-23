// AI评分系统 - V1简单版（基于规则的评分）

import { Trade, AIScore, Account } from './types';

/** 评估入场交易 */
export function scoreEntry(trade: Trade, account: Account): AIScore {
  let entryScore = 100;
  const feedback: string[] = [];
  
  // 检查止损
  const hasStopLoss = trade.stopLoss !== undefined;
  if (!hasStopLoss) {
    entryScore -= 30;
    feedback.push('❌ 未设置止损！强烈建议设置止损以控制风险');
  } else {
    feedback.push('✅ 已设置止损，风险管理良好');
  }
  
  // 检查止盈
  const hasTakeProfit = trade.takeProfit !== undefined;
  if (!hasTakeProfit) {
    entryScore -= 10;
    feedback.push('⚠️ 未设置止盈，建议设定目标价位');
  } else {
    feedback.push('✅ 已设置止盈，有明确的盈利目标');
  }
  
  // 检查仓位大小（不超过总资金的20%为优秀，20-50%为合理）
  const positionSizePercent = (trade.size / account.equity) * 100;
  const positionSizeOk = positionSizePercent <= 50;
  
  if (positionSizePercent > 50) {
    entryScore -= 30;
    feedback.push(`❌ 仓位过大(${positionSizePercent.toFixed(1)}%)，建议不超过总资金的50%`);
  } else if (positionSizePercent > 20) {
    entryScore -= 10;
    feedback.push(`⚠️ 仓位较大(${positionSizePercent.toFixed(1)}%)，建议控制在20%以内`);
  } else {
    feedback.push(`✅ 仓位合理(${positionSizePercent.toFixed(1)}%)，风险可控`);
  }
  
  // 检查杠杆（1-3x为保守，3-5x为适中，5-10x为激进）
  const leverageOk = trade.leverage <= 5;
  
  if (trade.leverage > 5) {
    entryScore -= 20;
    feedback.push(`⚠️ 杠杆较高(${trade.leverage}x)，高杠杆放大风险，新手建议使用1-3x`);
  } else if (trade.leverage > 3) {
    feedback.push(`ℹ️ 杠杆适中(${trade.leverage}x)，注意控制风险`);
  } else {
    feedback.push(`✅ 杠杆保守(${trade.leverage}x)，适合稳健交易`);
  }
  
  // 检查风险回报比（如果设置了止损和止盈）
  if (hasStopLoss && hasTakeProfit && trade.stopLoss && trade.takeProfit) {
    const risk = Math.abs(trade.entryPrice - trade.stopLoss);
    const reward = Math.abs(trade.takeProfit - trade.entryPrice);
    const riskRewardRatio = reward / risk;
    
    if (riskRewardRatio < 1) {
      entryScore -= 20;
      feedback.push(`❌ 风险回报比不佳(1:${riskRewardRatio.toFixed(2)})，建议至少1:1.5`);
    } else if (riskRewardRatio < 1.5) {
      feedback.push(`⚠️ 风险回报比一般(1:${riskRewardRatio.toFixed(2)})，可以更优化`);
    } else {
      feedback.push(`✅ 风险回报比良好(1:${riskRewardRatio.toFixed(2)})，符合交易原则`);
    }
  }
  
  return {
    tradeId: trade.id,
    entryScore: Math.max(0, entryScore),
    feedback: {
      entry: feedback,
    },
    flags: {
      hasStopLoss,
      hasTakeProfit,
      positionSizeOk,
      leverageOk,
    },
  };
}

/** 评估出场交易 */
export function scoreExit(trade: Trade, wasStopTriggered: boolean): Partial<AIScore> {
  let exitScore = 100;
  const feedback: string[] = [];
  
  if (!trade.pnl || !trade.exitPrice || !trade.closedAt) {
    return { exitScore: 0, feedback: { entry: [], exit: ['无效的交易数据'] } };
  }
  
  const holdingTime = trade.closedAt - trade.openedAt;
  const holdingHours = holdingTime / (1000 * 60 * 60);
  
  // 判断是否按计划出场
  const plannedExit = (trade.stopLoss && wasStopTriggered) || 
                       (trade.takeProfit && trade.pnl > 0);
  
  if (plannedExit) {
    feedback.push('✅ 按交易计划出场，执行力良好');
  } else {
    exitScore -= 20;
    feedback.push('⚠️ 未按计划出场，建议遵守交易纪律');
  }
  
  // 判断是否过早出场（盈利但未达到止盈）
  if (trade.pnl > 0 && trade.takeProfit && trade.exitPrice) {
    const reachedTarget = trade.side === 'long' 
      ? trade.exitPrice >= trade.takeProfit 
      : trade.exitPrice <= trade.takeProfit;
    
    if (!reachedTarget) {
      exitScore -= 15;
      feedback.push('⚠️ 提前止盈，可能错过更大收益');
    }
  }
  
  // 判断是否情绪化交易（持仓时间过短）
  const emotionalTrade = holdingHours < 1 && !wasStopTriggered;
  
  if (emotionalTrade) {
    exitScore -= 25;
    feedback.push('❌ 持仓时间过短，可能是情绪化交易，建议给市场更多时间');
  }
  
  // 判断亏损时是否死扛（未设置止损且亏损超过20%）
  if (trade.pnl < 0 && !trade.stopLoss) {
    const lossPercent = Math.abs((trade.pnl / trade.size) * 100);
    if (lossPercent > 20) {
      exitScore -= 30;
      feedback.push(`❌ 未设置止损且亏损${lossPercent.toFixed(1)}%，严重违反风控原则`);
    }
  }
  
  // 正面反馈
  if (trade.pnl > 0) {
    const profitPercent = (trade.pnl / trade.size) * 100;
    feedback.push(`✅ 盈利${profitPercent.toFixed(1)}%，交易成功！`);
  } else {
    const lossPercent = Math.abs((trade.pnl / trade.size) * 100);
    if (lossPercent <= 5) {
      feedback.push(`✅ 亏损控制良好(${lossPercent.toFixed(1)}%)，及时止损`);
    } else {
      feedback.push(`⚠️ 亏损${lossPercent.toFixed(1)}%，需要优化入场点位`);
    }
  }
  
  return {
    exitScore: Math.max(0, exitScore),
    feedback: { entry: [], exit: feedback },
    flags: { hasStopLoss: false, hasTakeProfit: false, positionSizeOk: true, leverageOk: true, emotionalTrade },
  };
}

/** 生成综合评分 */
export function generateOverallScore(entryScore: number, exitScore: number, account: Account): Partial<AIScore> {
  const overallScore = (entryScore + exitScore) / 2;
  const feedback: string[] = [];
  
  // 总体评价
  if (overallScore >= 90) {
    feedback.push('🌟 优秀！交易纪律严明，风险管理到位');
  } else if (overallScore >= 75) {
    feedback.push('👍 良好！继续保持交易纪律');
  } else if (overallScore >= 60) {
    feedback.push('⚠️ 及格，但还有提升空间');
  } else {
    feedback.push('❌ 需要改进！请重视风险管理和交易纪律');
  }
  
  // 账户统计建议
  if (account.winRate > 0) {
    feedback.push(`胜率: ${(account.winRate * 100).toFixed(1)}%`);
    if (account.winRate < 0.4) {
      feedback.push('⚠️ 胜率偏低，建议优化入场策略');
    }
  }
  
  if (account.maxDrawdown > 0.2) {
    feedback.push(`⚠️ 最大回撤${(account.maxDrawdown * 100).toFixed(1)}%，需要加强风控`);
  }
  
  return {
    overallScore,
    feedback: { entry: [], overall: feedback },
  };
}
