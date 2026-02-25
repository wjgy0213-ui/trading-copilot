export type NewsCategory = 'market' | 'macro' | 'onchain' | 'trending';
export type Sentiment = 'bullish' | 'bearish' | 'neutral';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  sentiment: Sentiment;
  source: string;
  timestamp: number;
  impact: 'high' | 'medium' | 'low';
  tags?: string[];
}

export const NEWS_CATEGORIES: { id: NewsCategory | 'all'; label: string; labelEn: string; icon: string }[] = [
  { id: 'all', label: '全部', labelEn: 'All', icon: '◎' },
  { id: 'market', label: '市场数据', labelEn: 'Market', icon: '◈' },
  { id: 'macro', label: '宏观政策', labelEn: 'Macro', icon: '◆' },
  { id: 'onchain', label: '链上动态', labelEn: 'On-chain', icon: '◇' },
  { id: 'trending', label: '热门话题', labelEn: 'Trending', icon: '◉' },
];

const now = Date.now();
const h = 3600000;

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1', title: '最高法院驳回特朗普关税政策，美元空头创14年新高',
    summary: '美国或需退还1750亿美元关税。基金经理做空美元仓位创2012年以来新高。弱美元环境历史上利好风险资产和加密货币。',
    category: 'macro', sentiment: 'bullish', source: '金色财经', timestamp: now - 2*h, impact: 'high',
    tags: ['美元', '关税', '宏观'],
  },
  {
    id: '2', title: 'BTC ETF 昨日净流出 $2.038亿',
    summary: '机构资金连续第5日流出。Grayscale GBTC流出$1.2亿，BlackRock IBIT微幅流入$0.3亿。历史上ETF连续流出5日以上后往往迎来反弹。',
    category: 'onchain', sentiment: 'bearish', source: 'Bloomberg', timestamp: now - 4*h, impact: 'high',
    tags: ['ETF', '机构', 'BTC'],
  },
  {
    id: '3', title: 'Fear & Greed 指数维持 8 — 连续31天极度恐惧',
    summary: '接近历史极值。2022年6月曾触及6（BTC $17,600），当前BTC $63K+恐惧8=前所未有的价格-情绪背离。ITC Risk仅0.31（低风险买入区）。',
    category: 'market', sentiment: 'bullish', source: 'Alternative.me', timestamp: now - 5*h, impact: 'high',
    tags: ['情绪', 'Fear&Greed', '极端'],
  },
  {
    id: '4', title: 'Vitalik 2月已售出 $2174万 ETH',
    summary: 'V神本月持续向交易所转入ETH。其称资金用于支持以太坊生态项目，但短期对ETH价格构成约0.5%的卖压。',
    category: 'onchain', sentiment: 'bearish', source: 'Etherscan', timestamp: now - 6*h, impact: 'medium',
    tags: ['ETH', 'Vitalik', '抛售'],
  },
  {
    id: '5', title: 'Galaxy CEO: 量子计算对BTC不构成重大威胁',
    summary: 'Mike Novogratz回应市场FUD：当前量子计算能力距离破解SHA-256还有数十年。IBM量子计算概念股盘前齐升，但与加密安全无关。',
    category: 'trending', sentiment: 'neutral', source: 'Galaxy Digital', timestamp: now - 7*h, impact: 'medium',
    tags: ['量子计算', 'FUD', '安全'],
  },
  {
    id: '6', title: 'Coinbase Q4收入下滑20%，但逆势买入400枚BTC',
    summary: '交易收入跌破10亿美元大关。CEO Brian Armstrong宣布公司资产负债表增持BTC，"我们对长期前景非常有信心"。机构底部吸筹信号。',
    category: 'market', sentiment: 'neutral', source: 'Coinbase', timestamp: now - 8*h, impact: 'medium',
    tags: ['Coinbase', '财报', '机构'],
  },
  {
    id: '7', title: '在岸人民币升穿6.89关口，美元指数跌至98.5',
    summary: '美联储降息预期叠加美元走弱。DXY年内下跌8%。历史数据：DXY跌破100时BTC平均上涨45%（6个月）。',
    category: 'macro', sentiment: 'bullish', source: 'Reuters', timestamp: now - 9*h, impact: 'medium',
    tags: ['人民币', '美元', 'DXY'],
  },
  {
    id: '8', title: '币安Alpha上线代币化股票：AMZN、META、AAPL、GOOG',
    summary: '传统资产代币化加速。用户可用USDT直接交易科技巨头股票token。RWA赛道总TVL突破$120亿。',
    category: 'trending', sentiment: 'bullish', source: '币安', timestamp: now - 10*h, impact: 'medium',
    tags: ['币安', 'RWA', '代币化'],
  },
  {
    id: '9', title: 'Missouri州推进BTC储备法案',
    summary: '继德克萨斯、怀俄明、亚利桑那之后，Missouri成为第4个推进州级BTC储备的州。美国州级采用趋势加速。',
    category: 'macro', sentiment: 'bullish', source: 'CoinDesk', timestamp: now - 12*h, impact: 'medium',
    tags: ['政策', 'BTC储备', '美国'],
  },
  {
    id: '10', title: 'Meta宣布以太坊稳定币支付集成',
    summary: 'WhatsApp和Instagram将支持USDC转账。30亿+用户基础对ETH生态和稳定币采用是重大催化剂。',
    category: 'onchain', sentiment: 'bullish', source: 'Meta', timestamp: now - 14*h, impact: 'high',
    tags: ['Meta', 'USDC', '稳定币'],
  },
  {
    id: '11', title: 'DeFi TVL 跌至$580亿，较高点回落42%',
    summary: 'Aave、Lido、MakerDAO领跌。用户持续将资金从DeFi协议中撤出，转入稳定币或现金等待抄底。',
    category: 'onchain', sentiment: 'bearish', source: 'DefiLlama', timestamp: now - 16*h, impact: 'medium',
    tags: ['DeFi', 'TVL', '资金外流'],
  },
  {
    id: '12', title: 'BTC全网算力创新高 820 EH/s',
    summary: '尽管价格下跌，矿工算力持续增长。算力创新高通常是长期看涨信号 — 矿工用行动投票对未来价格有信心。',
    category: 'onchain', sentiment: 'bullish', source: 'Glassnode', timestamp: now - 18*h, impact: 'low',
    tags: ['算力', '矿工', 'BTC'],
  },
  {
    id: '13', title: 'Anthropic指控中国模型"蒸馏攻击"引爆AI圈争议',
    summary: 'Anthropic博文称部分中国AI公司通过API蒸馏复制Claude能力。IBM股价因AI担忧暴跌11%。AI行业信任危机升级。',
    category: 'trending', sentiment: 'neutral', source: 'Anthropic', timestamp: now - 20*h, impact: 'medium',
    tags: ['AI', 'Anthropic', '中国'],
  },
  {
    id: '14', title: '阿联酋$16B银行探索BTC投资',
    summary: '中东主权财富基金和银行正在评估将BTC纳入投资组合。阿布扎比投资局(ADIA)据称已完成BTC配置框架。',
    category: 'macro', sentiment: 'bullish', source: 'Financial Times', timestamp: now - 22*h, impact: 'high',
    tags: ['中东', '机构', '主权基金'],
  },
  {
    id: '15', title: 'Lightning Network月交易量首破$10亿',
    summary: 'LN通道数量突破80,000。跨境支付和小额支付用例爆发，尤其在拉丁美洲和非洲地区。',
    category: 'onchain', sentiment: 'bullish', source: 'The Block', timestamp: now - 24*h, impact: 'low',
    tags: ['Lightning', 'BTC', '支付'],
  },
];

