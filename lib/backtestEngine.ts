// 前端高级回测引擎

import { StrategyType, BacktestConfig, DEFAULT_BACKTEST_CONFIG } from './strategies';

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
  holdingTime?: number; // 持仓时间（毫秒）
}

export interface BacktestResult {
  trades: Trade[];
  winRate: number;
  profitLossRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  sharpeRatio: number;
  totalTrades: number;
  equityCurve: { timestamp: number; equity: number }[];
  monthlyReturns: { month: string; return: number }[];
  initialCapital: number;
  finalCapital: number;
}

export type Strategy = StrategyType;

// ========== 指标计算函数 ==========

// 计算 EMA
export function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  
  // 初始值使用 SMA
  let sum = 0;
  for (let i = 0; i < Math.min(period, prices.length); i++) {
    sum += prices[i];
  }
  ema[period - 1] = sum / period;
  
  // 后续使用 EMA 公式
  for (let i = period; i < prices.length; i++) {
    ema[i] = prices[i] * k + ema[i - 1] * (1 - k);
  }
  
  // 填充前面的空值
  for (let i = 0; i < period - 1; i++) {
    ema[i] = ema[period - 1];
  }
  
  return ema;
}

// 计算 SMA
export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(prices[i]); // 初始值
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
}

// 计算 RSI
export function calculateRSI(prices: number[], period: number = 14): number[] {
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
  
  // 加上第一个价格的RSI（设为50）
  rsi.unshift(50);
  
  return rsi;
}

// 计算布林带
export interface BollingerBands {
  upper: number[];
  middle: number[];
  lower: number[];
}

export function calculateBollinger(prices: number[], period: number, stdDev: number): BollingerBands {
  const middle = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(prices[i]);
      lower.push(prices[i]);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = middle[i];
      const variance = slice.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }
  
  return { upper, middle, lower };
}

// 计算 MACD
export interface MACD {
  macd: number[];
  signal: number[];
  histogram: number[];
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACD {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  const macd = emaFast.map((fast, i) => fast - emaSlow[i]);
  const signal = calculateEMA(macd, signalPeriod);
  const histogram = macd.map((m, i) => m - signal[i]);
  
  return { macd, signal, histogram };
}

// ========== 策略执行函数 ==========

interface StrategyParams {
  [key: string]: number;
}

// EMA 双均线交叉策略
function strategyEMACross(klines: Kline[], params: StrategyParams): Trade[] {
  const closes = klines.map(k => k.close);
  const emaFast = calculateEMA(closes, params.fastPeriod || 9);
  const emaSlow = calculateEMA(closes, params.slowPeriod || 21);
  
  const trades: Trade[] = [];
  let position: 'long' | 'short' | null = null;
  let entryTime = 0;
  
  for (let i = 1; i < klines.length; i++) {
    const bullishCross = emaFast[i] > emaSlow[i] && emaFast[i - 1] <= emaSlow[i - 1];
    const bearishCross = emaFast[i] < emaSlow[i] && emaFast[i - 1] >= emaSlow[i - 1];
    
    if (bullishCross && position !== 'long') {
      if (position === 'short') {
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'buy',
          price: klines[i].close,
          amount: 1,
          holdingTime: klines[i].timestamp - entryTime,
        });
      }
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'buy',
        price: klines[i].close,
        amount: 1,
      });
      position = 'long';
      entryTime = klines[i].timestamp;
    } else if (bearishCross && position !== 'short') {
      if (position === 'long') {
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'sell',
          price: klines[i].close,
          amount: 1,
          holdingTime: klines[i].timestamp - entryTime,
        });
      }
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'sell',
        price: klines[i].close,
        amount: 1,
      });
      position = 'short';
      entryTime = klines[i].timestamp;
    }
  }
  
  return trades;
}

