// 策略模板定义

export type StrategyType = 'ema-cross' | 'rsi-reversal' | 'bollinger' | 'macd' | 'custom';

export interface StrategyParameter {
  id: string;
  label: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  default: number | string;
  options?: { value: string | number; label: string }[];
  unit?: string;
}

export interface StrategyTemplate {
  id: StrategyType;
  name: string;
  description: string;
  category: 'trend' | 'reversal' | 'breakout' | 'custom';
  parameters: StrategyParameter[];
}

// 策略模板库
export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'ema-cross',
    name: 'EMA交叉策略',
    description: '快线上穿慢线做多，下穿做空。经典趋势跟踪策略，适合单边行情。',
    category: 'trend',
    parameters: [
      { id: 'fastPeriod', label: '快线周期', type: 'number', min: 5, max: 50, step: 1, default: 9 },
      { id: 'slowPeriod', label: '慢线周期', type: 'number', min: 10, max: 200, step: 1, default: 21 },
    ],
  },
  {
    id: 'rsi-reversal',
    name: 'RSI反转策略',
    description: 'RSI超卖时买入，超买时卖出。适合震荡行情的均值回归策略。',
    category: 'reversal',
    parameters: [
      { id: 'rsiPeriod', label: 'RSI周期', type: 'number', min: 7, max: 28, step: 1, default: 14 },
      { id: 'oversold', label: '超卖阈值', type: 'number', min: 10, max: 40, step: 5, default: 30, unit: '' },
      { id: 'overbought', label: '超买阈值', type: 'number', min: 60, max: 90, step: 5, default: 70, unit: '' },
    ],
  },
  {
    id: 'bollinger',
    name: '布林带突破策略',
    description: '价格突破上轨做多，突破下轨做空。波动率突破策略。',
    category: 'breakout',
    parameters: [
      { id: 'period', label: '周期', type: 'number', min: 10, max: 50, step: 1, default: 20 },
      { id: 'stdDev', label: '标准差倍数', type: 'number', min: 1, max: 3, step: 0.1, default: 2, unit: 'σ' },
    ],
  },
  {
    id: 'macd',
    name: 'MACD策略',
    description: 'MACD金叉做多，死叉做空。动量指标策略。',
    category: 'trend',
    parameters: [
      { id: 'fastPeriod', label: '快线周期', type: 'number', min: 5, max: 20, step: 1, default: 12 },
      { id: 'slowPeriod', label: '慢线周期', type: 'number', min: 15, max: 50, step: 1, default: 26 },
      { id: 'signalPeriod', label: '信号线周期', type: 'number', min: 5, max: 20, step: 1, default: 9 },
    ],
  },
];

// 交易参数（通用）
export interface TradingParams {
  symbol: 'BTC' | 'ETH' | 'SOL';
  timeframe: '1h' | '4h' | '1d';
  stopLoss: number; // 百分比
  takeProfit: number; // 百分比
  maxPosition: number; // 最大仓位百分比
}

export const DEFAULT_TRADING_PARAMS: TradingParams = {
  symbol: 'BTC',
  timeframe: '4h',
  stopLoss: 2,
  takeProfit: 5,
  maxPosition: 50,
};

// 回测配置
export interface BacktestConfig {
  period: 30 | 90 | 180 | 365; // 天数
  initialCapital: number;
  fee: number; // 手续费百分比
  slippage: number; // 滑点百分比
}

export const DEFAULT_BACKTEST_CONFIG: BacktestConfig = {
  period: 90,
  initialCapital: 10000,
  fee: 0.04,
  slippage: 0.01,
};

// 生成策略伪代码
export function generateStrategyCode(
  strategy: StrategyType,
  params: Record<string, number>,
  tradingParams: TradingParams
): string {
  const lines: string[] = [];
  
  lines.push(`// ${STRATEGY_TEMPLATES.find(s => s.id === strategy)?.name || '策略'}`);
  lines.push(`币种: ${tradingParams.symbol}USDT`);
  lines.push(`时间框架: ${tradingParams.timeframe}`);
  lines.push('');
  
  switch (strategy) {
    case 'ema-cross':
      lines.push(`EMA快线 = EMA(close, ${params.fastPeriod})`);
      lines.push(`EMA慢线 = EMA(close, ${params.slowPeriod})`);
      lines.push('');
      lines.push('入场条件:');
      lines.push('  做多: 快线上穿慢线');
      lines.push('  做空: 快线下穿慢线');
      break;
      
    case 'rsi-reversal':
      lines.push(`RSI = RSI(close, ${params.rsiPeriod})`);
      lines.push('');
      lines.push('入场条件:');
      lines.push(`  做多: RSI < ${params.oversold} (超卖反弹)`);
      lines.push('出场条件:');
      lines.push(`  平多: RSI > ${params.overbought} (超买)`);
      break;
      
    case 'bollinger':
      lines.push(`中轨 = SMA(close, ${params.period})`);
      lines.push(`上轨 = 中轨 + ${params.stdDev}σ`);
      lines.push(`下轨 = 中轨 - ${params.stdDev}σ`);
      lines.push('');
      lines.push('入场条件:');
      lines.push('  做多: 价格突破上轨');
      lines.push('  做空: 价格跌破下轨');
      break;
      
    case 'macd':
      lines.push(`MACD = EMA(close, ${params.fastPeriod}) - EMA(close, ${params.slowPeriod})`);
      lines.push(`信号线 = EMA(MACD, ${params.signalPeriod})`);
      lines.push('');
      lines.push('入场条件:');
      lines.push('  做多: MACD上穿信号线（金叉）');
      lines.push('  做空: MACD下穿信号线（死叉）');
      break;
  }
  
  lines.push('');
  lines.push('风控设置:');
  lines.push(`  止损: -${tradingParams.stopLoss}%`);
  lines.push(`  止盈: +${tradingParams.takeProfit}%`);
  lines.push(`  最大仓位: ${tradingParams.maxPosition}%`);
  
  return lines.join('\n');
}

// 生成策略描述（自然语言）
export function generateStrategyDescription(
  strategy: StrategyType,
  params: Record<string, number>,
  tradingParams: TradingParams
): string {
  const template = STRATEGY_TEMPLATES.find(s => s.id === strategy);
  if (!template) return '';
  
  let desc = `使用 ${template.name}，`;
  
  switch (strategy) {
    case 'ema-cross':
      desc += `快线${params.fastPeriod}周期，慢线${params.slowPeriod}周期。当快线上穿慢线时做多，下穿时做空。`;
      break;
    case 'rsi-reversal':
      desc += `RSI周期${params.rsiPeriod}。当RSI低于${params.oversold}时买入，高于${params.overbought}时卖出。`;
      break;
    case 'bollinger':
      desc += `周期${params.period}，标准差${params.stdDev}倍。价格突破上轨做多，跌破下轨做空。`;
      break;
    case 'macd':
      desc += `快线${params.fastPeriod}，慢线${params.slowPeriod}，信号线${params.signalPeriod}。MACD金叉做多，死叉做空。`;
      break;
  }
  
  desc += ` 止损${tradingParams.stopLoss}%，止盈${tradingParams.takeProfit}%。`;
  
  return desc;
}