export function getSentimentColor(sentiment: Sentiment): string {
  return { bullish: 'text-emerald-400', bearish: 'text-red-400', neutral: 'text-gray-400' }[sentiment];
}

export function getSentimentBgColor(sentiment: Sentiment): string {
  return { bullish: 'bg-emerald-500/10 text-emerald-400', bearish: 'bg-red-500/10 text-red-400', neutral: 'bg-gray-500/10 text-gray-400' }[sentiment];
}

export function getSentimentLabel(sentiment: Sentiment, locale: 'zh' | 'en' = 'zh'): string {
  if (locale === 'zh') return { bullish: '利好', bearish: '利空', neutral: '中性' }[sentiment];
  return { bullish: 'Bullish', bearish: 'Bearish', neutral: 'Neutral' }[sentiment];
}

export function getNewsByCategory(category?: NewsCategory): NewsItem[] {
  if (!category) return MOCK_NEWS;
  return MOCK_NEWS.filter(n => n.category === category);
}

export function getImpactColor(impact: string): string {
  return { high: 'text-red-400', medium: 'text-amber-400', low: 'text-gray-500' }[impact] || 'text-gray-500';
}

export function getImpactLabel(impact: string): string {
  return { high: '高影响', medium: '中影响', low: '低影响' }[impact] || impact;
}
