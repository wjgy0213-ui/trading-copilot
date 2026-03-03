import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { decrypt } from '@/lib/encryption';
import { getBinancePositions } from '@/lib/binance';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const rawPositions = await getBinancePositions({ apiKey, apiSecret });

    // Transform to frontend format
    const positions = rawPositions.map(p => ({
      symbol: p.symbol,
      side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
      size: Math.abs(parseFloat(p.positionAmt)),
      entryPrice: parseFloat(p.entryPrice),
      markPrice: parseFloat(p.markPrice),
      pnl: parseFloat(p.unRealizedProfit),
      leverage: parseInt(p.leverage),
      liquidationPrice: parseFloat(p.liquidationPrice),
    }));

    return NextResponse.json({ positions });
  } catch (error: any) {
    console.error('Get positions error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch positions' 
    }, { status: 500 });
  }
}
