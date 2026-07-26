// 自动交易引擎 - 将策略工坊的策略部署到纸盘执行

import { i18nText } from './i18n-helpers';
import type { Locale } from './locale';
import { PositionSide } from './types';

export interface AutoStrategy {
  strategyId: string;
  strategyName: string;
  params: Record<string, number>;
  symbol: string;
  timeframe: string;
  risk: { stopLoss: number; takeProfit: number; maxPosition: number };
  deployedAt: number;
  active: boolean;
}

export interface SignalLog {
  time: number;
  type: 'buy' | 'sell' | 'info';
  message: string;
  price?: number;
  executed: boolean;
}

const STORAGE_KEY = 'tc-auto-strategy';
const SIGNAL_LOG_KEY = 'tc-signal-log';
const PRICE_HISTORY_KEY = 'tc-price-history';

/** 保存部署的策略 */
export function deployStrategy(strategy: AutoStrategy): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strategy));
}

/** 从策略页保存（兼容接口） */
export function saveStrategy(data: {
  strategyId: string; params: Record<string, number>; symbol: string;
  timeframe: string; riskParams: { stopLoss: number; takeProfit: number; maxPosition: number };
  name?: string;
}): void {
  deployStrategy({
    strategyId: data.strategyId,
    strategyName: data.name || data.strategyId,
    params: data.params,
    symbol: data.symbol,
    timeframe: data.timeframe,
    risk: data.riskParams,
    deployedAt: Date.now(),
    active: true,
  });
}

/** 读取部署的策略 */
export function getDeployedStrategy(): AutoStrategy | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try { return JSON.parse(data); } catch { return null; }
}

/** 停止策略 */
export function stopStrategy(): void {
  if (typeof window === 'undefined') return;
  const s = getDeployedStrategy();
  if (s) { s.active = false; localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
}

/** 移除策略 */
export function removeStrategy(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SIGNAL_LOG_KEY);
}

/** 记录信号日志 */
export function addSignalLog(log: SignalLog): void {
  if (typeof window === 'undefined') return;
  const logs = getSignalLogs();
  logs.push(log);
  // 保留最近50条
  if (logs.length > 50) logs.splice(0, logs.length - 50);
  localStorage.setItem(SIGNAL_LOG_KEY, JSON.stringify(logs));
}

/** 获取信号日志 */
export function getSignalLogs(): SignalLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SIGNAL_LOG_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}

/** 记录价格历史（用于信号计算） */
export function addPricePoint(price: number): void {
  if (typeof window === 'undefined') return;
  const history = getPriceHistory();
  history.push({ price, time: Date.now() });
  // 保留最近200个点
  if (history.length > 200) history.splice(0, history.length - 200);
  localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(history));
}

export function getPriceHistory(): { price: number; time: number }[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PRICE_HISTORY_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
}

// ===== 技术指标计算 =====

function ema(data: number[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);
  let prev = data[0];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(data[0]); prev = data[0]; continue; }
    prev = data[i] * k + prev * (1 - k);
    result.push(prev);
  }
  return result;
}

function sma(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(data[i]); continue; }
    const slice = data.slice(i - period + 1, i + 1);
    result.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return result;
}

