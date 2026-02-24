'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PriceData, TradingPair, TRADING_PAIRS } from '@/lib/types';
import { getPrice, PriceStream } from '@/lib/priceAPI';
import { getAccount } from '@/lib/storage';
import { calculateEquity, checkStopLossAndTakeProfit } from '@/lib/tradingEngine';
import TradingPanel from '@/components/TradingPanel';
import PositionsPanel from '@/components/PositionsPanel';
import AccountPanel from '@/components/AccountPanel';
import AICoach from '@/components/AICoach';
import PriceChart from '@/components/PriceChart';

const SYMBOL_MAP: Record<TradingPair, string> = {
  'BTC/USD': 'BINANCE:BTCUSDT',
  'ETH/USD': 'BINANCE:ETHUSDT',
  'SOL/USD': 'BINANCE:SOLUSDT',
};

export default function TradePage() {
  const [activePair, setActivePair] = useState<TradingPair>('BTC/USD');
  const [price, setPrice] = useState<PriceData | null>(null);
  const [prevPrice, setPrevPrice] = useState<number>(0);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [account, setAccount] = useState(getAccount());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPrice = async () => {
      const initialPrice = await getPrice(activePair);
      setPrice(initialPrice);
      setPrevPrice(initialPrice.price);
      setLoading(false);
    };
    initPrice();

    const priceStream = new PriceStream();
    priceStream.subscribe((newPrice) => {
      setPrice((prev) => {
        if (prev) {
          setPrevPrice(prev.price);
          if (newPrice.price > prev.price) {
            setPriceFlash('up');
          } else if (newPrice.price < prev.price) {
            setPriceFlash('down');
          }
          setTimeout(() => setPriceFlash(null), 600);
        }
        return newPrice;
      });

      const account = getAccount();
      const messages = checkStopLossAndTakeProfit(account, newPrice.price);
      if (messages.length > 0) {
        messages.forEach(msg => alert(msg));
        setAccount(getAccount());
      }
    });
    priceStream.start(8000);
    return () => priceStream.stop();
  }, [activePair]);

  const refreshAccount = () => setAccount(getAccount());

  if (loading || !price) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">加载行情数据...</span>
        </div>
      </div>
    );
  }

  const equity = calculateEquity(account, price.price);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Price Ticker Bar */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {/* Coin selector */}
              <div className="flex items-center gap-2 mb-2">
                {(Object.keys(TRADING_PAIRS) as TradingPair[]).map((pair) => (
                  <button
                    key={pair}
                    onClick={() => { setActivePair(pair); setLoading(true); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activePair === pair
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {TRADING_PAIRS[pair].icon} {pair.split('/')[0]}
                  </button>
                ))}
              </div>
              {/* Price display with flash */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-4xl font-black transition-colors duration-300 ${
                    priceFlash === 'up' ? 'text-green-400' :
                    priceFlash === 'down' ? 'text-red-400' : 'text-white'
                  }`}
                >
                  ${price.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${
                  price.change24h >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                }`}>
                  {price.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Account stats */}
            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">余额</div>
                <div className="text-xl font-bold text-blue-400">${account.balance.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">权益</div>
                <div className={`text-xl font-bold ${equity >= 500 ? 'text-green-400' : 'text-red-400'}`}>
                  ${equity.toFixed(2)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">盈亏</div>
                <div className={`text-xl font-bold ${account.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {account.totalPnl >= 0 ? '+' : ''}${account.totalPnl.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* TradingView Chart */}
        <div className="mb-6">
          <PriceChart symbol={SYMBOL_MAP[activePair]} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Trading + Positions */}
          <div className="lg:col-span-2 space-y-6">
            <TradingPanel currentPrice={price.price} onTradeComplete={refreshAccount} />
            <PositionsPanel currentPrice={price.price} onPositionClosed={refreshAccount} />
          </div>

          {/* Right: AI Coach + Account */}
          <div className="space-y-6">
            <AICoach />
            <AccountPanel account={account} currentPrice={price.price} />
          </div>
        </div>
      </div>
    </div>
  );
}
