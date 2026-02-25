// ITC (Investment Trading Copilot) 指标模拟数据

export interface ITCIndicator {
  id: string;
  name: string;
  nameEn: string;
  value: number; // 0-1 范围
  history: { timestamp: number; value: number }[];
  description: string;
}

// 生成模拟历史数据（最近30天）
function generateHistory(baseValue: number, volatility: number = 0.1): { timestamp: number; value: number }[] {
  const now = Date.now();
  const history: { timestamp: number; value: number }[] = [];
  
  for (let i = 30; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const noise = (Math.random() - 0.5) * volatility;
    const value = Math.max(0, Math.min(1, baseValue + noise + Math.sin(i / 3) * volatility * 0.5));
    history.push({ timestamp, value });
  }
  
  return history;
}

export const ITCIndicators: ITCIndicator[] = [
  {
    id: 'btc-risk',
    name: 'BTC 风险',
    nameEn: 'BTC Risk',
    value: 0.35,
    history: generateHistory(0.35, 0.12),
    description: '比特币市场风险指标，基于价格波动性、MVRV等链上数据计算',
  },
  {
    id: 'eth-risk',
    name: 'ETH 风险',
    nameEn: 'ETH Risk',
    value: 0.42,
    history: generateHistory(0.42, 0.15),
    description: '以太坊市场风险指标，综合Gas费、活跃地址等因素',
  },
  {
    id: 'total-market-risk',
    name: '市场总风险',
    nameEn: 'Total Market Risk',
    value: 0.48,
    history: generateHistory(0.48, 0.10),
    description: '加密货币整体市场风险，综合市值、恐慌贪婪指数等',
  },
  {
    id: 'mvrv-zscore',
    name: 'MVRV Z-Score',
    nameEn: 'MVRV Z-Score',
    value: 0.28,
    history: generateHistory(0.28, 0.08),
    description: 'BTC市值与实现市值比值的Z分数，衡量顶部/底部区域',
  },
  {
    id: 'macro-recession-risk',
    name: '宏观衰退风险',
    nameEn: 'Macro Recession Risk',
    value: 0.55,
    history: generateHistory(0.55, 0.05),
    description: '全球宏观经济衰退风险，基于美债收益率曲线、失业率等',
  },
  {
    id: 'crypto-risk-indicator',
    name: '加密综合风险',
    nameEn: 'Crypto Risk Indicator',
    value: 0.38,
    history: generateHistory(0.38, 0.12),
    description: '综合所有指标的加密市场风险评估',
  },
];

// 获取风险等级
export function getRiskLevel(value: number): 'low' | 'medium' | 'high' {
  if (value < 0.3) return 'low';
  if (value < 0.7) return 'medium';
  return 'high';
}

// 获取风险颜色（国际版：绿低红高）
export function getRiskColor(value: number): string {
  if (value < 0.3) return 'text-green-400';
  if (value < 0.7) return 'text-yellow-400';
  return 'text-red-400';
}

export function getRiskBgColor(value: number): string {
  if (value < 0.3) return 'bg-green-500/20 border-green-500/30';
  if (value < 0.7) return 'bg-yellow-500/20 border-yellow-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

export function getRiskLabel(value: number, locale: 'zh' | 'en' = 'zh'): string {
  const level = getRiskLevel(value);
  if (locale === 'zh') {
    return { low: '低风险', medium: '中风险', high: '高风险' }[level];
  }
  return { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' }[level];
}
