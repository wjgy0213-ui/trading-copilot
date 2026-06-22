export type NewsCategory = 'market' | 'macro' | 'onchain' | 'trending';
export type Sentiment = 'bullish' | 'bearish' | 'neutral';

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface NewsItem {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  category: NewsCategory;
  sentiment: Sentiment;
  source: LocalizedText;
  timestamp: number;
  impact: 'high' | 'medium' | 'low';
  tags?: LocalizedText[];
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
    id: '1',
    title: { zh: '最高法院驳回特朗普关税政策，美元空头创14年新高', en: 'Supreme Court blocks Trump tariff policy, USD shorts hit a 14-year high' },
    summary: { zh: '美国或需退还1750亿美元关税。基金经理做空美元仓位创2012年以来新高。弱美元环境历史上利好风险资产和加密货币。', en: 'The US may need to refund $175B in tariffs. Fund managers have built the largest short USD position since 2012. A weak dollar backdrop has historically favored risk assets and crypto.' },
    category: 'macro', sentiment: 'bullish', source: { zh: '金色财经', en: 'Jinse Finance' }, timestamp: now - 2*h, impact: 'high',
    tags: [{ zh: '美元', en: 'USD' }, { zh: '关税', en: 'Tariffs' }, { zh: '宏观', en: 'Macro' }],
  },
  {
    id: '2',
    title: { zh: 'BTC ETF 昨日净流出 $2.038亿', en: 'BTC ETFs saw $203.8M in net outflows yesterday' },
    summary: { zh: '机构资金连续第5日流出。Grayscale GBTC流出$1.2亿，BlackRock IBIT微幅流入$0.3亿。历史上ETF连续流出5日以上后往往迎来反弹。', en: 'Institutional flows declined for a fifth straight day. Grayscale GBTC lost $120M while BlackRock IBIT posted a modest $30M inflow. Historically, 5+ days of outflows often preceded a rebound.' },
    category: 'onchain', sentiment: 'bearish', source: { zh: '彭博', en: 'Bloomberg' }, timestamp: now - 4*h, impact: 'high',
    tags: [{ zh: 'ETF', en: 'ETF' }, { zh: '机构', en: 'Institutions' }, { zh: 'BTC', en: 'BTC' }],
  },
  {
    id: '3',
    title: { zh: 'Fear & Greed 指数维持 8，连续31天极度恐惧', en: 'Fear & Greed stays at 8, marking 31 straight days of extreme fear' },
    summary: { zh: '接近历史极值。2022年6月曾触及6（BTC $17,600），当前BTC $63K+恐惧8=前所未有的价格-情绪背离。ITC Risk仅0.31（低风险买入区）。', en: 'The index is near historic extremes. In June 2022 it hit 6 when BTC was $17.6K, but today BTC is above $63K with fear still at 8, a rare price-sentiment divergence. ITC Risk remains low at 0.31.' },
    category: 'market', sentiment: 'bullish', source: { zh: 'Alternative.me', en: 'Alternative.me' }, timestamp: now - 5*h, impact: 'high',
    tags: [{ zh: '情绪', en: 'Sentiment' }, { zh: 'Fear&Greed', en: 'Fear&Greed' }, { zh: '极端', en: 'Extreme' }],
  },
  {
    id: '4',
    title: { zh: 'Vitalik 2月已售出 $2174万 ETH', en: 'Vitalik has sold $21.74M worth of ETH this month' },
    summary: { zh: 'V神本月持续向交易所转入ETH。其称资金用于支持以太坊生态项目，但短期对ETH价格构成约0.5%的卖压。', en: 'Vitalik has kept transferring ETH to exchanges this month. He says the funds support Ethereum ecosystem projects, but the moves may add around 0.5% of short-term sell pressure.' },
    category: 'onchain', sentiment: 'bearish', source: { zh: 'Etherscan', en: 'Etherscan' }, timestamp: now - 6*h, impact: 'medium',
    tags: [{ zh: 'ETH', en: 'ETH' }, { zh: 'Vitalik', en: 'Vitalik' }, { zh: '抛售', en: 'Selling' }],
  },
  {
    id: '5',
    title: { zh: 'Galaxy CEO：量子计算对BTC不构成重大威胁', en: 'Galaxy CEO says quantum computing is not a major threat to BTC' },
    summary: { zh: 'Mike Novogratz回应市场FUD：当前量子计算能力距离破解SHA-256还有数十年。IBM量子计算概念股盘前齐升，但与加密安全无关。', en: 'Mike Novogratz pushed back on market FUD, saying quantum computing is still decades away from breaking SHA-256. IBM-related quantum names rose premarket, but the move is not directly tied to crypto security.' },
    category: 'trending', sentiment: 'neutral', source: { zh: 'Galaxy Digital', en: 'Galaxy Digital' }, timestamp: now - 7*h, impact: 'medium',
    tags: [{ zh: '量子计算', en: 'Quantum' }, { zh: 'FUD', en: 'FUD' }, { zh: '安全', en: 'Security' }],
  },
  {
    id: '6',
    title: { zh: 'Coinbase Q4收入下滑20%，但逆势买入400枚BTC', en: 'Coinbase Q4 revenue fell 20%, but it still bought 400 BTC' },
    summary: { zh: '交易收入跌破10亿美元大关。CEO Brian Armstrong宣布公司资产负债表增持BTC，"我们对长期前景非常有信心"。机构底部吸筹信号。', en: 'Trading revenue dropped below the $1B mark. CEO Brian Armstrong said the company added BTC to its balance sheet, calling it a high-conviction long-term move.' },
    category: 'market', sentiment: 'neutral', source: { zh: 'Coinbase', en: 'Coinbase' }, timestamp: now - 8*h, impact: 'medium',
    tags: [{ zh: 'Coinbase', en: 'Coinbase' }, { zh: '财报', en: 'Earnings' }, { zh: '机构', en: 'Institutions' }],
  },
  {
    id: '7',
    title: { zh: '在岸人民币升穿6.89关口，美元指数跌至98.5', en: 'Onshore yuan breaks 6.89 while the DXY slips to 98.5' },
    summary: { zh: '美联储降息预期叠加美元走弱。DXY年内下跌8%。历史数据：DXY跌破100时BTC平均上涨45%（6个月）。', en: 'Rate-cut expectations and a weaker dollar are reinforcing each other. The DXY is down 8% this year, and historically BTC has averaged a 45% gain over six months once DXY breaks below 100.' },
    category: 'macro', sentiment: 'bullish', source: { zh: '路透', en: 'Reuters' }, timestamp: now - 9*h, impact: 'medium',
    tags: [{ zh: '人民币', en: 'CNY' }, { zh: '美元', en: 'USD' }, { zh: 'DXY', en: 'DXY' }],
  },
  {
    id: '8',
    title: { zh: '币安Alpha上线代币化股票：AMZN、META、AAPL、GOOG', en: 'Binance Alpha lists tokenized stocks including AMZN, META, AAPL, and GOOG' },
    summary: { zh: '传统资产代币化加速。用户可用USDT直接交易科技巨头股票token。RWA赛道总TVL突破$120亿。', en: 'Tokenization of traditional assets is accelerating. Users can trade tokenized mega-cap tech stocks directly with USDT, while total RWA TVL has now surpassed $12B.' },
    category: 'trending', sentiment: 'bullish', source: { zh: '币安', en: 'Binance' }, timestamp: now - 10*h, impact: 'medium',
    tags: [{ zh: '币安', en: 'Binance' }, { zh: 'RWA', en: 'RWA' }, { zh: '代币化', en: 'Tokenization' }],
  },
  {
    id: '9',
    title: { zh: 'Missouri州推进BTC储备法案', en: 'Missouri advances a strategic BTC reserve bill' },
    summary: { zh: '继德克萨斯、怀俄明、亚利桑那之后，Missouri成为第4个推进州级BTC储备的州。美国州级采用趋势加速。', en: 'After Texas, Wyoming, and Arizona, Missouri has become the fourth US state to push forward a Bitcoin reserve bill, reinforcing the state-level adoption trend.' },
    category: 'macro', sentiment: 'bullish', source: { zh: 'CoinDesk', en: 'CoinDesk' }, timestamp: now - 12*h, impact: 'medium',
    tags: [{ zh: '政策', en: 'Policy' }, { zh: 'BTC储备', en: 'BTC Reserve' }, { zh: '美国', en: 'US' }],
  },
  {
    id: '10',
    title: { zh: 'Meta宣布以太坊稳定币支付集成', en: 'Meta announces Ethereum stablecoin payment integration' },
    summary: { zh: 'WhatsApp和Instagram将支持USDC转账。30亿+用户基础对ETH生态和稳定币采用是重大催化剂。', en: 'WhatsApp and Instagram are set to support USDC transfers. With a user base above 3B, this could become a major catalyst for stablecoin adoption and the Ethereum ecosystem.' },
    category: 'onchain', sentiment: 'bullish', source: { zh: 'Meta', en: 'Meta' }, timestamp: now - 14*h, impact: 'high',
    tags: [{ zh: 'Meta', en: 'Meta' }, { zh: 'USDC', en: 'USDC' }, { zh: '稳定币', en: 'Stablecoins' }],
  },
  {
    id: '11',
    title: { zh: 'DeFi TVL 跌至$580亿，较高点回落42%', en: 'DeFi TVL falls to $58B, down 42% from the peak' },
    summary: { zh: 'Aave、Lido、MakerDAO领跌。用户持续将资金从DeFi协议中撤出，转入稳定币或现金等待抄底。', en: 'Aave, Lido, and MakerDAO are leading the decline. Users continue rotating capital out of DeFi and into stablecoins or cash while waiting for better entries.' },
    category: 'onchain', sentiment: 'bearish', source: { zh: 'DefiLlama', en: 'DefiLlama' }, timestamp: now - 16*h, impact: 'medium',
    tags: [{ zh: 'DeFi', en: 'DeFi' }, { zh: 'TVL', en: 'TVL' }, { zh: '资金外流', en: 'Outflows' }],
  },
  {
    id: '12',
    title: { zh: 'BTC全网算力创新高 820 EH/s', en: 'Bitcoin network hash rate hits a new high at 820 EH/s' },
    summary: { zh: '尽管价格下跌，矿工算力持续增长。算力创新高通常是长期看涨信号，矿工在用行动投票未来价格。', en: 'Hash rate keeps climbing despite weaker price action. New highs in mining power are often read as a long-term bullish signal, with miners effectively voting with capital.' },
    category: 'onchain', sentiment: 'bullish', source: { zh: 'Glassnode', en: 'Glassnode' }, timestamp: now - 18*h, impact: 'low',
    tags: [{ zh: '算力', en: 'Hash Rate' }, { zh: '矿工', en: 'Miners' }, { zh: 'BTC', en: 'BTC' }],
  },
  {
    id: '13',
    title: { zh: 'Anthropic指控中国模型“蒸馏攻击”引爆AI圈争议', en: 'Anthropic claims Chinese models used “distillation attacks,” sparking AI debate' },
    summary: { zh: 'Anthropic博文称部分中国AI公司通过API蒸馏复制Claude能力。IBM股价因AI担忧暴跌11%。AI行业信任危机升级。', en: 'Anthropic alleges that some Chinese AI companies replicated Claude-like capabilities through API distillation. AI-related fear also hit equities, with IBM dropping 11% as trust concerns widened.' },
    category: 'trending', sentiment: 'neutral', source: { zh: 'Anthropic', en: 'Anthropic' }, timestamp: now - 20*h, impact: 'medium',
    tags: [{ zh: 'AI', en: 'AI' }, { zh: 'Anthropic', en: 'Anthropic' }, { zh: '中国', en: 'China' }],
  },
  {
    id: '14',
    title: { zh: '阿联酋$16B银行探索BTC投资', en: 'A UAE bank managing $16B is exploring Bitcoin exposure' },
    summary: { zh: '中东主权财富基金和银行正在评估将BTC纳入投资组合。阿布扎比投资局(ADIA)据称已完成BTC配置框架。', en: 'Middle Eastern banks and sovereign wealth funds are evaluating BTC allocations. Abu Dhabi’s ADIA is reportedly already done building its framework for Bitcoin exposure.' },
    category: 'macro', sentiment: 'bullish', source: { zh: '金融时报', en: 'Financial Times' }, timestamp: now - 22*h, impact: 'high',
    tags: [{ zh: '中东', en: 'Middle East' }, { zh: '机构', en: 'Institutions' }, { zh: '主权基金', en: 'Sovereign Funds' }],
  },
  {
    id: '15',
    title: { zh: 'Lightning Network月交易量首破$10亿', en: 'Lightning Network monthly volume tops $1B for the first time' },
    summary: { zh: 'LN通道数量突破80,000。跨境支付和小额支付用例爆发，尤其在拉丁美洲和非洲地区。', en: 'Lightning channels have surpassed 80,000. Cross-border and micropayment use cases are accelerating, especially in Latin America and Africa.' },
    category: 'onchain', sentiment: 'bullish', source: { zh: 'The Block', en: 'The Block' }, timestamp: now - 24*h, impact: 'low',
    tags: [{ zh: 'Lightning', en: 'Lightning' }, { zh: 'BTC', en: 'BTC' }, { zh: '支付', en: 'Payments' }],
  },
];

export function localizeNewsText(value: LocalizedText, locale: 'zh' | 'en' = 'zh'): string {
  return value[locale] || value.zh || value.en;
}

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

export function getImpactLabel(impact: string, locale: 'zh' | 'en' = 'zh'): string {
  if (locale === 'en') {
    return { high: 'High Impact', medium: 'Medium Impact', low: 'Low Impact' }[impact] || impact;
  }
  return { high: '高影响', medium: '中影响', low: '低影响' }[impact] || impact;
}
