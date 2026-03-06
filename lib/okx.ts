import { createHmac } from 'crypto';

export interface OKXCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
}

const OKX_BASE = 'https://www.okx.com';

function sign(timestamp: string, method: string, path: string, body: string, secret: string): string {
  const prehash = timestamp + method + path + body;
  return createHmac('sha256', secret).update(prehash).digest('base64');
}

function headers(creds: OKXCredentials, method: string, path: string, body = '') {
  const ts = new Date().toISOString();
  return {
    'OK-ACCESS-KEY': creds.apiKey,
    'OK-ACCESS-SIGN': sign(ts, method, path, body, creds.apiSecret),
    'OK-ACCESS-TIMESTAMP': ts,
    'OK-ACCESS-PASSPHRASE': creds.passphrase,
    'Content-Type': 'application/json',
  };
}

export async function getOKXBalance(creds: OKXCredentials): Promise<number> {
  const path = '/api/v5/account/balance';
  const res = await fetch(`${OKX_BASE}${path}`, {
    headers: headers(creds, 'GET', path),
  });
  if (!res.ok) throw new Error(`OKX API error: ${await res.text()}`);
  const data = await res.json();
  if (data.code !== '0') throw new Error(`OKX error: ${data.msg}`);
  const details = data.data?.[0];
  return parseFloat(details?.totalEq || '0');
}

export async function getOKXPositions(creds: OKXCredentials) {
  const path = '/api/v5/account/positions';
  const res = await fetch(`${OKX_BASE}${path}`, {
    headers: headers(creds, 'GET', path),
  });
  if (!res.ok) throw new Error(`OKX API error: ${await res.text()}`);
  const data = await res.json();
  if (data.code !== '0') throw new Error(`OKX error: ${data.msg}`);
  return (data.data || []).filter((p: any) => parseFloat(p.pos) !== 0).map((p: any) => ({
    symbol: p.instId,
    side: p.posSide === 'long' ? 'LONG' : p.posSide === 'short' ? 'SHORT' : (parseFloat(p.pos) > 0 ? 'LONG' : 'SHORT'),
    positionAmt: p.pos,
    entryPrice: p.avgPx,
    markPrice: p.markPx || p.last,
    unRealizedProfit: p.upl,
    leverage: p.lever,
    liquidationPrice: p.liqPx || '0',
  }));
}
