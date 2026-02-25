// 模拟新闻数据

export type NewsCategory = 'market' | 'macro' | 'onchain' | 'hot';
export type NewsSentiment = 'bullish' | 'bearish' | 'neutral';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  sentiment: NewsSentiment;
  timestamp: number;
  source: string;
  url?: string;
}

export const NEWS_CATEGORIES = [
  { id: 'market' as NewsCategory, name: '市场数据', nameEn: 'Market Data' },
  { id: 'macro' as NewsCategory, name: '宏观政策', nameEn: 'Macro Policy' },
  { id: 'onchain' as NewsCategory, name: '链上动态', nameEn: 'On-chain Analytics' },
  { id: 'hot' as NewsCategory, name: '热门话题', nameEn: 'Hot Topics' },
];

export function getSentimentColor(sentiment: NewsSentiment): string {
  switch (sentiment) {
    case 'bullish':
      return 'text-green-400';
    case 'bearish':
      return 'text-red-400';
    case 'neutral':
      return 'text-gray-400';
  }
}

export function getSentimentBgColor(sentiment: NewsSentiment): string {
  switch (sentiment) {
    case 'bullish':
      return 'bg-green-500/10 border-green-500/30';
    case 'bearish':
      return 'bg-red-500/10 border-red-500/30';
    case 'neutral':
      return 'bg-gray-500/10 border-gray-500/30';
  }
}

export function getSentimentLabel(sentiment: NewsSentiment): string {
  switch (sentiment) {
    case 'bullish':
      return '利好';
    case 'bearish':
      return '利空';
    case 'neutral':
      return '中性';
  }
}

// 模拟新闻数据
export const MOCK_NEWS: NewsItem[] = [
  // 市场数据
  {
    id: 'news-1',
    title: 'BTC突破$68,000，创近期新高',
    summary: '比特币今日凌晨突破$68,000关口，24小时涨幅达到8.5%。分析师认为机构资金持续流入是主要推动力。',
    category: 'market',
    sentiment: 'bullish',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    source: '金色财经',
  },
  {
    id: 'news-2',
    title: 'ETH Gas费降至2023年来新低',
    summary: '随着Layer2采用率提升，以太坊主网Gas费降至平均5 Gwei，创下2023年以来最低水平。链上活跃度保持稳定。',
    category: 'market',
    sentiment: 'bullish',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    source: 'CoinDesk',
  },
  {
    id: 'news-3',
    title: '恐慌贪婪指数达到72，市场情绪转向贪婪',
    summary: '加密市场恐慌贪婪指数从昨日的58跳升至72，进入"贪婪"区间。历史数据显示该水平往往伴随短期调整风险。',
    category: 'market',
    sentiment: 'neutral',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    source: 'Alternative.me',
  },

  // 宏观政策
  {
    id: 'news-4',
    title: '美联储维持利率不变，鲍威尔称通胀仍需关注',
    summary: '美联储FOMC会议决定维持联邦基金利率在5.25%-5.50%不变。鲍威尔在发布会上表示通胀虽有所缓解但仍高于目标水平。',
    category: 'macro',
    sentiment: 'neutral',
    timestamp: Date.now() - 8 * 60 * 60 * 1000,
    source: 'FED',
  },
  {
    id: 'news-5',
    title: '香港证监会批准首批比特币现货ETF',
    summary: '香港证监会今日宣布批准3家机构的比特币现货ETF申请，预计下月正式上市交易。这是亚洲首批获批的比特币现货ETF产品。',
    category: 'macro',
    sentiment: 'bullish',
    timestamp: Date.now() - 12 * 60 * 60 * 1000,
    source: 'SFC',
  },
  {
    id: 'news-6',
    title: 'SEC再次推迟以太坊现货ETF决议',
    summary: '美国SEC将VanEck和ARK的以太坊现货ETF决议推迟至5月底。市场分析师认为批准概率低于50%。',
    category: 'macro',
    sentiment: 'bearish',
    timestamp: Date.now() - 18 * 60 * 60 * 1000,
    source: 'SEC',
  },

  // 链上动态
  {
    id: 'news-7',
    title: '巨鲸地址24小时增持15,000枚BTC',
    summary: '链上数据显示，过去24小时内多个巨鲸地址累计增持15,000枚BTC，价值超过10亿美元。资金主要来自交易所提币。',
    category: 'onchain',
    sentiment: 'bullish',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    source: 'CryptoQuant',
  },
  {
    id: 'news-8',
    title: 'Coinbase净流出创单日新高',
    summary: '今日Coinbase净流出达到8,500枚BTC，创下单日新高。分析师认为这可能是机构客户转向冷钱包存储的信号。',
    category: 'onchain',
    sentiment: 'bullish',
    timestamp: Date.now() - 10 * 60 * 60 * 1000,
    source: 'Glassnode',
  },
  {
    id: 'news-9',
    title: 'DeFi锁仓量突破$600亿',
    summary: 'DeFi协议总锁仓量（TVL）突破$600亿美元，较上月增长18%。Aave和Lido领涨，分别增长25%和32%。',
    category: 'onchain',
    sentiment: 'bullish',
    timestamp: Date.now() - 14 * 60 * 60 * 1000,
    source: 'DefiLlama',
  },

  // 热门话题
  {
    id: 'news-10',
    title: 'MicroStrategy再次购买5,000枚BTC',
    summary: 'Michael Saylor宣布MicroStrategy以平均$67,500的价格购买5,000枚BTC，公司持仓总量突破200,000枚。',
    category: 'hot',
    sentiment: 'bullish',
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
    source: 'Twitter',
  },
  {
    id: 'news-11',
    title: 'Vitalik提出以太坊新扩容方案',
    summary: 'Vitalik Buterin在最新博文中提出以太坊新扩容方案"The Surge 2.0"，目标是将TPS提升至100,000+。',
    category: 'hot',
    sentiment: 'bullish',
    timestamp: Date.now() - 7 * 60 * 60 * 1000,
    source: 'Ethereum Blog',
  },
  {
    id: 'news-12',
    title: '币安宣布下架多个隐私币',
    summary: '币安发布公告称将于下月15日下架Monero、Zcash等隐私币。这是继欧洲交易所后又一主流平台采取的监管应对措施。',
    category: 'hot',
    sentiment: 'bearish',
    timestamp: Date.now() - 16 * 60 * 60 * 1000,
    source: 'Binance',
  },
  {
    id: 'news-13',
    title: 'Solana网络出现短暂宕机',
    summary: 'Solana主网今日凌晨出现约2小时宕机，验证节点已完成重启。这是今年第3次网络中断事件。',
    category: 'hot',
    sentiment: 'bearish',
    timestamp: Date.now() - 20 * 60 * 60 * 1000,
    source: 'Solana Status',
  },
  {
    id: 'news-14',
    title: 'OpenAI考虑推出加密货币支付',
    summary: 'Sam Altman在采访中透露OpenAI正在评估支持加密货币支付的可行性，优先考虑稳定币和BTC。',
    category: 'hot',
    sentiment: 'bullish',
    timestamp: Date.now() - 22 * 60 * 60 * 1000,
    source: 'Bloomberg',
  },
];

// 按分类筛选新闻
export function getNewsByCategory(category?: NewsCategory): NewsItem[] {
  if (!category) return MOCK_NEWS;
  return MOCK_NEWS.filter((news) => news.category === category);
}

// 按时间排序
export function sortNewsByTime(news: NewsItem[]): NewsItem[] {
  return [...news].sort((a, b) => b.timestamp - a.timestamp);
}
