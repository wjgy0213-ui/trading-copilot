// 前端回测引擎

export interface Kline {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface BacktestResult {
  trades: Trade[];
  winRate: number;
  profitLossRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  equityCurve: { timestamp: number; equity: number }[];
  initialCapital: number;
  finalCapital: number;
}

export type Strategy = 'ema-cross' | 'rsi-reversal' | 'breakout-pullback';

// 计算 EMA
function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  
  ema[0] = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
  }
  
  return ema;
}

// 计算 RSI
function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const changes: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  for (let i = 0; i < changes.length; i++) {
    if (i < period - 1) {
      rsi.push(50); // 初始值
      continue;
    }
    
    const slice = changes.slice(i - period + 1, i + 1);
    const gains = slice.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
    const losses = Math.abs(slice.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
    
    if (losses === 0) {
      rsi.push(100);
    } else {
      const rs = gains / losses;
      rsi.push(100 - 100 / (1 + rs));
    }
  }
  
  return rsi;
}

// EMA 双均线交叉策略
function strategyEMACross(klines: Kline[]): Trade[] {
  const closes = klines.map(k => k.close);
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  
  const trades: Trade[] = [];
  let position: 'long' | 'short' | null = null;
  let entryPrice = 0;
  
  for (let i = 21; i < klines.length; i++) {
    const bullishCross = ema9[i] > ema21[i] && ema9[i - 1] <= ema21[i - 1];
    const bearishCross = ema9[i] < ema21[i] && ema9[i - 1] >= ema21[i - 1];
    
    if (bullishCross && position !== 'long') {
      if (position === 'short') {
        // 平空
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'buy',
          price: klines[i].close,
          amount: 1,
        });
      }
      // 开多
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'buy',
        price: klines[i].close,
        amount: 1,
      });
      position = 'long';
      entryPrice = klines[i].close;
    } else if (bearishCross && position !== 'short') {
      if (position === 'long') {
        // 平多
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'sell',
          price: klines[i].close,
          amount: 1,
        });
      }
      // 开空
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'sell',
        price: klines[i].close,
        amount: 1,
      });
      position = 'short';
      entryPrice = klines[i].close;
    }
  }
  
  return trades;
}

// RSI 反转策略
function strategyRSIReversal(klines: Kline[]): Trade[] {
  const closes = klines.map(k => k.close);
  const rsi = calculateRSI(closes, 14);
  
  const trades: Trade[] = [];
  let position: 'long' | null = null;
  
  for (let i = 14; i < klines.length; i++) {
    if (rsi[i - 1] < 30 && rsi[i] >= 30 && !position) {
      // RSI 从超卖区反弹，买入
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'buy',
        price: klines[i].close,
        amount: 1,
      });
      position = 'long';
    } else if (rsi[i - 1] > 70 && rsi[i] <= 70 && position) {
      // RSI 从超买区回落，卖出
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'sell',
        price: klines[i].close,
        amount: 1,
      });
      position = null;
    }
  }
  
  return trades;
}

// 突破回踩策略
function strategyBreakoutPullback(klines: Kline[]): Trade[] {
  const trades: Trade[] = [];
  let position: 'long' | null = null;
  const lookback = 20;
  
  for (let i = lookback; i < klines.length; i++) {
    const recentHighs = klines.slice(i - lookback, i).map(k => k.high);
    const resistanceLevel = Math.max(...recentHighs);
    
    const breakout = klines[i].close > resistanceLevel && klines[i - 1].close <= resistanceLevel;
    const pullback = klines[i].low <= resistanceLevel * 0.98 && klines[i].close > resistanceLevel * 0.98;
    
    if (breakout && !position) {
      // 突破，买入
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'buy',
        price: klines[i].close,
        amount: 1,
      });
      position = 'long';
    } else if (position && i > 0) {
      const stopLoss = resistanceLevel * 0.95;
      if (klines[i].low < stopLoss) {
        // 止损
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'sell',
          price: stopLoss,
          amount: 1,
        });
        position = null;
      }
    }
  }
  
  return trades;
}

// 执行回测
export async function runBacktest(
  strategy: Strategy,
  asset: string,
  timeframe: string,
  days: number
): Promise<BacktestResult> {
  // 获取 K 线数据
  const klines = await fetchKlines(asset, timeframe, days);
  
  // 执行策略
  let trades: Trade[] = [];
  switch (strategy) {
    case 'ema-cross':
      trades = strategyEMACross(klines);
      break;
    case 'rsi-reversal':
      trades = strategyRSIReversal(klines);
      break;
    case 'breakout-pullback':
      trades = strategyBreakoutPullback(klines);
      break;
  }
  
  // 计算回测结果
  return calculateBacktestMetrics(trades, klines);
}

