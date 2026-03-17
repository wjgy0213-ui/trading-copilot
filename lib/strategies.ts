// Strategy template definitions

export interface StrategyParam {
  key: string;
  label: string;
  labelEn?: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  params: StrategyParam[];
  pseudoCode: (params: Record<string, number>) => string;
}

export const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'ema_cross', name: 'EMA交叉', nameEn: 'EMA Crossover', icon: '📊',
    description: '快线上穿慢线做多，下穿做空。经典趋势跟踪策略。', descriptionEn: 'Go long on fast-line cross above slow-line, short on cross below. Classic trend-following.',
    params: [
      { key: 'fastPeriod', label: '快线周期', labelEn: 'Fast Period', min: 3, max: 50, step: 1, default: 9 },
      { key: 'slowPeriod', label: '慢线周期', labelEn: 'Slow Period', min: 10, max: 200, step: 1, default: 21 },
    ],
    pseudoCode: (p) => `// EMA交叉策略\nfastEMA = EMA(close, ${p.fastPeriod})\nslowEMA = EMA(close, ${p.slowPeriod})\n\n做多: fastEMA 上穿 slowEMA\n做空: fastEMA 下穿 slowEMA`,
  },
  {
    id: 'rsi_reversal', name: 'RSI反转', nameEn: 'RSI Reversal', icon: '🔄',
    description: '超卖区反弹做多，超买区回落做空。均值回归策略。', descriptionEn: 'Long on oversold bounce, short on overbought pullback. Mean reversion strategy.',
    params: [
      { key: 'rsiPeriod', label: 'RSI周期', labelEn: 'RSI Period', min: 5, max: 30, step: 1, default: 14 },
      { key: 'oversold', label: '超卖线', labelEn: 'Oversold', min: 10, max: 40, step: 1, default: 30 },
      { key: 'overbought', label: '超买线', labelEn: 'Overbought', min: 60, max: 90, step: 1, default: 70 },
    ],
    pseudoCode: (p) => `// RSI反转策略\nrsi = RSI(close, ${p.rsiPeriod})\n\n做多: RSI从下穿越 ${p.oversold}\n做空: RSI从上穿越 ${p.overbought}`,
  },
  {
    id: 'bollinger', name: '布林带突破', nameEn: 'Bollinger Breakout', icon: '📈',
    description: '价格触及下轨做多，触及上轨做空。利用波动率回归。', descriptionEn: 'Long on lower band touch, short on upper band. Volatility mean reversion.',
    params: [
      { key: 'period', label: '周期', labelEn: 'Period', min: 10, max: 50, step: 1, default: 20 },
      { key: 'stdDev', label: '标准差倍数', labelEn: 'Std Dev Multiplier', min: 1, max: 4, step: 0.1, default: 2 },
    ],
    pseudoCode: (p) => `// 布林带策略\nmiddle = SMA(close, ${p.period})\nupper = middle + ${p.stdDev} × StdDev\nlower = middle - ${p.stdDev} × StdDev\n\n做多: 价格触及下轨后反弹\n做空: 价格触及上轨后回落`,
  },
  {
    id: 'macd', name: 'MACD策略', nameEn: 'MACD Strategy', icon: '📉',
    description: 'MACD线上穿信号线做多，下穿做空。结合柱状图判断动量。', descriptionEn: 'Long on MACD cross above signal, short on cross below. Histogram confirms momentum.',
    params: [
      { key: 'fastPeriod', label: '快线', labelEn: 'Fast', min: 5, max: 20, step: 1, default: 12 },
      { key: 'slowPeriod', label: '慢线', labelEn: 'Slow', min: 15, max: 50, step: 1, default: 26 },
      { key: 'signalPeriod', label: '信号线', labelEn: 'Signal', min: 3, max: 15, step: 1, default: 9 },
    ],
    pseudoCode: (p) => `// MACD策略\nmacdLine = EMA(${p.fastPeriod}) - EMA(${p.slowPeriod})\nsignal = EMA(macdLine, ${p.signalPeriod})\n\n做多: MACD上穿信号线\n做空: MACD下穿信号线`,
  },
  {
    id: 'supertrend', name: 'Supertrend', nameEn: 'Supertrend', icon: '🚀',
    description: 'ATR动态止损趋势跟踪。适合趋势行情。', descriptionEn: 'ATR dynamic trailing stop trend following. Best for trending markets.',
    params: [
      { key: 'atrPeriod', label: 'ATR周期', labelEn: 'ATR Period', min: 10, max: 50, step: 1, default: 14 },
      { key: 'multiplier', label: '乘数', labelEn: 'Multiplier', min: 1, max: 5, step: 0.5, default: 3 },
    ],
    pseudoCode: (p) => `// Supertrend策略\nATR = ATR(${p.atrPeriod})\nupperBand = (H+L)/2 + ${p.multiplier} × ATR\nlowerBand = (H+L)/2 - ${p.multiplier} × ATR\n\n做多: 价格上穿Supertrend\n做空: 价格下穿Supertrend`,
  },
  {
    id: 'ema_volume', name: '双均线+量能', nameEn: 'Dual MA + Volume', icon: '📊',
    description: 'EMA交叉配合成交量确认。减少假突破。', descriptionEn: 'EMA crossover with volume confirmation. Reduces false breakouts.',
    params: [
      { key: 'fastPeriod', label: '快线周期', labelEn: 'Fast Period', min: 3, max: 50, step: 1, default: 10 },
      { key: 'slowPeriod', label: '慢线周期', labelEn: 'Slow Period', min: 10, max: 200, step: 1, default: 30 },
      { key: 'volumeMult', label: '量能倍数', labelEn: 'Volume Multiplier', min: 1, max: 5, step: 0.5, default: 1.5 },
    ],
    pseudoCode: (p) => `// 双均线+量能策略\nfastEMA = EMA(close, ${p.fastPeriod})\nslowEMA = EMA(close, ${p.slowPeriod})\nvolSMA = SMA(volume, 20)\n\n做多: fastEMA上穿slowEMA 且 volume > volSMA × ${p.volumeMult}\n做空: fastEMA下穿slowEMA 且 volume > volSMA × ${p.volumeMult}`,
  },
  {
    id: 'donchian', name: '通道突破', nameEn: 'Channel Breakout', icon: '🔔',
    description: 'Donchian通道突破。海龟交易法核心策略。', descriptionEn: 'Donchian channel breakout. Core Turtle trading strategy.',
    params: [
      { key: 'period', label: '通道周期', labelEn: 'Channel Period', min: 10, max: 100, step: 1, default: 20 },
    ],
    pseudoCode: (p) => `// Donchian通道突破\nupperChannel = ${p.period}周期最高价\nlowerChannel = ${p.period}周期最低价\n\n做多: 价格突破上轨\n做空: 价格突破下轨`,
  },
  {
    id: 'ema_rsi_combo', name: 'EMA+RSI组合', nameEn: 'EMA+RSI Combo', icon: '🎯',
    description: 'EMA确认趋势，RSI确认时机。多维度过滤提高胜率。', descriptionEn: 'EMA confirms trend, RSI confirms timing. Multi-dimensional filter improves win rate.',
    params: [
      { key: 'emaPeriod', label: 'EMA周期', labelEn: 'EMA Period', min: 10, max: 100, step: 1, default: 50 },
      { key: 'rsiPeriod', label: 'RSI周期', labelEn: 'RSI Period', min: 5, max: 30, step: 1, default: 14 },
      { key: 'rsiEntry', label: 'RSI入场线', labelEn: 'RSI Entry', min: 20, max: 50, step: 1, default: 40 },
    ],
    pseudoCode: (p) => `// EMA+RSI组合\nema = EMA(close, ${p.emaPeriod})\nrsi = RSI(close, ${p.rsiPeriod})\n\n做多: 价格>EMA 且 RSI<${p.rsiEntry}\n做空: 价格<EMA 且 RSI>${100 - p.rsiEntry}`,
  },
  {
    id: 'supertrend', name: 'Supertrend', nameEn: 'Supertrend', icon: '🚀',
    description: 'ATR动态止损趋势跟踪。适合趋势行情。', descriptionEn: 'ATR dynamic trailing stop trend following. Best for trending markets.',
    params: [
      { key: 'atrPeriod', label: 'ATR周期', labelEn: 'ATR Period', min: 10, max: 50, step: 1, default: 14 },
      { key: 'multiplier', label: '乘数', labelEn: 'Multiplier', min: 1, max: 5, step: 0.5, default: 3 },
    ],
    pseudoCode: (p) => `// Supertrend策略\nATR = ATR(${p.atrPeriod}周期真实波幅均值)\nupperBand = (high+low)/2 + ${p.multiplier}×ATR\nlowerBand = (high+low)/2 - ${p.multiplier}×ATR\n\n做多: close > supertrend 且前一根 close <= supertrend\n做空: close < supertrend 且前一根 close >= supertrend`,
  },
  {
    id: 'ema_volume', name: '双均线+量能', nameEn: 'Dual MA + Volume', icon: '📊',
    description: 'EMA交叉配合成交量确认。减少假突破。', descriptionEn: 'EMA crossover with volume confirmation. Reduces false breakouts.',
    params: [
      { key: 'fastPeriod', label: '快线周期', labelEn: 'Fast Period', min: 3, max: 50, step: 1, default: 10 },
      { key: 'slowPeriod', label: '慢线周期', labelEn: 'Slow Period', min: 10, max: 200, step: 1, default: 30 },
      { key: 'volumeMult', label: '量能倍数', labelEn: 'Volume Multiplier', min: 1, max: 5, step: 0.5, default: 1.5 },
    ],
    pseudoCode: (p) => `// 双均线+量能策略\nfastEMA = EMA(close, ${p.fastPeriod})\nslowEMA = EMA(close, ${p.slowPeriod})\nvolumeSMA = SMA(volume, 20)\n\n做多: fastEMA上穿slowEMA 且 volume > volumeSMA×${p.volumeMult}\n做空: fastEMA下穿slowEMA 且 volume > volumeSMA×${p.volumeMult}`,
  },
  {
    id: 'donchian', name: '通道突破', nameEn: 'Channel Breakout', icon: '🔔',
    description: 'Donchian通道突破。海龟交易法核心策略。', descriptionEn: 'Donchian channel breakout. Core Turtle trading strategy.',
    params: [
      { key: 'period', label: '通道周期', labelEn: 'Channel Period', min: 10, max: 100, step: 1, default: 20 },
    ],
    pseudoCode: (p) => `// Donchian通道突破\nupperChannel = ${p.period}周期最高的high\nlowerChannel = ${p.period}周期最低的low\n\n做多: close > 前一根upperChannel\n做空: close < 前一根lowerChannel`,
  },
];

export interface RiskParams { stopLoss: number; takeProfit: number; maxPosition: number; }
export const DEFAULT_RISK: RiskParams = { stopLoss: 3, takeProfit: 6, maxPosition: 30 };

export type Timeframe = '1h' | '4h' | '1d';
export type Symbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT';

export const TIMEFRAMES: { value: Timeframe; label: string; labelEn?: string }[] = [
  { value: '1h', label: '1小时', labelEn: '1 Hour' }, { value: '4h', label: '4小时', labelEn: '4 Hours' }, { value: '1d', label: '1天', labelEn: '1 Day' },
];
export const SYMBOLS: { value: Symbol; label: string }[] = [
  { value: 'BTCUSDT', label: 'BTC/USDT' }, { value: 'ETHUSDT', label: 'ETH/USDT' }, { value: 'SOLUSDT', label: 'SOL/USDT' },
];
export const BACKTEST_PERIODS = [
  { value: 30, label: '30天', labelEn: '30 Days' }, { value: 90, label: '90天', labelEn: '90 Days' }, { value: 180, label: '180天', labelEn: '180 Days' }, { value: 365, label: '1年', labelEn: '1 Year' },
];
