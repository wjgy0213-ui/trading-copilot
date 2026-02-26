import { NextResponse } from 'next/server';

const ITC_API_KEY = process.env.ITC_API_KEY || '';
const BASE = 'https://app.intothecryptoverse.com/api/v2';

async function getPrices(): Promise<{ BTC: number | null; ETH: number | null }> {
  // Try CoinGecko first (works from Vercel edge)
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    if (data?.bitcoin?.usd && data?.ethereum?.usd) {
      return { BTC: data.bitcoin.usd, ETH: data.ethereum.usd };
    }
  } catch {}

  // Fallback: Binance
  try {
    const [btc, eth] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').then(r => r.json()),
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT').then(r => r.json()),
    ]);
    return {
      BTC: btc?.price ? parseFloat(btc.price) : null,
      ETH: eth?.price ? parseFloat(eth.price) : null,
    };
  } catch {}

  return { BTC: null, ETH: null };
}

export async function GET() {
  if (!ITC_API_KEY) {
    return NextResponse.json({ error: 'ITC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const [cryptoRes, fgRes, prices] = await Promise.all([
      fetch(`${BASE}/risk-models/price-based/crypto?apikey=${ITC_API_KEY}`, { next: { revalidate: 300 } }),
      fetch('https://api.alternative.me/fng/?limit=1'),
      getPrices(),
    ]);

    const crypto = await cryptoRes.json();
    const fg = await fgRes.json();

    return NextResponse.json({
      itc: crypto.data || {},
      fearGreed: fg.data?.[0] || {},
      prices,
      timestamp: Date.now(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
