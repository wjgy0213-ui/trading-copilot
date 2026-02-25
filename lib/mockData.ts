// ITC (Into The Cryptoverse) 指标模拟数据

export interface ITCIndicator {
  id: string;
  name: string;
  nameEn: string;
  value: number;
  history: { timestamp: number; value: number }[];
  description: string;
  category: 'crypto' | 'macro' | 'onchain';
}

function generateHistory(baseValue: number, volatility: number = 0.1, days: number = 180): { timestamp: number; value: number }[] {
  const now = Date.now();
  const history: { timestamp: number; value: number }[] = [];
  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const noise = (Math.random() - 0.5) * volatility;
    const value = Math.max(0, Math.min(1, baseValue + noise + Math.sin(i / 5) * volatility * 0.5));
    history.push({ timestamp, value });
  }
  return history;
}

export const ITCIndicators: ITCIndicator[] = [
  {
    id: 'btc-risk', name: 'BTC 风险', nameEn: 'BTC Risk', value: 0.31,
    history: generateHistory(0.31, 0.12, 180), category: 'crypto',
    description: '基于价格回归模型的BTC长周期风险值。0.3以下为历史性买入区间。',
  },
  {
    id: 'eth-risk', name: 'ETH 风险', nameEn: 'ETH Risk', value: 0.29,
    history: generateHistory(0.29, 0.15, 180), category: 'crypto',
    description: '以太坊长周期风险指标，综合价格、Gas费、活跃地址等因素。',
  },
  {
    id: 'total-market-risk', name: '市场总风险', nameEn: 'Total Market Risk', value: 0.33,
    history: generateHistory(0.33, 0.10, 180), category: 'crypto',
    description: '加密货币总市值风险指标，衡量整体市场热度。',
  },
  {
    id: 'mvrv-zscore', name: 'MVRV Z-Score', nameEn: 'MVRV Z-Score', value: 0.45,
    history: generateHistory(0.45, 0.08, 180), category: 'onchain',
    description: 'BTC市值与实现市值比值的Z分数。<0.3极度低估，>0.7极度高估。',
  },
  {
    id: 'macro-recession-risk', name: '宏观衰退风险', nameEn: 'Macro Recession Risk', value: 0.62,
    history: generateHistory(0.62, 0.05, 180), category: 'macro',
    description: '基于美债收益率曲线、失业率、PMI等的全球宏观衰退概率。',
  },
  {
    id: 'crypto-risk', name: '综合加密风险', nameEn: 'Crypto Risk Index', value: 0.29,
    history: generateHistory(0.29, 0.12, 180), category: 'crypto',
    description: '综合所有ITC指标的加权风险评分。',
  },
  {
    id: 'fear-greed', name: '恐惧贪婪指数', nameEn: 'Fear & Greed', value: 0.08,
    history: generateHistory(0.15, 0.10, 180), category: 'crypto',
    description: '市场情绪指标。当前处于极度恐惧区间，历史上是最佳买入时机之一。',
  },
  {
    id: 'stablecoin-supply', name: '稳定币供应比', nameEn: 'Stablecoin Supply Ratio', value: 0.55,
    history: generateHistory(0.55, 0.08, 180), category: 'onchain',
    description: '稳定币市值占总市值比例。高=场外资金充裕，低=资金紧张。',
  },
  {
    id: 'btc-dominance', name: 'BTC 市占率', nameEn: 'BTC Dominance', value: 0.64,
    history: generateHistory(0.60, 0.06, 180), category: 'crypto',
    description: 'BTC市值占加密总市值比例。高=避险情绪强，低=山寨币季节。',
  },
  {
    id: 'etf-flow', name: 'ETF 资金流向', nameEn: 'BTC ETF Flow', value: 0.35,
    history: generateHistory(0.40, 0.15, 180), category: 'onchain',
    description: 'BTC现货ETF近期净流入/流出趋势。低=机构在撤退。',
  },
  {
    id: 'defi-tvl', name: 'DeFi TVL 健康度', nameEn: 'DeFi TVL Health', value: 0.42,
    history: generateHistory(0.45, 0.10, 180), category: 'onchain',
    description: 'DeFi总锁仓值相对趋势线的偏离度。低=资金外流。',
  },
  {
    id: 'vix', name: 'VIX 波动率', nameEn: 'VIX Volatility', value: 0.58,
    history: generateHistory(0.50, 0.12, 180), category: 'macro',
    description: '标普500波动率指数。高=传统市场恐慌，可能拖累加密市场。',
  },
];

export function getRiskLevel(value: number): 'low' | 'medium' | 'high' {
  if (value < 0.3) return 'low';
  if (value < 0.7) return 'medium';
  return 'high';
}

export function getRiskColor(value: number): string {
  if (value < 0.3) return 'text-emerald-400';
  if (value < 0.7) return 'text-amber-400';
  return 'text-red-400';
}

export function getRiskBgColor(value: number): string {
  if (value < 0.3) return 'bg-emerald-500/10 text-emerald-400';
  if (value < 0.7) return 'bg-amber-500/10 text-amber-400';
  return 'bg-red-500/10 text-red-400';
}

export function getRiskLabel(value: number, locale: 'zh' | 'en' = 'zh'): string {
  if (locale === 'zh') {
    if (value < 0.3) return '低风险';
    if (value < 0.7) return '中风险';
    return '高风险';
  }
  if (value < 0.3) return 'Low';
  if (value < 0.7) return 'Medium';
  return 'High';
}

export function getRiskStrokeColor(value: number): string {
  if (value < 0.3) return '#34d399';
  if (value < 0.7) return '#fbbf24';
  return '#f87171';
}
