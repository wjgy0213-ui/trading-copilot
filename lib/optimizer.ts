import { runBacktest, BacktestConfig } from './backtestEngine';
import { STRATEGY_TEMPLATES } from './strategies';

export interface OptResult {
  params: Record<string, number>;
  sharpe: number;
  returnPct: number;
  winRate: number;
  maxDD: number;
}

// 生成参数网格，限制总组合数<maxCombos
function generateGrid(strategyId: string, maxCombos: number = 300): Record<string, number>[] {
  const tmpl = STRATEGY_TEMPLATES.find(t => t.id === strategyId);
  if (!tmpl) return [{}];

  // 每个参数生成可能值
  const paramValues: { key: string; values: number[] }[] = tmpl.params.map(p => {
    const values: number[] = [];
    for (let v = p.min; v <= p.max + 1e-9; v += p.step) values.push(Math.round(v * 1000) / 1000);
    return { key: p.key, values };
  });

  // 计算总组合数，如果太多就减少每个参数的采样点
  let totalCombos = paramValues.reduce((acc, p) => acc * p.values.length, 1);
  if (totalCombos > maxCombos) {
    const factor = Math.pow(maxCombos / totalCombos, 1 / paramValues.length);
    paramValues.forEach(p => {
      const targetLen = Math.max(3, Math.floor(p.values.length * factor));
      if (p.values.length > targetLen) {
        const step = (p.values.length - 1) / (targetLen - 1);
        const sampled: number[] = [];
        for (let i = 0; i < targetLen; i++) sampled.push(p.values[Math.round(i * step)]);
        p.values = sampled;
      }
    });
  }

  // 笛卡尔积
  let result: Record<string, number>[] = [{}];
  for (const pv of paramValues) {
    const next: Record<string, number>[] = [];
    for (const combo of result) {
      for (const val of pv.values) {
        next.push({ ...combo, [pv.key]: val });
      }
    }
    result = next;
  }
  return result;
}

export async function optimize(
  strategyId: string,
  baseConfig: Omit<BacktestConfig, 'strategyId' | 'params'>,
  onProgress?: (current: number, total: number) => void,
): Promise<OptResult[]> {
  const combos = generateGrid(strategyId);
  const results: OptResult[] = [];

  for (let i = 0; i < combos.length; i++) {
    try {
      const config: BacktestConfig = { ...baseConfig, strategyId, params: combos[i] };
      const r = await runBacktest(config);
      results.push({
        params: combos[i],
        sharpe: r.sharpeRatio,
        returnPct: r.totalReturnPercent,
        winRate: r.winRate,
        maxDD: r.maxDrawdownPercent,
      });
    } catch {
      // skip failed combos
    }
    if (onProgress && i % 5 === 0) {
      onProgress(i + 1, combos.length);
      // yield to UI
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  if (onProgress) onProgress(combos.length, combos.length);

  return results.sort((a, b) => b.sharpe - a.sharpe).slice(0, 5);
}