// RSI 反转策略
function strategyRSIReversal(klines: Kline[], params: StrategyParams): Trade[] {
  const closes = klines.map(k => k.close);
  const rsi = calculateRSI(closes, params.rsiPeriod || 14);
  const oversold = params.oversold || 30;
  const overbought = params.overbought || 70;
  
  const trades: Trade[] = [];
  let position: 'long' | null = null;
  let entryTime = 0;
  
  for (let i = 1; i < klines.length; i++) {
    if (rsi[i - 1] < oversold && rsi[i] >= oversold && !position) {
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'buy',
        price: klines[i].close,
        amount: 1,
      });
      position = 'long';
      entryTime = klines[i].timestamp;
    } else if (rsi[i - 1] > overbought && rsi[i] <= overbought && position) {
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'sell',
        price: klines[i].close,
        amount: 1,
        holdingTime: klines[i].timestamp - entryTime,
      });
      position = null;
    }
  }
  
  return trades;
}

// 布林带突破策略
function strategyBollinger(klines: Kline[], params: StrategyParams): Trade[] {
  const closes = klines.map(k => k.close);
  const period = params.period || 20;
  const stdDev = params.stdDev || 2;
  const bands = calculateBollinger(closes, period, stdDev);
  
  const trades: Trade[] = [];
  let position: 'long' | 'short' | null = null;
  let entryTime = 0;
  
  for (let i = 1; i < klines.length; i++) {
    const breakoutUp = closes[i] > bands.upper[i] && closes[i - 1] <= bands.upper[i - 1];
    const breakoutDown = closes[i] < bands.lower[i] && closes[i - 1] >= bands.lower[i - 1];
    const backToMiddle = Math.abs(closes[i] - bands.middle[i]) < Math.abs(closes[i - 1] - bands.middle[i - 1]);
    
    if (breakoutUp && position !== 'long') {
      if (position === 'short') {
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'buy',
          price: klines[i].close,
          amount: 1,
          holdingTime: klines[i].timestamp - entryTime,
        });
      }
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'buy',
        price: klines[i].close,
        amount: 1,
      });
      position = 'long';
      entryTime = klines[i].timestamp;
    } else if (breakoutDown && position !== 'short') {
      if (position === 'long') {
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'sell',
          price: klines[i].close,
          amount: 1,
          holdingTime: klines[i].timestamp - entryTime,
        });
      }
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'sell',
        price: klines[i].close,
        amount: 1,
      });
      position = 'short';
      entryTime = klines[i].timestamp;
    } else if (position && backToMiddle) {
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: position === 'long' ? 'sell' : 'buy',
        price: klines[i].close,
        amount: 1,
        holdingTime: klines[i].timestamp - entryTime,
      });
      position = null;
    }
  }
  
  return trades;
}

// MACD 策略
function strategyMACD(klines: Kline[], params: StrategyParams): Trade[] {
  const closes = klines.map(k => k.close);
  const macdData = calculateMACD(
    closes,
    params.fastPeriod || 12,
    params.slowPeriod || 26,
    params.signalPeriod || 9
  );
  
  const trades: Trade[] = [];
  let position: 'long' | 'short' | null = null;
  let entryTime = 0;
  
  for (let i = 1; i < klines.length; i++) {
    const goldenCross = macdData.macd[i] > macdData.signal[i] && macdData.macd[i - 1] <= macdData.signal[i - 1];
    const deathCross = macdData.macd[i] < macdData.signal[i] && macdData.macd[i - 1] >= macdData.signal[i - 1];
    
    if (goldenCross && position !== 'long') {
      if (position === 'short') {
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'buy',
          price: klines[i].close,
          amount: 1,
          holdingTime: klines[i].timestamp - entryTime,
        });
      }
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'buy',
        price: klines[i].close,
        amount: 1,
      });
      position = 'long';
      entryTime = klines[i].timestamp;
    } else if (deathCross && position !== 'short') {
      if (position === 'long') {
        trades.push({
          id: `trade-${trades.length}`,
          timestamp: klines[i].timestamp,
          type: 'sell',
          price: klines[i].close,
          amount: 1,
          holdingTime: klines[i].timestamp - entryTime,
        });
      }
      trades.push({
        id: `trade-${trades.length}`,
        timestamp: klines[i].timestamp,
        type: 'sell',
        price: klines[i].close,
        amount: 1,
      });
      position = 'short';
      entryTime = klines[i].timestamp;
    }
  }
  
  return trades;
}

