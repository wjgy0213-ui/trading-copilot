import { Timeframe, Symbol } from './strategies';

export interface Candle {
  time: number; open: number; high: number; low: number; close: number; volume: number;
}

export interface Trade {
  entryTime: number; exitTime: number; direction: 'long' | 'short';
  entryPrice: number; exitPrice: number; pnl: number; pnlPercent: number;
  holdBars: number; exitReason: 'signal' | 'stopLoss' | 'takeProfit';
}

export interface BacktestResult {
  strategyName: string; symbol: string; timeframe: string; period: number;
  initialCapital: number; finalCapital: number; totalReturn: number; totalReturnPercent: number;
  winRate: number; profitFactor: number; maxDrawdown: number; maxDrawdownPercent: number;
  sharpeRatio: number; totalTrades: number; winTrades: number; lossTrades: number;
  avgWin: number; avgLoss: number; avgHoldBars: number;
  trades: Trade[]; equityCurve: { time: number; equity: number }[];
  monthlyReturns: { month: string; returnPct: number }[];
}

export interface BacktestConfig {
  strategyId: string; params: Record<string, number>;
  symbol: Symbol; timeframe: Timeframe; periodDays: number;
  initialCapital: number; feeRate: number; slippage: number;
  stopLoss: number; takeProfit: number; maxPosition: number;
}

export async function fetchKlines(symbol: Symbol, timeframe: Timeframe, days: number): Promise<Candle[]> {
  const barsPerDay: Record<Timeframe, number> = { '1h': 24, '4h': 6, '1d': 1 };
  const limit = Math.min(days * barsPerDay[timeframe], 1000);
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
  const data = await res.json();
  return data.map((k: any[]) => ({
    time: k[0], open: parseFloat(k[1]), high: parseFloat(k[2]),
    low: parseFloat(k[3]), close: parseFloat(k[4]), volume: parseFloat(k[5]),
  }));
}

function calcEMA(data: number[], period: number): number[] {
  const r: number[] = new Array(data.length).fill(0);
  if (data.length < period) return r;
  let sum = 0;
  for (let i = 0; i < period; i++) sum += data[i];
  r[period - 1] = sum / period;
  const m = 2 / (period + 1);
  for (let i = period; i < data.length; i++) r[i] = (data[i] - r[i-1]) * m + r[i-1];
  return r;
}

function calcSMA(data: number[], period: number): number[] {
  const r: number[] = new Array(data.length).fill(0);
  for (let i = period - 1; i < data.length; i++) {
    let s = 0; for (let j = i - period + 1; j <= i; j++) s += data[j];
    r[i] = s / period;
  }
  return r;
}

