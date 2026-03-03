import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { decrypt } from '@/lib/encryption';
import { getBinancePositions, getBinanceAccountInfo } from '@/lib/binance';
import { cookies } from 'next/headers';

interface RiskStatus {
  status: 'green' | 'yellow' | 'red';
  details: {
    maxPositionRisk: number;
    dailyLoss: number;
    maxLeverage: number;
    accountBalance: number;
  };
  positions: any[];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const encryptedCreds = cookieStore.get('exchange-creds')?.value;

    if (!encryptedCreds) {
      return NextResponse.json({ 
        status: 'green',
        details: {
          maxPositionRisk: 0,
          dailyLoss: 0,
          maxLeverage: 0,
          accountBalance: 0,
        },
        positions: []
      });
    }

    const credentials = JSON.parse(decrypt(encryptedCreds));
    const { exchange, apiKey, apiSecret } = credentials;

    if (exchange !== 'binance') {
      return NextResponse.json({ error: 'Only Binance is supported' }, { status: 400 });
    }

    const [rawPositions, accountInfo] = await Promise.all([
      getBinancePositions({ apiKey, apiSecret }),
      getBinanceAccountInfo({ apiKey, apiSecret })
    ]);

    const accountBalance = parseFloat(accountInfo.totalWalletBalance || '0');
    
    // Transform positions
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

    // Calculate risk metrics
    let maxPositionRisk = 0;
    let maxLeverage = 0;

    positions.forEach(p => {
      const positionRisk = accountBalance > 0 ? (Math.abs(p.pnl) / accountBalance) * 100 : 0;
      maxPositionRisk = Math.max(maxPositionRisk, positionRisk);
      maxLeverage = Math.max(maxLeverage, p.leverage);
    });

    // Calculate daily loss (simplified - using total unrealized PnL as proxy)
    const totalUnrealizedPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
    const dailyLoss = accountBalance > 0 && totalUnrealizedPnl < 0 
      ? (Math.abs(totalUnrealizedPnl) / accountBalance) * 100 
      : 0;

    // Determine status based on thresholds
    let status: 'green' | 'yellow' | 'red' = 'green';

    if (maxPositionRisk > 5 || dailyLoss > 8 || maxLeverage > 20) {
      status = 'red';
    } else if (maxPositionRisk > 3 || dailyLoss > 5 || maxLeverage > 10) {
      status = 'yellow';
    }

    const result: RiskStatus = {
      status,
      details: {
        maxPositionRisk,
        dailyLoss,
        maxLeverage,
        accountBalance,
      },
      positions,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Risk monitor error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch risk data' 
    }, { status: 500 });
  }
}
