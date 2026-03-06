import { createHmac } from 'crypto';

export interface BybitCredentials {
  apiKey: string;
  apiSecret: string;
}

const BYBIT_BASE = 'https://api.bybit.com';

function sign(timestamp: string, apiKey: string, recvWindow: string, queryString: string, secret: string): string {
  const prehash = timestamp + apiKey + recvWindow + queryString;
  return createHmac('sha256', secret).update(prehash).digest('hex');
}

function headers(creds: BybitCredentials, queryString = '') {
  const ts = Date.now().toString();
  const recvWindow = '5000';
  return {
    'X-BAPI-API-KEY': creds.apiKey,
    'X-BAPI-SIGN': sign(ts, creds.apiKey, recvWindow, queryString, creds.apiSecret),
    'X-BAPI-TIMESTAMP': ts,
    'X-BAPI-RECV-WINDOW': recvWindow,
    'Content-Type': 'application/json',
  };
}

export async function getBybitBalance(creds: BybitCredentials): Promise<number> {
  const qs = 'accountType=UNIFIED';
  const res = await fetch(`${BYBIT_BASE}/v5/account/wallet-balance?${qs}`, {
    headers: headers(creds, qs),
  });
  if (!res.ok) throw new Error(`Bybit API error: ${await res.text()}`);
  const data = await res.json();
  if (data.retCode !== 0) throw new Error(`Bybit error: ${data.retMsg}`);
  const account = data.result?.list?.[0];
  return parseFloat(account?.totalEquity || '0');
}

export async function getBybitPositions(creds: BybitCredentials) {
  const qs = 'category=linear&settleCoin=USDT';
  const res = await fetch(`${BYBIT_BASE}/v5/position/list?${qs}`, {
    headers: headers(creds, qs),
  });
  if (!res.ok) throw new Error(`Bybit API error: ${await res.text()}`);
  const data = await res.json();
  if (data.retCode !== 0) throw new Error(`Bybit error: ${data.retMsg}`);
  return (data.result?.list || []).filter((p: any) => parseFloat(p.size) !== 0).map((p: any) => ({
    symbol: p.symbol,
    side: p.side === 'Buy' ? 'LONG' : 'SHORT',
    positionAmt: p.side === 'Buy' ? p.size : `-${p.size}`,
    entryPrice: p.avgPrice,
    markPrice: p.markPrice,
    unRealizedProfit: p.unrealisedPnl,
    leverage: p.leverage,
    liquidationPrice: p.liqPrice || '0',
  }));
}