// ========== 回测引擎 ==========

// 执行回测
export async function runBacktest(
  strategy: Strategy,
  asset: string,
  timeframe: string,
  days: number,
  params: StrategyParams = {},
  config: BacktestConfig = DEFAULT_BACKTEST_CONFIG
): Promise<BacktestResult> {
  // 获取 K 线数据
  const klines = await fetchKlines(asset, timeframe, days);
  
  if (klines.length === 0) {
    throw new Error('无法获取K线数据');
  }
  
  // 执行策略
  let trades: Trade[] = [];
  switch (strategy) {
    case 'ema-cross':
      trades = strategyEMACross(klines, params);
      break;
    case 'rsi-reversal':
      trades = strategyRSIReversal(klines, params);
      break;
    case 'bollinger':
      trades = strategyBollinger(klines, params);
      break;
    case 'macd':
      trades = strategyMACD(klines, params);
      break;
    default:
      trades = strategyEMACross(klines, params);
  }
  
  // 应用止损止盈
  trades = applyStopLossTakeProfit(trades, klines, params.stopLoss || 2, params.takeProfit || 5);
  
  // 计算回测结果
  return calculateBacktestMetrics(trades, klines, config);
}

// 应用止损止盈逻辑
function applyStopLossTakeProfit(
  trades: Trade[],
  klines: Kline[],
  stopLossPercent: number,
  takeProfitPercent: number
): Trade[] {
  const result: Trade[] = [];
  let position: 'long' | 'short' | null = null;
  let entryPrice = 0;
  let entryIndex = 0;
  
  for (let i = 0; i < trades.length; i++) {
    const trade = trades[i];
    result.push(trade);
    
    if (trade.type === 'buy' && position !== 'long') {
      position = 'long';
      entryPrice = trade.price;
      entryIndex = klines.findIndex(k => k.timestamp === trade.timestamp);
    } else if (trade.type === 'sell' && position !== 'short') {
      position = position === 'long' ? null : 'short';
      if (position === 'short') {
        entryPrice = trade.price;
        entryIndex = klines.findIndex(k => k.timestamp === trade.timestamp);
      }
    }
    
    // 检查止损止盈
    if (position && entryIndex > 0) {
      for (let j = entryIndex + 1; j < klines.length && j < entryIndex + 100; j++) {
        const kline = klines[j];
        const returnPercent = position === 'long'
          ? ((kline.close - entryPrice) / entryPrice) * 100
          : ((entryPrice - kline.close) / entryPrice) * 100;
        
        // 触发止损
        if (returnPercent <= -stopLossPercent) {
          result.push({
            id: `trade-${result.length}`,
            timestamp: kline.timestamp,
            type: position === 'long' ? 'sell' : 'buy',
            price: kline.close,
            amount: 1,
            holdingTime: kline.timestamp - trade.timestamp,
          });
          position = null;
          break;
        }
        
        // 触发止盈
        if (returnPercent >= takeProfitPercent) {
          result.push({
            id: `trade-${result.length}`,
            timestamp: kline.timestamp,
            type: position === 'long' ? 'sell' : 'buy',
            price: kline.close,
            amount: 1,
            holdingTime: kline.timestamp - trade.timestamp,
          });
          position = null;
          break;
        }
      }
    }
  }
  
  return result;
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
    
    if (!response.ok) {
      throw new Error(`Binance API错误: ${response.status}`);
    }
    
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
    console.error('获取K线数据失败:', error);
    throw error;
  }
}

