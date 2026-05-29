import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { encrypt } from '@/lib/encryption';
import { getBinanceBalance } from '@/lib/binance';
import { getOKXBalance } from '@/lib/okx';
import { getBybitBalance } from '@/lib/bybit';
import { getHyperliquidBalance } from '@/lib/hyperliquid';
import { cookies } from 'next/headers';
import { fillTemplate, getRequestLocale, translateForLocale as tr } from '@/lib/server-i18n';

const SUPPORTED_EXCHANGES = ['binance', 'okx', 'bybit', 'hyperliquid'];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  const locale = getRequestLocale(req);

  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: tr(locale, 'api.common.unauthorized') }, { status: 401 });
    }

    const { exchange, apiKey, apiSecret, passphrase } = await req.json();

    if (!exchange || !apiKey) {
      return NextResponse.json({ error: tr(locale, 'api.common.missingRequiredFields') }, { status: 400 });
    }

    if (!SUPPORTED_EXCHANGES.includes(exchange)) {
      return NextResponse.json({ error: fillTemplate(tr(locale, 'api.exchange.unsupported'), { exchange }) }, { status: 400 });
    }

    // OKX requires passphrase
    if (exchange === 'okx' && !passphrase) {
      return NextResponse.json({ error: tr(locale, 'api.exchange.okxPassphraseRequired') }, { status: 400 });
    }

    // Binance/OKX/Bybit require apiSecret; Hyperliquid only needs wallet address
    if (exchange !== 'hyperliquid' && !apiSecret) {
      return NextResponse.json({ error: tr(locale, 'api.exchange.apiSecretRequired') }, { status: 400 });
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
    } catch (error: unknown) {
      return NextResponse.json({ 
        error: tr(locale, 'api.exchange.connectCheckCredentials'),
        details: getErrorMessage(error) 
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

    return NextResponse.json({ success: true, balance, exchange, message: tr(locale, 'api.exchange.connected') });
  } catch (error: unknown) {
    console.error('Exchange connect error:', error);
    return NextResponse.json({ 
      error: getErrorMessage(error) || tr(locale, 'api.exchange.connectFailed') 
    }, { status: 500 });
  }
}
