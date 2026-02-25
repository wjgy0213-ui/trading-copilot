import { NextRequest, NextResponse } from 'next/server';

// AI Strategy Generator - converts natural language to strategy config
// Uses pattern matching + templates (no external LLM API needed for MVP)

interface StrategyConfig {
  strategyId: string;
  params: Record<string, number>;
  reasoning: string;
  name: string;
}

const STRATEGY_PATTERNS: {
  keywords: string[];
  strategyId: string;
  params: Record<string, number>;
  name: string;
}[] = [
  {
    keywords: ['趋势', 'trend', '跟踪', '追踪', 'supertrend', 'atr'],
    strategyId: 'supertrend',
    params: { atrPeriod: 14, multiplier: 3 },
    name: 'AI趋势跟踪策略',
  },
  {
    keywords: ['均线', 'ema', 'ma', '交叉', 'cross', '金叉', '死叉'],
    strategyId: 'ema_cross',
    params: { fastPeriod: 9, slowPeriod: 21 },
    name: 'AI均线交叉策略',
  },
  {
    keywords: ['超卖', '超买', 'rsi', '反转', 'reversal', '回归', '均值'],
    strategyId: 'rsi_reversal',
    params: { rsiPeriod: 14, oversold: 30, overbought: 70 },
    name: 'AI均值回归策略',
  },
  {
    keywords: ['布林', 'bollinger', 'bb', '波动', '通道', '带'],
    strategyId: 'bollinger',
    params: { period: 20, stdDev: 2 },
    name: 'AI波动率策略',
  },
  {
    keywords: ['macd', '动量', 'momentum', '背离', 'divergence'],
    strategyId: 'macd',
    params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    name: 'AI动量策略',
  },
  {
    keywords: ['突破', 'breakout', 'donchian', '海龟', 'turtle', '新高', '新低'],
    strategyId: 'donchian',
    params: { period: 20 },
    name: 'AI突破策略',
  },
  {
    keywords: ['量', 'volume', '放量', '缩量', '成交'],
    strategyId: 'ema_volume',
    params: { fastPeriod: 10, slowPeriod: 30, volumeMult: 1.5 },
    name: 'AI量价策略',
  },
  {
    keywords: ['组合', 'combo', '多指标', '综合', '稳健', '保守'],
    strategyId: 'ema_rsi_combo',
    params: { emaPeriod: 50, rsiPeriod: 14, rsiEntry: 40 },
    name: 'AI综合策略',
  },
];

// Adjust params based on modifiers in the prompt
function adjustParams(config: StrategyConfig, prompt: string): StrategyConfig {
  const p = { ...config.params };
  const lower = prompt.toLowerCase();

  // Aggressive / Conservative
  if (/激进|aggressive|高频|短线|scalp/.test(lower)) {
    if (p.fastPeriod) p.fastPeriod = Math.max(3, Math.floor(p.fastPeriod * 0.6));
    if (p.slowPeriod) p.slowPeriod = Math.max(10, Math.floor(p.slowPeriod * 0.6));
    if (p.period) p.period = Math.max(10, Math.floor(p.period * 0.6));
    if (p.atrPeriod) p.atrPeriod = Math.max(7, Math.floor(p.atrPeriod * 0.7));
    if (p.multiplier) p.multiplier = Math.max(1, p.multiplier - 1);
    config.reasoning += ' 检测到激进偏好，缩短周期参数。';
  }
  if (/保守|conservative|稳健|长线|swing/.test(lower)) {
    if (p.fastPeriod) p.fastPeriod = Math.floor(p.fastPeriod * 1.5);
    if (p.slowPeriod) p.slowPeriod = Math.floor(p.slowPeriod * 1.5);
    if (p.period) p.period = Math.floor(p.period * 1.5);
    if (p.atrPeriod) p.atrPeriod = Math.floor(p.atrPeriod * 1.3);
    if (p.multiplier) p.multiplier = Math.min(5, p.multiplier + 0.5);
    config.reasoning += ' 检测到保守偏好，延长周期参数。';
  }

  // Specific number mentions
  const periodMatch = lower.match(/(\d+)\s*(?:周期|period|日|天)/);
  if (periodMatch) {
    const val = parseInt(periodMatch[1]);
    if (p.period) p.period = val;
    if (p.atrPeriod) p.atrPeriod = val;
    config.reasoning += ` 使用用户指定周期 ${val}。`;
  }

  config.params = p;
  return config;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '请描述你想要的策略' }, { status: 400 });
    }

    const lower = prompt.toLowerCase();

    // Find best matching strategy
    let bestMatch = STRATEGY_PATTERNS[0];
    let bestScore = 0;

    for (const pattern of STRATEGY_PATTERNS) {
      let score = 0;
      for (const kw of pattern.keywords) {
        if (lower.includes(kw)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = pattern;
      }
    }

    // If no keyword matched, default to EMA+RSI combo (safest)
    if (bestScore === 0) {
      bestMatch = STRATEGY_PATTERNS[7]; // ema_rsi_combo
    }

    let config: StrategyConfig = {
      strategyId: bestMatch.strategyId,
      params: { ...bestMatch.params },
      name: bestMatch.name,
      reasoning: `基于「${prompt.slice(0, 50)}」分析，匹配到${bestMatch.name}（匹配度 ${bestScore}/${bestMatch.keywords.length}）。`,
    };

    config = adjustParams(config, prompt);

    // Generate risk recommendations
    let stopLoss = 3, takeProfit = 6;
    if (/激进|aggressive/.test(lower)) { stopLoss = 2; takeProfit = 4; }
    if (/保守|conservative/.test(lower)) { stopLoss = 5; takeProfit = 10; }

    return NextResponse.json({
      strategy: config,
      risk: { stopLoss, takeProfit, maxPosition: 30 },
      suggestions: [
        '建议先用90天数据回测验证',
        bestScore === 0 ? '未检测到明确策略偏好，推荐综合策略作为起点' : null,
        '可用参数优化器寻找最优参数组合',
      ].filter(Boolean),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
