// Strategy template definitions

export interface StrategyParam {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  params: StrategyParam[];
  pseudoCode: (params: Record<string, number>) => string;
}

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'ema_cross', name: 'EMA交叉', icon: '📊',
    description: '快线上穿慢线做多，下穿做空。经典趋势跟踪策略。',
    params: [
      { key: 'fastPeriod', label: '快线周期', min: 3, max: 50, step: 1, default: 9 },
      { key: 'slowPeriod', label: '慢线周期', min: 10, max: 200, step: 1, default: 21 },
    ],
    pseudoCode: (p) => `// EMA交叉策略\nfastEMA = EMA(close, ${p.fastPeriod})\nslowEMA = EMA(close, ${p.slowPeriod})\n\n做多: fastEMA 上穿 slowEMA\n做空: fastEMA 下穿 slowEMA`,
  },
  {
    id: 'rsi_reversal', name: 'RSI反转', icon: '🔄',
    description: '超卖区反弹做多，超买区回落做空。均值回归策略。',
    params: [
      { key: 'rsiPeriod', label: 'RSI周期', min: 5, max: 30, step: 1, default: 14 },
      { key: 'oversold', label: '超卖线', min: 10, max: 40, step: 1, default: 30 },
      { key: 'overbought', label: '超买线', min: 60, max: 90, step: 1, default: 70 },
    ],
    pseudoCode: (p) => `// RSI反转策略\nrsi = RSI(close, ${p.rsiPeriod})\n\n做多: RSI从下穿越 ${p.oversold}\n做空: RSI从上穿越 ${p.overbought}`,
  },
  {
    id: 'bollinger', name: '布林带突破', icon: '📈',
    description: '价格触及下轨做多，触及上轨做空。利用波动率回归。',
    params: [
      { key: 'period', label: '周期', min: 10, max: 50, step: 1, default: 20 },
      { key: 'stdDev', label: '标准差倍数', min: 1, max: 4, step: 0.1, default: 2 },
    ],
    pseudoCode: (p) => `// 布林带策略\nmiddle = SMA(close, ${p.period})\nupper = middle + ${p.stdDev} × StdDev\nlower = middle - ${p.stdDev} × StdDev\n\n做多: 价格触及下轨后反弹\n做空: 价格触及上轨后回落`,
  },
  {
    id: 'macd', name: 'MACD策略', icon: '📉',
    description: 'MACD线上穿信号线做多，下穿做空。结合柱状图判断动量。',
    params: [
      { key: 'fastPeriod', label: '快线', min: 5, max: 20, step: 1, default: 12 },
      { key: 'slowPeriod', label: '慢线', min: 15, max: 50, step: 1, default: 26 },
      { key: 'signalPeriod', label: '信号线', min: 3, max: 15, step: 1, default: 9 },
    ],
    pseudoCode: (p) => `// MACD策略\nmacdLine = EMA(${p.fastPeriod}) - EMA(${p.slowPeriod})\nsignal = EMA(macdLine, ${p.signalPeriod})\n\n做多: MACD上穿信号线\n做空: MACD下穿信号线`,
  },
  {
    id: 'ema_rsi_combo', name: 'EMA+RSI组合', icon: '🎯',
    description: 'EMA确认趋势，RSI确认时机。多维度过滤提高胜率。',
    params: [
      { key: 'emaPeriod', label: 'EMA周期', min: 10, max: 100, step: 1, default: 50 },
      { key: 'rsiPeriod', label: 'RSI周期', min: 5, max: 30, step: 1, default: 14 },
      { key: 'rsiEntry', label: 'RSI入场线', min: 20, max: 50, step: 1, default: 40 },
    ],
    pseudoCode: (p) => `// EMA+RSI组合\nema = EMA(close, ${p.emaPeriod})\nrsi = RSI(close, ${p.rsiPeriod})\n\n做多: 价格>EMA 且 RSI<${p.rsiEntry}\n做空: 价格<EMA 且 RSI>${100 - p.rsiEntry}`,
  },
];

export interface RiskParams { stopLoss: number; takeProfit: number; maxPosition: number; }
export const DEFAULT_RISK: RiskParams = { stopLoss: 3, takeProfit: 6, maxPosition: 30 };

export type Timeframe = '1h' | '4h' | '1d';
export type Symbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT';

export const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1h', label: '1小时' }, { value: '4h', label: '4小时' }, { value: '1d', label: '1天' },
];
export const SYMBOLS: { value: Symbol; label: string }[] = [
  { value: 'BTCUSDT', label: 'BTC/USDT' }, { value: 'ETHUSDT', label: 'ETH/USDT' }, { value: 'SOLUSDT', label: 'SOL/USDT' },
];
export const BACKTEST_PERIODS = [
  { value: 30, label: '30天' }, { value: 90, label: '90天' }, { value: 180, label: '180天' }, { value: 365, label: '1年' },
];