function calcRSI(data: number[], period: number): number[] {
  const r: number[] = new Array(data.length).fill(50);
  if (data.length < period + 1) return r;
  let ag = 0, al = 0;
  for (let i = 1; i <= period; i++) { const c = data[i] - data[i-1]; if (c > 0) ag += c; else al += Math.abs(c); }
  ag /= period; al /= period;
  r[period] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  for (let i = period + 1; i < data.length; i++) {
    const c = data[i] - data[i-1];
    ag = (ag * (period-1) + (c > 0 ? c : 0)) / period;
    al = (al * (period-1) + (c < 0 ? Math.abs(c) : 0)) / period;
    r[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }
  return r;
}

function calcStdDev(data: number[], period: number): number[] {
  const sma = calcSMA(data, period);
  const r: number[] = new Array(data.length).fill(0);
  for (let i = period - 1; i < data.length; i++) {
    let sq = 0; for (let j = i - period + 1; j <= i; j++) sq += (data[j] - sma[i]) ** 2;
    r[i] = Math.sqrt(sq / period);
  }
  return r;
}

type Signal = 'long' | 'short' | null;

function generateSignals(id: string, params: Record<string, number>, candles: Candle[]): Signal[] {
  const closes = candles.map(c => c.close);
  const signals: Signal[] = new Array(candles.length).fill(null);
  const w = 50;
  switch (id) {
    case 'ema_cross': {
      const f = calcEMA(closes, params.fastPeriod), s = calcEMA(closes, params.slowPeriod);
      for (let i = w; i < candles.length; i++) {
        if (f[i] > s[i] && f[i-1] <= s[i-1]) signals[i] = 'long';
        if (f[i] < s[i] && f[i-1] >= s[i-1]) signals[i] = 'short';
      } break;
    }
    case 'rsi_reversal': {
      const rsi = calcRSI(closes, params.rsiPeriod);
      for (let i = w; i < candles.length; i++) {
        if (rsi[i] > params.oversold && rsi[i-1] <= params.oversold) signals[i] = 'long';
        if (rsi[i] < params.overbought && rsi[i-1] >= params.overbought) signals[i] = 'short';
      } break;
    }
    case 'bollinger': {
      const sma = calcSMA(closes, params.period), std = calcStdDev(closes, params.period);
      for (let i = w; i < candles.length; i++) {
        const lo = sma[i] - params.stdDev * std[i], hi = sma[i] + params.stdDev * std[i];
        const plo = sma[i-1] - params.stdDev * std[i-1], phi = sma[i-1] + params.stdDev * std[i-1];
        if (closes[i] > lo && closes[i-1] <= plo) signals[i] = 'long';
        if (closes[i] < hi && closes[i-1] >= phi) signals[i] = 'short';
      } break;
    }
    case 'macd': {
      const ef = calcEMA(closes, params.fastPeriod), es = calcEMA(closes, params.slowPeriod);
      const ml = closes.map((_, i) => ef[i] - es[i]);
      const sl = calcEMA(ml, params.signalPeriod);
      const hist = ml.map((v, i) => v - sl[i]);
      for (let i = w; i < candles.length; i++) {
        if (ml[i] > sl[i] && ml[i-1] <= sl[i-1] && hist[i] > 0) signals[i] = 'long';
        if (ml[i] < sl[i] && ml[i-1] >= sl[i-1] && hist[i] < 0) signals[i] = 'short';
      } break;
    }
    case 'supertrend': {
      // Calculate ATR
      const atrPeriod = params.atrPeriod;
      const mult = params.multiplier;
      const tr: number[] = new Array(candles.length).fill(0);
      for (let i = 1; i < candles.length; i++) {
        tr[i] = Math.max(
          candles[i].high - candles[i].low,
          Math.abs(candles[i].high - candles[i-1].close),
          Math.abs(candles[i].low - candles[i-1].close)
        );
      }
      const atr = calcSMA(tr, atrPeriod);
      // Supertrend
      const st: number[] = new Array(candles.length).fill(0);
      const dir: number[] = new Array(candles.length).fill(1); // 1=up, -1=down
      for (let i = atrPeriod; i < candles.length; i++) {
        const hl2 = (candles[i].high + candles[i].low) / 2;
        let ub = hl2 + mult * atr[i];
        let lb = hl2 - mult * atr[i];
        if (i > atrPeriod) {
          const prevUb = (candles[i-1].high + candles[i-1].low) / 2 + mult * atr[i-1];
          const prevLb = (candles[i-1].high + candles[i-1].low) / 2 - mult * atr[i-1];
          const prevSt = st[i-1];
          if (lb > (dir[i-1] === 1 ? prevSt : prevLb)) { /* keep */ } else { lb = dir[i-1] === 1 ? prevSt : prevLb; }
          if (ub < (dir[i-1] === -1 ? prevSt : prevUb)) { /* keep */ } else { ub = dir[i-1] === -1 ? prevSt : prevUb; }
        }
        if (dir[i-1] === 1) {
          dir[i] = closes[i] < st[i-1] ? -1 : 1;
        } else {
          dir[i] = closes[i] > st[i-1] ? 1 : -1;
        }
        st[i] = dir[i] === 1 ? lb : ub;
      }
      for (let i = w; i < candles.length; i++) {
        if (dir[i] === 1 && dir[i-1] === -1) signals[i] = 'long';
        if (dir[i] === -1 && dir[i-1] === 1) signals[i] = 'short';
      }
      break;
    }
    case 'ema_volume': {
      const f = calcEMA(closes, params.fastPeriod), s = calcEMA(closes, params.slowPeriod);
      const vols = candles.map(c => c.volume);
      const volSma = calcSMA(vols, 20);
      for (let i = w; i < candles.length; i++) {
        const volOk = vols[i] > volSma[i] * params.volumeMult;
        if (f[i] > s[i] && f[i-1] <= s[i-1] && volOk) signals[i] = 'long';
        if (f[i] < s[i] && f[i-1] >= s[i-1] && volOk) signals[i] = 'short';
      }
      break;
    }
    case 'donchian': {
      const period = params.period;
      for (let i = period + 1; i < candles.length; i++) {
        let hi = -Infinity, lo = Infinity;
        for (let j = i - period; j < i; j++) {
          if (candles[j].high > hi) hi = candles[j].high;
          if (candles[j].low < lo) lo = candles[j].low;
        }
        if (closes[i] > hi) signals[i] = 'long';
        if (closes[i] < lo) signals[i] = 'short';
      }
      break;
    }
    case 'ema_rsi_combo': {
      const ema = calcEMA(closes, params.emaPeriod), rsi = calcRSI(closes, params.rsiPeriod);
      for (let i = w; i < candles.length; i++) {
        if (closes[i] > ema[i] && rsi[i] < params.rsiEntry && rsi[i-1] >= params.rsiEntry) signals[i] = 'long';
        if (closes[i] < ema[i] && rsi[i] > (100-params.rsiEntry) && rsi[i-1] <= (100-params.rsiEntry)) signals[i] = 'short';
      } break;
    }
    case 'supertrend': {
      const period = Math.round(params.atrPeriod);
      const mult = params.multiplier;
      // Calculate ATR
      const atr: number[] = new Array(candles.length).fill(0);
      for (let i = 1; i < candles.length; i++) {
        const tr = Math.max(
          candles[i].high - candles[i].low,
          Math.abs(candles[i].high - candles[i-1].close),
          Math.abs(candles[i].low - candles[i-1].close)
        );
        if (i < period) { atr[i] = tr; }
        else if (i === period) {
          let s = 0; for (let j = 1; j <= period; j++) s += Math.max(
            candles[j].high - candles[j].low,
            Math.abs(candles[j].high - candles[j-1].close),
            Math.abs(candles[j].low - candles[j-1].close)
          );
          atr[i] = s / period;
        } else {
          const trCur = Math.max(
            candles[i].high - candles[i].low,
            Math.abs(candles[i].high - candles[i-1].close),
            Math.abs(candles[i].low - candles[i-1].close)
          );
          atr[i] = (atr[i-1] * (period - 1) + trCur) / period;
        }
      }
      // Calculate Supertrend
      const supertrend: number[] = new Array(candles.length).fill(0);
      let trend = 1; // 1 = bullish, -1 = bearish
      for (let i = period; i < candles.length; i++) {
        const hl2 = (candles[i].high + candles[i].low) / 2;
        const up = hl2 + mult * atr[i];
        const dn = hl2 - mult * atr[i];
        if (closes[i] > supertrend[i-1]) {
          supertrend[i] = dn;
          trend = 1;
        } else {
          supertrend[i] = up;
          trend = -1;
        }
        if (i > period) {
          if (closes[i] > supertrend[i-1] && closes[i-1] <= supertrend[i-1]) signals[i] = 'long';
          if (closes[i] < supertrend[i-1] && closes[i-1] >= supertrend[i-1]) signals[i] = 'short';
        }
      }
      break;
    }
    case 'ema_volume': {
      const fast = calcEMA(closes, params.fastPeriod), slow = calcEMA(closes, params.slowPeriod);
      const vols = candles.map(c => c.volume);
      const volSMA = calcSMA(vols, 20);
      for (let i = w; i < candles.length; i++) {
        const volOk = vols[i] > volSMA[i] * params.volumeMult;
        if (fast[i] > slow[i] && fast[i-1] <= slow[i-1] && volOk) signals[i] = 'long';
        if (fast[i] < slow[i] && fast[i-1] >= slow[i-1] && volOk) signals[i] = 'short';
      } break;
    }
    case 'donchian': {
      const p = Math.round(params.period);
      const upperCh: number[] = new Array(candles.length).fill(0);
      const lowerCh: number[] = new Array(candles.length).fill(0);
      for (let i = p - 1; i < candles.length; i++) {
        let hi = -Infinity, lo = Infinity;
        for (let j = i - p + 1; j <= i; j++) { hi = Math.max(hi, candles[j].high); lo = Math.min(lo, candles[j].low); }
        upperCh[i] = hi; lowerCh[i] = lo;
      }
      for (let i = w; i < candles.length; i++) {
        if (closes[i] > upperCh[i-1] && upperCh[i-1] > 0) signals[i] = 'long';
        if (closes[i] < lowerCh[i-1] && lowerCh[i-1] > 0) signals[i] = 'short';
      } break;
    }
  }
  return signals;
}

export async function runBacktest(config: BacktestConfig): Promise<BacktestResult> {
  const candles = await fetchKlines(config.symbol, config.timeframe, config.periodDays);
  const signals = generateSignals(config.strategyId, config.params, candles);
  let capital = config.initialCapital;
  let position: { direction: 'long'|'short'; entryPrice: number; entryTime: number; entryBar: number; size: number } | null = null;
  const trades: Trade[] = [];
  const equityCurve: { time: number; equity: number }[] = [];
  const posSize = () => capital * (config.maxPosition / 100);

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    if (position) {
      const diff = position.direction === 'long'
        ? (c.close - position.entryPrice) / position.entryPrice
        : (position.entryPrice - c.close) / position.entryPrice;
      let exit: Trade['exitReason'] | null = null;
      if (diff <= -(config.stopLoss / 100)) exit = 'stopLoss';
      if (diff >= (config.takeProfit / 100)) exit = 'takeProfit';
      if (signals[i] && signals[i] !== position.direction) exit = 'signal';
      if (exit) {
        const slip = position.entryPrice * config.slippage;
        const ep = position.direction === 'long' ? c.close - slip : c.close + slip;
        const pnl = position.direction === 'long'
          ? (ep - position.entryPrice) * position.size
          : (position.entryPrice - ep) * position.size;
        const fee = (position.entryPrice * position.size + ep * position.size) * config.feeRate;
        const net = pnl - fee;
        trades.push({ entryTime: position.entryTime, exitTime: c.time, direction: position.direction,
          entryPrice: position.entryPrice, exitPrice: ep, pnl: net,
          pnlPercent: (net / (position.entryPrice * position.size)) * 100,
          holdBars: i - position.entryBar, exitReason: exit });
        capital += net; position = null;
      }
    }
    if (!position && signals[i]) {
      const sz = posSize() / c.close;
      const slip = c.close * config.slippage;
      const ep = signals[i] === 'long' ? c.close + slip : c.close - slip;
      position = { direction: signals[i]!, entryPrice: ep, entryTime: c.time, entryBar: i, size: sz };
    }
    const unr = position ? (position.direction === 'long'
      ? (c.close - position.entryPrice) * position.size
      : (position.entryPrice - c.close) * position.size) : 0;
    equityCurve.push({ time: c.time, equity: capital + unr });
  }
  if (position && candles.length > 0) {
    const lc = candles[candles.length - 1];
    const pnl = position.direction === 'long'
      ? (lc.close - position.entryPrice) * position.size
      : (position.entryPrice - lc.close) * position.size;
    const fee = (position.entryPrice * position.size + lc.close * position.size) * config.feeRate;
    capital += pnl - fee;
    trades.push({ entryTime: position.entryTime, exitTime: lc.time, direction: position.direction,
      entryPrice: position.entryPrice, exitPrice: lc.close, pnl: pnl - fee,
      pnlPercent: ((pnl - fee) / (position.entryPrice * position.size)) * 100,
      holdBars: candles.length - 1 - position.entryBar, exitReason: 'signal' });
  }
  const wt = trades.filter(t => t.pnl > 0), lt = trades.filter(t => t.pnl <= 0);
  let peak = config.initialCapital, maxDd = 0;
  for (const pt of equityCurve) { if (pt.equity > peak) peak = pt.equity; const dd = (peak - pt.equity) / peak; if (dd > maxDd) maxDd = dd; }
  const rets = equityCurve.slice(1).map((pt, i) => (pt.equity - equityCurve[i].equity) / equityCurve[i].equity);
  const avgR = rets.length > 0 ? rets.reduce((a,b) => a+b, 0) / rets.length : 0;
  const stdR = rets.length > 1 ? Math.sqrt(rets.reduce((s,r) => s + (r-avgR)**2, 0) / (rets.length-1)) : 1;
  const sharpe = stdR > 0 ? (avgR / stdR) * Math.sqrt(252) : 0;
  const mm = new Map<string, {s:number;e:number}>();
  for (const pt of equityCurve) { const d = new Date(pt.time); const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; if (!mm.has(k)) mm.set(k, {s:pt.equity,e:pt.equity}); mm.get(k)!.e = pt.equity; }
  const monthly = Array.from(mm.entries()).map(([m,{s,e}]) => ({ month: m, returnPct: ((e-s)/s)*100 }));
  const tg = wt.reduce((s,t) => s+t.pnl, 0), tl = Math.abs(lt.reduce((s,t) => s+t.pnl, 0));
  return {
    strategyName: config.strategyId, symbol: config.symbol, timeframe: config.timeframe,
    period: config.periodDays, initialCapital: config.initialCapital, finalCapital: capital,
    totalReturn: capital - config.initialCapital, totalReturnPercent: ((capital - config.initialCapital) / config.initialCapital) * 100,
    winRate: trades.length > 0 ? (wt.length / trades.length) * 100 : 0,
    profitFactor: tl > 0 ? tg / tl : tg > 0 ? Infinity : 0,
    maxDrawdown: maxDd * peak, maxDrawdownPercent: maxDd * 100, sharpeRatio: sharpe,
    totalTrades: trades.length, winTrades: wt.length, lossTrades: lt.length,
    avgWin: wt.length > 0 ? tg / wt.length : 0, avgLoss: lt.length > 0 ? tl / lt.length : 0,
    avgHoldBars: trades.length > 0 ? trades.reduce((s,t) => s+t.holdBars, 0) / trades.length : 0,
    trades, equityCurve, monthlyReturns: monthly,
  };
}
