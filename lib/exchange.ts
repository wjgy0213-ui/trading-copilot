import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.EXCHANGE_ENCRYPTION_KEY || '0'.repeat(64);

// AES-256-GCM encrypt/decrypt
export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return iv.toString('hex') + ':' + tag + ':' + encrypted;
}

export function decrypt(data: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const [ivHex, tagHex, encrypted] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Binance API signature
export function binanceSign(queryString: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

export interface ExchangeCredentials {
  exchange: 'binance' | 'okx' | 'bybit' | 'hyperliquid';
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  leverage: number;
  liquidationPrice: number;
  marginType: string;
}

// Binance Futures API
const BINANCE_FAPI = 'https://fapi.binance.com';

export async function binanceRequest(
  method: string,
  path: string,
  creds: ExchangeCredentials,
  params: Record<string, string> = {}
): Promise<unknown> {
  const timestamp = Date.now().toString();
  const allParams = { ...params, timestamp };
  const queryString = new URLSearchParams(allParams).toString();
  const signature = binanceSign(queryString, creds.apiSecret);
  const url = `${BINANCE_FAPI}${path}?${queryString}&signature=${signature}`;
  
  const res = await fetch(url, {
    method,
    headers: { 'X-MBX-APIKEY': creds.apiKey },
  });
  
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Binance API ${res.status}: ${err}`);
  }
  return res.json();
}

export async function getBalance(creds: ExchangeCredentials): Promise<{ totalBalance: number; availableBalance: number }> {
  if (creds.exchange !== 'binance') throw new Error(`${creds.exchange} not yet supported`);
  
  const data = await binanceRequest('GET', '/fapi/v2/balance', creds) as Array<{
    asset: string; balance: string; availableBalance: string;
  }>;
  const usdt = data.find(b => b.asset === 'USDT');
  return {
    totalBalance: usdt ? parseFloat(usdt.balance) : 0,
    availableBalance: usdt ? parseFloat(usdt.availableBalance) : 0,
  };
}

export async function getPositions(creds: ExchangeCredentials): Promise<Position[]> {
  if (creds.exchange !== 'binance') throw new Error(`${creds.exchange} not yet supported`);
  
  const data = await binanceRequest('GET', '/fapi/v2/positionRisk', creds) as Array<{
    symbol: string; positionAmt: string; entryPrice: string; markPrice: string;
    unRealizedProfit: string; leverage: string; liquidationPrice: string;
    marginType: string; positionSide: string;
  }>;
  
  return data
    .filter(p => parseFloat(p.positionAmt) !== 0)
    .map(p => {
      const amt = parseFloat(p.positionAmt);
      return {
        symbol: p.symbol,
        side: amt > 0 ? 'LONG' as const : 'SHORT' as const,
        size: Math.abs(amt),
        entryPrice: parseFloat(p.entryPrice),
        markPrice: parseFloat(p.markPrice),
        pnl: parseFloat(p.unRealizedProfit),
        leverage: parseInt(p.leverage),
        liquidationPrice: parseFloat(p.liquidationPrice),
        marginType: p.marginType,
      };
    });
}

export async function closePosition(creds: ExchangeCredentials, symbol: string, side: 'LONG' | 'SHORT', quantity: number) {
  if (creds.exchange !== 'binance') throw new Error(`${creds.exchange} not yet supported`);
  
  const orderSide = side === 'LONG' ? 'SELL' : 'BUY';
  const data = await binanceRequest('POST', '/fapi/v1/order', creds, {
    symbol,
    side: orderSide,
    type: 'MARKET',
    quantity: quantity.toString(),
    reduceOnly: 'true',
  });
  return data;
}

export type RiskLevel = 'green' | 'yellow' | 'red';

export interface RiskAssessment {
  status: RiskLevel;
  positionRisk: { value: number; level: RiskLevel };
  dailyLoss: { value: number; level: RiskLevel };
  maxLeverage: { value: number; level: RiskLevel };
  positions: Position[];
  balance: number;
}

function riskLevel(value: number, yellow: number, red: number): RiskLevel {
  if (value >= red) return 'red';
  if (value >= yellow) return 'yellow';
  return 'green';
}

export async function assessRisk(creds: ExchangeCredentials): Promise<RiskAssessment> {
  const [positions, balanceInfo] = await Promise.all([
    getPositions(creds),
    getBalance(creds),
  ]);
  
  const balance = balanceInfo.totalBalance;
  
  // Single position risk (max)
  const maxPosRisk = positions.length > 0
    ? Math.max(...positions.map(p => Math.abs(p.pnl) / (balance || 1) * 100))
    : 0;
  
  // Max leverage
  const maxLev = positions.length > 0
    ? Math.max(...positions.map(p => p.leverage))
    : 0;
  
  // Daily loss (simplified — sum of negative PnL)
  const dailyLoss = positions
    .filter(p => p.pnl < 0)
    .reduce((sum, p) => sum + Math.abs(p.pnl), 0);
  const dailyLossPct = (dailyLoss / (balance || 1)) * 100;
  
  const posRisk = riskLevel(maxPosRisk, 3, 5);
  const dayRisk = riskLevel(dailyLossPct, 5, 8);
  const levRisk = riskLevel(maxLev, 10, 20);
  
  // Overall = worst of all
  const overall: RiskLevel = [posRisk, dayRisk, levRisk].includes('red') ? 'red'
    : [posRisk, dayRisk, levRisk].includes('yellow') ? 'yellow' : 'green';
  
  return {
    status: overall,
    positionRisk: { value: maxPosRisk, level: posRisk },
    dailyLoss: { value: dailyLossPct, level: dayRisk },
    maxLeverage: { value: maxLev, level: levRisk },
    positions,
    balance,
  };
}
