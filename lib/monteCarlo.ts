import { Trade, BacktestResult } from './backtestEngine';

export interface MonteCarloConfig {
  numSimulations: number;  // e.g. 1000
  initialCapital: number;
  confidenceLevels: number[];  // e.g. [0.05, 0.25, 0.5, 0.75, 0.95]
}

export interface SimulationPath {
  equityCurve: number[];
  finalCapital: number;
  maxDrawdownPercent: number;
  totalReturnPercent: number;
}

export interface MonteCarloResult {
  simulations: number;
  paths: SimulationPath[];  // all paths for charting
  // Percentile stats
  percentiles: {
    level: number;
    finalCapital: number;
    returnPercent: number;
    maxDrawdown: number;
  }[];
  // Probability metrics
  probProfit: number;           // P(return > 0)
  probDouble: number;           // P(return > 100%)
  probRuin: number;             // P(drawdown > 50%)
  probBeatBuyHold: number;      // P(return > buy&hold)
  // Distribution
  meanReturn: number;
  medianReturn: number;
  stdReturn: number;
  bestCase: number;
  worstCase: number;
  // Drawdown distribution
  meanMaxDrawdown: number;
  medianMaxDrawdown: number;
  worstDrawdown: number;
}

/**
 * Run Monte Carlo simulation by shuffling trade order.
 * This tests how robust a strategy is regardless of trade sequence.
 */
export function runMonteCarlo(
  result: BacktestResult,
  config: MonteCarloConfig
): MonteCarloResult {
  const trades = result.trades;
  if (trades.length < 2) {
    throw new Error('需要至少2笔交易才能运行蒙特卡洛模拟');
  }

  const pnlPercents = trades.map(t => t.pnlPercent / 100); // as decimal
  const numTrades = pnlPercents.length;
  const paths: SimulationPath[] = [];

  for (let sim = 0; sim < config.numSimulations; sim++) {
    // Fisher-Yates shuffle
    const shuffled = [...pnlPercents];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Simulate equity curve
    let capital = config.initialCapital;
    let peak = capital;
    let maxDd = 0;
    const curve: number[] = [capital];

    for (const pnl of shuffled) {
      capital *= (1 + pnl);
      if (capital <= 0) { capital = 0; maxDd = 1; break; }
      if (capital > peak) peak = capital;
      const dd = (peak - capital) / peak;
      if (dd > maxDd) maxDd = dd;
      curve.push(capital);
    }

    paths.push({
      equityCurve: curve,
      finalCapital: capital,
      maxDrawdownPercent: maxDd * 100,
      totalReturnPercent: ((capital - config.initialCapital) / config.initialCapital) * 100,
    });
  }

  // Sort by final capital for percentile calculation
  const sortedByReturn = [...paths].sort((a, b) => a.finalCapital - b.finalCapital);
  const sortedByDD = [...paths].sort((a, b) => a.maxDrawdownPercent - b.maxDrawdownPercent);

  const getPercentile = (arr: SimulationPath[], p: number) => {
    const idx = Math.floor(p * arr.length);
    return arr[Math.min(idx, arr.length - 1)];
  };

  const percentiles = config.confidenceLevels.map(level => {
    const sim = getPercentile(sortedByReturn, level);
    const ddSim = getPercentile(sortedByDD, level);
    return {
      level,
      finalCapital: Math.round(sim.finalCapital * 100) / 100,
      returnPercent: Math.round(sim.totalReturnPercent * 100) / 100,
      maxDrawdown: Math.round(ddSim.maxDrawdownPercent * 100) / 100,
    };
  });

  const returns = paths.map(p => p.totalReturnPercent);
  const drawdowns = paths.map(p => p.maxDrawdownPercent);
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const std = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length);

  const sortedReturns = [...returns].sort((a, b) => a - b);
  const median = sortedReturns[Math.floor(sortedReturns.length / 2)];
  const sortedDD = [...drawdowns].sort((a, b) => a - b);
  const medianDD = sortedDD[Math.floor(sortedDD.length / 2)];

  // Buy & hold return from original result
  const buyHoldReturn = result.totalReturnPercent;

  return {
    simulations: config.numSimulations,
    paths: samplePaths(paths, 200), // Keep max 200 for charting
    percentiles,
    probProfit: paths.filter(p => p.totalReturnPercent > 0).length / paths.length,
    probDouble: paths.filter(p => p.totalReturnPercent > 100).length / paths.length,
    probRuin: paths.filter(p => p.maxDrawdownPercent > 50).length / paths.length,
    probBeatBuyHold: paths.filter(p => p.totalReturnPercent > buyHoldReturn).length / paths.length,
    meanReturn: Math.round(mean * 100) / 100,
    medianReturn: Math.round(median * 100) / 100,
    stdReturn: Math.round(std * 100) / 100,
    bestCase: Math.round(Math.max(...returns) * 100) / 100,
    worstCase: Math.round(Math.min(...returns) * 100) / 100,
    meanMaxDrawdown: Math.round(drawdowns.reduce((s, d) => s + d, 0) / drawdowns.length * 100) / 100,
    medianMaxDrawdown: Math.round(medianDD * 100) / 100,
    worstDrawdown: Math.round(Math.max(...drawdowns) * 100) / 100,
  };
}

/** Sample N paths evenly for chart rendering */
function samplePaths(paths: SimulationPath[], maxPaths: number): SimulationPath[] {
  if (paths.length <= maxPaths) return paths;
  // Sort by return and sample evenly
  const sorted = [...paths].sort((a, b) => a.totalReturnPercent - b.totalReturnPercent);
  const step = sorted.length / maxPaths;
  const sampled: SimulationPath[] = [];
  for (let i = 0; i < maxPaths; i++) {
    sampled.push(sorted[Math.floor(i * step)]);
  }
  return sampled;
}
