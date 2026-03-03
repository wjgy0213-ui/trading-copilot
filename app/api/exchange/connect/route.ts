import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { encrypt } from '@/lib/encryption';
import { getBinanceBalance } from '@/lib/binance';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { exchange, apiKey, apiSecret, passphrase } = await req.json();

    if (!exchange || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only Binance is implemented
    if (exchange !== 'binance') {
      return NextResponse.json({ error: 'Only Binance is supported currently' }, { status: 400 });
    }

    // Test the connection by fetching balance
    let balance = 0;
    try {
      balance = await getBinanceBalance({ apiKey, apiSecret });
    } catch (error: any) {
      return NextResponse.json({ 
        error: 'Failed to connect to exchange. Please check your API credentials.',
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
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      balance,
      exchange 
    });
  } catch (error: any) {
    console.error('Exchange connect error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to connect exchange' 
    }, { status: 500 });
  }
}
