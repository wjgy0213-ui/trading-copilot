import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { decrypt } from '@/lib/encryption';
import { closeBinancePosition } from '@/lib/binance';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, side, quantity } = await req.json();

    if (!symbol || !side || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const encryptedCreds = cookieStore.get('exchange-creds')?.value;

    if (!encryptedCreds) {
      return NextResponse.json({ error: 'No exchange connected' }, { status: 400 });
    }

    const credentials = JSON.parse(decrypt(encryptedCreds));
    const { exchange, apiKey, apiSecret } = credentials;

    if (exchange !== 'binance') {
      return NextResponse.json({ error: 'Only Binance is supported' }, { status: 400 });
    }

    const result = await closeBinancePosition(
      { apiKey, apiSecret },
      symbol,
      side,
      quantity.toString()
    );

    return NextResponse.json({ 
      success: true, 
      orderId: result.orderId 
    });
  } catch (error: any) {
    console.error('Close position error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to close position' 
    }, { status: 500 });
  }
}