function rsi(data: number[], period: number): number[] {
  const result: number[] = [];
  let avgGain = 0, avgLoss = 0;
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { result.push(50); continue; }
    const change = data[i] - data[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    if (i <= period) {
      avgGain = (avgGain * (i - 1) + gain) / i;
      avgLoss = (avgLoss * (i - 1) + loss) / i;
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }
  return result;
}

// ===== 信号评估 =====

export type SignalResult = { signal: 'buy' | 'sell' | 'none'; reason: string };

export function evaluateSignal(strategy: AutoStrategy, prices: number[], locale: Locale = 'zh'): SignalResult {
  if (prices.length < 30) return { signal: 'none', reason: i18nText(locale, 'auto.signal.insufficientData') };

  const p = strategy.params;
  const len = prices.length;
  const tr = (key: string, vars?: Record<string, string | number>) => i18nText(locale, key, vars);

  switch (strategy.strategyId) {
    case 'ema_cross': {
      const fast = ema(prices, p.fastPeriod || 9);
      const slow = ema(prices, p.slowPeriod || 21);
      const prev = fast[len - 2] - slow[len - 2];
      const curr = fast[len - 1] - slow[len - 1];
      if (prev <= 0 && curr > 0) return { signal: 'buy', reason: tr('auto.signal.emaCrossUp', { fast: p.fastPeriod || 9, slow: p.slowPeriod || 21 }) };
      if (prev >= 0 && curr < 0) return { signal: 'sell', reason: tr('auto.signal.emaCrossDown', { fast: p.fastPeriod || 9, slow: p.slowPeriod || 21 }) };
      return { signal: 'none', reason: tr('auto.signal.noCross') };
    }

    case 'rsi_reversal': {
      const r = rsi(prices, p.rsiPeriod || 14);
      const prevRsi = r[len - 2];
      const currRsi = r[len - 1];
      if (prevRsi < (p.oversold || 30) && currRsi >= (p.oversold || 30))
        return { signal: 'buy', reason: tr('auto.signal.rsiBounce', { value: currRsi.toFixed(1) }) };
      if (prevRsi > (p.overbought || 70) && currRsi <= (p.overbought || 70))
        return { signal: 'sell', reason: tr('auto.signal.rsiPullback', { value: currRsi.toFixed(1) }) };
      return { signal: 'none', reason: tr('auto.signal.rsiValue', { value: currRsi.toFixed(1) }) };
    }

    case 'bollinger': {
      const period = p.period || 20;
      const stdMult = p.stdDev || 2;
      const ma = sma(prices, period);
      const mid = ma[len - 1];
      const slice = prices.slice(len - period);
      const std = Math.sqrt(slice.reduce((s, v) => s + (v - mid) ** 2, 0) / period);
      const upper = mid + stdMult * std;
      const lower = mid - stdMult * std;
      const prev = prices[len - 2];
      const curr = prices[len - 1];
      if (prev <= lower && curr > lower) return { signal: 'buy', reason: tr('auto.signal.bollingerBounce') };
      if (prev >= upper && curr < upper) return { signal: 'sell', reason: tr('auto.signal.bollingerPullback') };
      return { signal: 'none', reason: tr('auto.signal.bollingerInside') };
    }

    case 'macd': {
      const fastE = ema(prices, p.fastPeriod || 12);
      const slowE = ema(prices, p.slowPeriod || 26);
      const macdLine = fastE.map((v, i) => v - slowE[i]);
      const signalLine = ema(macdLine, p.signalPeriod || 9);
      const prevDiff = macdLine[len - 2] - signalLine[len - 2];
      const currDiff = macdLine[len - 1] - signalLine[len - 1];
      if (prevDiff <= 0 && currDiff > 0) return { signal: 'buy', reason: tr('auto.signal.macdBullishCross') };
      if (prevDiff >= 0 && currDiff < 0) return { signal: 'sell', reason: tr('auto.signal.macdBearishCross') };
      return { signal: 'none', reason: tr('auto.signal.macdNoCross') };
    }

    case 'donchian': {
      const period = p.period || 20;
      if (prices.length < period + 1) return { signal: 'none', reason: tr('auto.signal.insufficientData') };
      const prevSlice = prices.slice(len - period - 1, len - 1);
      const upper = Math.max(...prevSlice);
      const lower = Math.min(...prevSlice);
      const curr = prices[len - 1];
      if (curr > upper) return { signal: 'buy', reason: tr('auto.signal.donchianBreakoutHigh', { period, price: upper.toFixed(0) }) };
      if (curr < lower) return { signal: 'sell', reason: tr('auto.signal.donchianBreakoutLow', { period, price: lower.toFixed(0) }) };
      return { signal: 'none', reason: tr('auto.signal.donchianInside') };
    }

    case 'ema_rsi_combo': {
      const e = ema(prices, p.emaPeriod || 50);
      const r = rsi(prices, p.rsiPeriod || 14);
      const curr = prices[len - 1];
      const currEma = e[len - 1];
      const currRsi = r[len - 1];
      const entry = p.rsiEntry || 40;
      if (curr > currEma && currRsi < entry)
        return { signal: 'buy', reason: tr('auto.signal.emaRsiBuy', { ema: p.emaPeriod || 50, rsi: currRsi.toFixed(0), entry }) };
      if (curr < currEma && currRsi > (100 - entry))
        return { signal: 'sell', reason: tr('auto.signal.emaRsiSell', { ema: p.emaPeriod || 50, rsi: currRsi.toFixed(0), threshold: 100 - entry }) };
      return { signal: 'none', reason: tr('auto.signal.conditionsNotMet') };
    }

    case 'supertrend': {
      // Simplified supertrend using price-based ATR approximation
      const atrPeriod = p.atrPeriod || 14;
      const mult = p.multiplier || 3;
      const atrValues: number[] = [];
      for (let i = 1; i < prices.length; i++) {
        atrValues.push(Math.abs(prices[i] - prices[i - 1]));
      }
      const atrSma = sma(atrValues, atrPeriod);
      const atr = atrSma[atrSma.length - 1] || prices[len - 1] * 0.02;
      const mid = (prices[len - 1] + prices[len - 2]) / 2;
      const upperBand = mid + mult * atr;
      const lowerBand = mid - mult * atr;
      // Simple trend detection
      const shortMa = sma(prices.slice(-20), 5);
      const longMa = sma(prices.slice(-20), 15);
      const trendUp = shortMa[shortMa.length - 1] > longMa[longMa.length - 1];
      const prevTrendUp = shortMa[shortMa.length - 2] > longMa[longMa.length - 2];
      if (!prevTrendUp && trendUp) return { signal: 'buy', reason: tr('auto.signal.supertrendBullish') };
      if (prevTrendUp && !trendUp) return { signal: 'sell', reason: tr('auto.signal.supertrendBearish') };
      return { signal: 'none', reason: trendUp ? tr('auto.signal.trendUpHold') : tr('auto.signal.trendDownWait') };
    }

    default:
      return { signal: 'none', reason: tr('auto.signal.unknownStrategy') };
  }
}