// 从 Binance 获取 K 线数据
async function fetchKlines(asset: string, timeframe: string, days: number): Promise<Kline[]> {
  const symbol = `${asset}USDT`;
  const interval = timeframe;
  const endTime = Date.now();
  const startTime = endTime - days * 24 * 60 * 60 * 1000;
  
  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1000`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.map((k: any) => ({
      timestamp: k[0],
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  } catch (error) {
    console.error('Failed to fetch klines:', error);
    return [];
  }
}

// 计算回测指标
function calculateBacktestMetrics(trades: Trade[], klines: Kline[]): BacktestResult {
  const initialCapital = 10000;
  let capital = initialCapital;
  let position = 0;
  let entryPrice = 0;
  
  const equityCurve: { timestamp: number; equity: number }[] = [];
  const pnls: number[] = [];
  let maxEquity = initialCapital;
  let maxDrawdown = 0;
  
  // 计算每笔交易的盈亏
  for (const trade of trades) {
    if (trade.type === 'buy') {
      if (position < 0) {
        // 平空仓
        const pnl = (entryPrice - trade.price) * Math.abs(position);
        const pnlPercent = ((entryPrice - trade.price) / entryPrice) * 100;
        capital += pnl;
        pnls.push(pnl);
        trade.pnl = pnl;
        trade.pnlPercent = pnlPercent;
      }
      // 开多仓
      position = capital / trade.price;
      entryPrice = trade.price;
    } else {
      if (position > 0) {
        // 平多仓
        const pnl = (trade.price - entryPrice) * position;
        const pnlPercent = ((trade.price - entryPrice) / entryPrice) * 100;
        capital += pnl;
        pnls.push(pnl);
        trade.pnl = pnl;
        trade.pnlPercent = pnlPercent;
      }
      // 开空仓
      position = -(capital / trade.price);
      entryPrice = trade.price;
    }
    
    equityCurve.push({ timestamp: trade.timestamp, equity: capital });
    
    // 更新最大回撤
    if (capital > maxEquity) {
      maxEquity = capital;
    }
    const drawdown = ((maxEquity - capital) / maxEquity) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  // 计算胜率
  const profitTrades = pnls.filter(p => p > 0);
  const winRate = pnls.length > 0 ? (profitTrades.length / pnls.length) * 100 : 0;
  
  // 计算盈亏比
  const avgProfit = profitTrades.length > 0 ? profitTrades.reduce((a, b) => a + b, 0) / profitTrades.length : 0;
  const lossTrades = pnls.filter(p => p < 0);
  const avgLoss = lossTrades.length > 0 ? Math.abs(lossTrades.reduce((a, b) => a + b, 0) / lossTrades.length) : 1;
  const profitLossRatio = avgLoss > 0 ? avgProfit / avgLoss : 0;
  
  // 总收益
  const totalReturn = ((capital - initialCapital) / initialCapital) * 100;
  
  return {
    trades,
    winRate,
    profitLossRatio,
    maxDrawdown,
    totalReturn,
    equityCurve,
    initialCapital,
    finalCapital: capital,
  };
}

export const STRATEGIES = [
  {
    id: 'ema-cross' as Strategy,
    name: 'EMA 双均线交叉',
    nameEn: 'EMA Cross (9/21)',
    description: '快线上穿慢线买入，下穿卖出。经典趋势跟踪策略。',
  },
  {
    id: 'rsi-reversal' as Strategy,
    name: 'RSI 反转',
    nameEn: 'RSI Reversal (30/70)',
    description: 'RSI 超卖反弹买入，超买回落卖出。适合震荡市。',
  },
  {
    id: 'breakout-pullback' as Strategy,
    name: '突破回踩',
    nameEn: 'Breakout & Pullback',
    description: '突破前高买入，跌破支撑止损。适合强趋势市。',
  },
];

export const ASSETS = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL' },
];

export const TIMEFRAMES = [
  { id: '1h', name: '1小时', nameEn: '1 Hour' },
  { id: '4h', name: '4小时', nameEn: '4 Hours' },
  { id: '1d', name: '1天', nameEn: '1 Day' },
];

export const PERIODS = [
  { id: 30, name: '30天' },
  { id: 90, name: '90天' },
  { id: 180, name: '180天' },
];
