import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { encrypt } from '@/lib/encryption';
import { getBinanceBalance } from '@/lib/binance';
import { getOKXBalance } from '@/lib/okx';
import { getBybitBalance } from '@/lib/bybit';
import { getHyperliquidBalance } from '@/lib/hyperliquid';
import { cookies } from 'next/headers';

const SUPPORTED_EXCHANGES = ['binance', 'okx', 'bybit', 'hyperliquid'];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exchange, apiKey, apiSecret, passphrase } = await req.json();

    if (!exchange || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!SUPPORTED_EXCHANGES.includes(exchange)) {
      return NextResponse.json({ error: `Unsupported exchange: ${exchange}` }, { status: 400 });
    }

    // OKX requires passphrase
    if (exchange === 'okx' && !passphrase) {
      return NextResponse.json({ error: 'OKX requires a passphrase' }, { status: 400 });
    }

    // Binance/OKX/Bybit require apiSecret; Hyperliquid only needs wallet address
    if (exchange !== 'hyperliquid' && !apiSecret) {
      return NextResponse.json({ error: 'Missing API Secret' }, { status: 400 });
    }

    // Test connection by fetching balance
    let balance = 0;
    try {
      switch (exchange) {
        case 'binance':
          balance = await getBinanceBalance({ apiKey, apiSecret });
          break;
        case 'okx':
          balance = await getOKXBalance({ apiKey, apiSecret, passphrase });
          break;
        case 'bybit':
          balance = await getBybitBalance({ apiKey, apiSecret });
          break;
        case 'hyperliquid':
          balance = await getHyperliquidBalance({ apiKey, apiSecret: apiSecret || '' });
          break;
      }
    } catch (error: any) {
      return NextResponse.json({ 
        error: 'Failed to connect. Please check your credentials.',
        details: error.message 
      }, { status: 400 });
    }

    // Encrypt and store credentials
    const credentials = JSON.stringify({ exchange, apiKey, apiSecret, passphrase });
    const encrypted = encrypt(credentials);

    const cookieStore = await cookies();
    cookieStore.set('exchange-creds', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({ success: true, balance, exchange });
  } catch (error: any) {
    console.error('Exchange connect error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to connect exchange' 
    }, { status: 500 });
  }
}
