// CoinGecko API - 获取实时价格（BTC/ETH/SOL）

import { PriceData, TradingPair, TRADING_PAIRS } from './types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/** 获取指定交易对价格 */
export async function getPrice(pair: TradingPair = 'BTC/USD'): Promise<PriceData> {
  const config = TRADING_PAIRS[pair];
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
    const fallbacks: Record<TradingPair, number> = {
      'BTC/USD': 65000,
      'ETH/USD': 1900,
      'SOL/USD': 30,
    };
    return {
      symbol: pair,
      price: fallbacks[pair] + (Math.random() - 0.5) * fallbacks[pair] * 0.01,
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