// 计算回测指标
function calculateBacktestMetrics(
  trades: Trade[],
  klines: Kline[],
  config: BacktestConfig
): BacktestResult {
  const { initialCapital, fee, slippage } = config;
  let capital = initialCapital;
  let position = 0;
  let entryPrice = 0;
  
  const equityCurve: { timestamp: number; equity: number }[] = [];
  const pnls: number[] = [];
  const returns: number[] = [];
  let maxEquity = initialCapital;
  let maxDrawdown = 0;
  
  // 按时间排序交易
  trades.sort((a, b) => a.timestamp - b.timestamp);
  
  // 计算每笔交易的盈亏
  for (const trade of trades) {
    // 应用手续费和滑点
    const actualPrice = trade.type === 'buy'
      ? trade.price * (1 + slippage / 100)
      : trade.price * (1 - slippage / 100);
    const feeAmount = actualPrice * (fee / 100);
    
    if (trade.type === 'buy') {
      if (position < 0) {
        // 平空仓
        const pnl = (entryPrice - actualPrice) * Math.abs(position) - feeAmount * Math.abs(position);
        const pnlPercent = ((entryPrice - actualPrice) / entryPrice) * 100;
        capital += pnl;
        pnls.push(pnl);
        returns.push(pnlPercent);
        trade.pnl = pnl;
        trade.pnlPercent = pnlPercent;
      }
      // 开多仓
      position = (capital * 0.95) / actualPrice; // 95% 仓位
      entryPrice = actualPrice;
      capital -= feeAmount * position;
    } else {
      if (position > 0) {
        // 平多仓
        const pnl = (actualPrice - entryPrice) * position - feeAmount * position;
        const pnlPercent = ((actualPrice - entryPrice) / entryPrice) * 100;
        capital += pnl;
        pnls.push(pnl);
        returns.push(pnlPercent);
        trade.pnl = pnl;
        trade.pnlPercent = pnlPercent;
      }
      // 开空仓
      position = -((capital * 0.95) / actualPrice);
      entryPrice = actualPrice;
      capital -= feeAmount * Math.abs(position);
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
  const avgProfit = profitTrades.length > 0 
    ? profitTrades.reduce((a, b) => a + b, 0) / profitTrades.length 
    : 0;
  const lossTrades = pnls.filter(p => p < 0);
  const avgLoss = lossTrades.length > 0 
    ? Math.abs(lossTrades.reduce((a, b) => a + b, 0) / lossTrades.length) 
    : 1;
  const profitLossRatio = avgLoss > 0 ? avgProfit / avgLoss : 0;
  
  // 总收益
  const totalReturn = ((capital - initialCapital) / initialCapital) * 100;
  
  // 夏普比率（简化版，假设无风险收益率为0）
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdDev = returns.length > 1
    ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
    : 0;
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // 年化
  
  // 月度收益
  const monthlyReturns = calculateMonthlyReturns(equityCurve, initialCapital);
  
  return {
    trades,
    winRate,
    profitLossRatio,
    maxDrawdown,
    totalReturn,
    sharpeRatio,
    totalTrades: pnls.length,
    equityCurve,
    monthlyReturns,
    initialCapital,
    finalCapital: capital,
  };
}

// 计算月度收益
function calculateMonthlyReturns(
  equityCurve: { timestamp: number; equity: number }[],
  initialCapital: number
): { month: string; return: number }[] {
  const monthlyData: Record<string, { start: number; end: number }> = {};
  
  equityCurve.forEach(point => {
    const date = new Date(point.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { start: point.equity, end: point.equity };
    } else {
      monthlyData[monthKey].end = point.equity;
    }
  });
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    return: ((data.end - data.start) / data.start) * 100,
  }));
}

// ========== 导出常量 ==========

export const STRATEGIES = [
  {
    id: 'ema-cross' as Strategy,
    name: 'EMA交叉',
    nameEn: 'EMA Cross',
    description: '双均线交叉策略',
  },
  {
    id: 'rsi-reversal' as Strategy,
    name: 'RSI反转',
    nameEn: 'RSI Reversal',
    description: 'RSI超买超卖策略',
  },
  {
    id: 'bollinger' as Strategy,
    name: '布林带',
    nameEn: 'Bollinger',
    description: '布林带突破策略',
  },
  {
    id: 'macd' as Strategy,
    name: 'MACD',
    nameEn: 'MACD',
    description: 'MACD金叉死叉策略',
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
  { id: 365, name: '1年' },
];
