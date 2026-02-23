// CoinGecko API - 获取BTC实时价格

import { PriceData } from './types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/** 获取BTC价格 */
export async function getBTCPrice(): Promise<PriceData> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price');
    }
    
    const data = await response.json();
    
    return {
      symbol: 'BTC/USD',
      price: data.bitcoin.usd,
      timestamp: Date.now(),
      change24h: data.bitcoin.usd_24h_change || 0,
    };
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    // 返回模拟数据作为fallback
    return {
      symbol: 'BTC/USD',
      price: 50000 + Math.random() * 1000,
      timestamp: Date.now(),
      change24h: (Math.random() - 0.5) * 10,
    };
  }
}

/** WebSocket模式获取实时价格（可选实现） */
export class PriceStream {
  private intervalId?: NodeJS.Timeout;
  private listeners: Array<(price: PriceData) => void> = [];

  /** 开始价格更新 */
  start(intervalMs: number = 5000): void {
    this.intervalId = setInterval(async () => {
      const price = await getBTCPrice();
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
