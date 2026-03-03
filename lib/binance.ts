import { createHmac } from 'crypto';

export interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface BinancePosition {
  symbol: string;
  side: 'LONG' | 'SHORT' | 'BOTH';
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unRealizedProfit: string;
  leverage: string;
  liquidationPrice: string;
}

export interface BinanceBalance {
  totalWalletBalance: string;
  availableBalance: string;
}

const BINANCE_FUTURES_BASE = 'https://fapi.binance.com';

function signRequest(queryString: string, apiSecret: string): string {
  return createHmac('sha256', apiSecret).update(queryString).digest('hex');
}

export async function getBinanceBalance(creds: BinanceCredentials): Promise<number> {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = signRequest(queryString, creds.apiSecret);
  
  const response = await fetch(`${BINANCE_FUTURES_BASE}/fapi/v2/account?${queryString}&signature=${signature}`, {
    headers: { 'X-MBX-APIKEY': creds.apiKey },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Binance API error: ${error}`);
  }
  
  const data = await response.json();
  return parseFloat(data.totalWalletBalance || '0');
}

export async function getBinancePositions(creds: BinanceCredentials): Promise<BinancePosition[]> {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = signRequest(queryString, creds.apiSecret);
  
  const response = await fetch(`${BINANCE_FUTURES_BASE}/fapi/v2/positionRisk?${queryString}&signature=${signature}`, {
    headers: { 'X-MBX-APIKEY': creds.apiKey },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Binance API error: ${error}`);
  }
  
  const data: BinancePosition[] = await response.json();
  
  // Filter out positions with zero amount
  return data.filter(p => parseFloat(p.positionAmt) !== 0);
}

export async function closeBinancePosition(
  creds: BinanceCredentials,
  symbol: string,
  side: 'LONG' | 'SHORT',
  quantity: string
): Promise<{ orderId: number }> {
  const timestamp = Date.now();
  
  // Reverse the side for closing
  const closeSide = side === 'LONG' ? 'SELL' : 'BUY';
  
  const params = new URLSearchParams({
    symbol,
    side: closeSide,
    type: 'MARKET',
    quantity,
    reduceOnly: 'true',
    timestamp: timestamp.toString(),
  });
  
  const queryString = params.toString();
  const signature = signRequest(queryString, creds.apiSecret);
  
  const response = await fetch(`${BINANCE_FUTURES_BASE}/fapi/v1/order?${queryString}&signature=${signature}`, {
    method: 'POST',
    headers: { 'X-MBX-APIKEY': creds.apiKey },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Binance API error: ${error}`);
  }
  
  const data = await response.json();
  return { orderId: data.orderId };
}

export async function getBinanceAccountInfo(creds: BinanceCredentials) {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = signRequest(queryString, creds.apiSecret);
  
  const response = await fetch(`${BINANCE_FUTURES_BASE}/fapi/v2/account?${queryString}&signature=${signature}`, {
    headers: { 'X-MBX-APIKEY': creds.apiKey },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Binance API error: ${error}`);
  }
  
  return response.json();
}
