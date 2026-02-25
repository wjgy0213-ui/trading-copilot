import { NextResponse } from 'next/server';

interface RawNews {
  title: string;
  summary: string;
  source: string;
  timestamp: number;
  category: 'market' | 'macro' | 'onchain' | 'trending';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  tags: string[];
}

// Fetch from CoinGecko trending + Fear & Greed for real market data
async function fetchMarketNews(): Promise<RawNews[]> {
  const news: RawNews[] = [];
  const now = Date.now();

  try {
    // Fear & Greed
    const fgRes = await fetch('https://api.alternative.me/fng/?limit=1&format=json');
    const fg = await fgRes.json();
    if (fg.data?.[0]) {
      const val = parseInt(fg.data[0].value);
      news.push({
        title: `Fear & Greed 指数: ${val} — ${fg.data[0].value_classification}`,
        summary: val < 20 ? `极度恐惧区间。历史上F&G<20时，未来30天平均回报为正。当前市场情绪处于历史低位。` : val > 80 ? `极度贪婪，市场过热，注意风险。` : `市场情绪中性。`,
        source: 'Alternative.me', timestamp: now, category: 'market',
        sentiment: val < 25 ? 'bullish' : val > 75 ? 'bearish' : 'neutral',
        impact: val < 15 || val > 85 ? 'high' : 'medium', tags: ['情绪', 'Fear&Greed'],
      });
    }
  } catch {}

  try {
    // BTC/ETH 24h change
    const [btcRes, ethRes] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT'),
    ]);
    const btc = await btcRes.json();
    const eth = await ethRes.json();
    const btcPct = parseFloat(btc.priceChangePercent);
    const ethPct = parseFloat(eth.priceChangePercent);

    news.push({
      title: `BTC 24h ${btcPct >= 0 ? '+' : ''}${btcPct.toFixed(2)}% | ETH ${ethPct >= 0 ? '+' : ''}${ethPct.toFixed(2)}%`,
      summary: `BTC $${parseFloat(btc.lastPrice).toLocaleString()} (24h量 $${(parseFloat(btc.quoteVolume) / 1e9).toFixed(1)}B)，ETH $${parseFloat(eth.lastPrice).toLocaleString()} (24h量 $${(parseFloat(eth.quoteVolume) / 1e9).toFixed(1)}B)。`,
      source: 'Binance', timestamp: now, category: 'market',
      sentiment: btcPct > 2 ? 'bullish' : btcPct < -2 ? 'bearish' : 'neutral',
      impact: Math.abs(btcPct) > 5 ? 'high' : 'medium', tags: ['BTC', 'ETH', '价格'],
    });
  } catch {}

  try {
    // CoinGecko trending
    const trendRes = await fetch('https://api.coingecko.com/api/v3/search/trending');
    const trend = await trendRes.json();
    if (trend.coins?.length > 0) {
      const top3 = trend.coins.slice(0, 3).map((c: any) => c.item?.name || c.item?.symbol).join('、');
      news.push({
        title: `热门币种: ${top3}`,
        summary: `CoinGecko 24h搜索热度排行。${trend.coins.slice(0, 5).map((c: any) => `${c.item?.name} (#${c.item?.market_cap_rank || '?'})`).join('、')}。`,
        source: 'CoinGecko', timestamp: now - 3600000, category: 'trending',
        sentiment: 'neutral', impact: 'low', tags: ['热门', 'trending'],
      });
    }
  } catch {}

  try {
    // Global market data
    const globalRes = await fetch('https://api.coingecko.com/api/v3/global');
    const global = await globalRes.json();
    const d = global.data;
    if (d) {
      const btcDom = d.market_cap_percentage?.btc?.toFixed(1);
      const totalMcap = (d.total_market_cap?.usd / 1e12).toFixed(2);
      const mcapChange = d.market_cap_change_percentage_24h_usd?.toFixed(2);
      news.push({
        title: `总市值 $${totalMcap}T (${parseFloat(mcapChange!) >= 0 ? '+' : ''}${mcapChange}%) | BTC占比 ${btcDom}%`,
        summary: `活跃加密货币 ${d.active_cryptocurrencies?.toLocaleString()} 个。24h交易量 $${(d.total_volume?.usd / 1e9).toFixed(0)}B。DeFi占比 ${((d.defi_volume / d.total_volume?.usd) * 100).toFixed(1)}%。`,
        source: 'CoinGecko', timestamp: now - 1800000, category: 'market',
        sentiment: parseFloat(mcapChange!) > 1 ? 'bullish' : parseFloat(mcapChange!) < -1 ? 'bearish' : 'neutral',
        impact: 'medium', tags: ['市值', 'BTC.D', '全局'],
      });
    }
  } catch {}

  return news;
}

export async function GET() {
  try {
    const news = await fetchMarketNews();
    return NextResponse.json({ news, timestamp: Date.now(), isLive: true }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
  } catch (e: any) {
    return NextResponse.json({ news: [], error: e.message, isLive: false }, { status: 500 });
  }
}
