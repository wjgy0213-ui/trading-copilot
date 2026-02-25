import { NextResponse } from 'next/server';

const ITC_API_KEY = process.env.ITC_API_KEY || '';
const BASE = 'https://app.intothecryptoverse.com/api/v2';

export async function GET() {
  if (!ITC_API_KEY) {
    return NextResponse.json({ error: 'ITC_API_KEY not configured' }, { status: 500 });
  }

  try {
    const [cryptoRes, fgRes] = await Promise.all([
      fetch(`${BASE}/risk-models/price-based/crypto?apikey=${ITC_API_KEY}`, { next: { revalidate: 300 } }),
      fetch('https://api.alternative.me/fng/?limit=1'),
    ]);

    const crypto = await cryptoRes.json();
    const fg = await fgRes.json();

    const btcPrice = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT').then(r => r.json());
    const ethPrice = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT').then(r => r.json());

    return NextResponse.json({
      itc: crypto.data || {},
      fearGreed: fg.data?.[0] || {},
      prices: {
        BTC: parseFloat(btcPrice.price),
        ETH: parseFloat(ethPrice.price),
      },
      timestamp: Date.now(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
