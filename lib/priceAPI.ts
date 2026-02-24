// 价格API - 加密货币(CoinGecko) + 股票(模拟)

import { PriceData, TradingPair, TRADING_PAIRS } from './types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// 股票实时价格 — Twelve Data免费API（CORS友好，8/min免费额度）
const TWELVE_API = 'https://api.twelvedata.com';
const TWELVE_KEY = 'demo'; // demo key: 8 calls/min, 800/day

// 缓存30秒避免超额
const stockCache: Record<string, { price: number; change: number; ts: number }> = {};
const STOCK_FALLBACKS: Record<string, number> = {
  'AAPL': 178, 'MSFT': 415, 'GOOGL': 175, 'AMZN': 185,
  'NVDA': 130, 'META': 590, 'TSLA': 180,
};

/** 获取指定交易对价格 */
export async function getPrice(pair: TradingPair = 'BTC/USD'): Promise<PriceData> {
  const config = TRADING_PAIRS[pair];
  
  // 股票：Twelve Data API（支持CORS）
  if (config.category === 'stock') {
    const cached = stockCache[config.id];
    if (cached && Date.now() - cached.ts < 30000) {
      return { symbol: pair, price: cached.price, timestamp: cached.ts, change24h: cached.change };
    }
    try {
      const res = await fetch(
        `${TWELVE_API}/quote?symbol=${config.id}&apikey=${TWELVE_KEY}`
      );
      if (!res.ok) throw new Error('Twelve Data failed');
      const data = await res.json();
      if (data.code) throw new Error(data.message); // API error
      const price = parseFloat(data.close);
      const prevClose = parseFloat(data.previous_close);
      const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
      stockCache[config.id] = { price, change, ts: Date.now() };
      return { symbol: pair, price, timestamp: Date.now(), change24h: change };
    } catch {
      const base = cached?.price || STOCK_FALLBACKS[config.id] || 100;
      return { symbol: pair, price: base, timestamp: Date.now(), change24h: cached?.change || 0 };
    }
  }
  
  // 加密货币使用CoinGecko
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${config.id}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) throw new Error('Failed to fetch price');
    
    const data = await response.json();
    const coinData = data[config.id];
    
    return {
      symbol: pair,
      price: coinData.usd,
      timestamp: Date.now(),
      change24h: coinData.usd_24h_change || 0,
    };
  } catch (error) {
    console.error(`Error fetching ${pair} price:`, error);
    const fallbacks: Partial<Record<TradingPair, number>> = {
      'BTC/USD': 65000, 'ETH/USD': 1900, 'SOL/USD': 80,
      'BNB/USD': 600, 'XRP/USD': 0.55, 'DOGE/USD': 0.08,
      'ADA/USD': 0.35, 'AVAX/USD': 22, 'LINK/USD': 15, 'DOT/USD': 5,
    };
    const base = fallbacks[pair] || 100;
    return {
      symbol: pair,
      price: base + (Math.random() - 0.5) * base * 0.01,
      timestamp: Date.now(),
      change24h: (Math.random() - 0.5) * 10,
    };
  }
}

/** 向后兼容 */
export async function getBTCPrice(): Promise<PriceData> {
  return getPrice('BTC/USD');
}

/** 实时价格流 */
export class PriceStream {
  private intervalId?: NodeJS.Timeout;
  private listeners: Array<(price: PriceData) => void> = [];
  private pair: TradingPair = 'BTC/USD';

  /** 设置交易对 */
  setPair(pair: TradingPair): void {
    this.pair = pair;
  }

  /** 开始价格更新 */
  start(intervalMs: number = 5000): void {
    this.intervalId = setInterval(async () => {
      const price = await getPrice(this.pair);
      this.listeners.forEach(listener => listener(price));
    }, intervalMs);
  }

  /** 订阅价格更新 */
  subscribe(listener: (price: PriceData) => void): void {
    this.listeners.push(listener);
  }

  /** 取消订阅 */
  unsubscribe(listener: (price: PriceData) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /** 停止价格更新 */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
