'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Target, Zap } from 'lucide-react';
import { PriceData, TradingPair, TRADING_PAIRS } from '@/lib/types';
import { getPrice, PriceStream } from '@/lib/priceAPI';
import { getAccount } from '@/lib/storage';
import { calculateEquity, checkStopLossAndTakeProfit } from '@/lib/tradingEngine';
import TradingPanel from '@/components/TradingPanel';
import PositionsPanel from '@/components/PositionsPanel';
import AccountPanel from '@/components/AccountPanel';

export default function TradePage() {
  const [activePair, setActivePair] = useState<TradingPair>('BTC/USD');
  const [price, setPrice] = useState<PriceData | null>(null);
  const [account, setAccount] = useState(getAccount());
  const [loading, setLoading] = useState(true);

  // 初始化价格
  useEffect(() => {
    const initPrice = async () => {
      const initialPrice = await getPrice(activePair);
      setPrice(initialPrice);
      setLoading(false);
    };
    initPrice();

    // 启动价格更新流
    const priceStream = new PriceStream();
    priceStream.subscribe((newPrice) => {
      setPrice(newPrice);
      
      // 检查止损止盈
      const account = getAccount();
      const messages = checkStopLossAndTakeProfit(account, newPrice.price);
      if (messages.length > 0) {
        messages.forEach(msg => alert(msg));
        setAccount(getAccount());
      }
    });
    priceStream.start(10000); // 每10秒更新一次

    return () => {
      priceStream.stop();
    };
  }, []);

  // 刷新账户
  const refreshAccount = () => {
    setAccount(getAccount());
  };

  if (loading || !price) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  const equity = calculateEquity(account, price.price);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link href="/history" className="text-gray-400 hover:text-white transition">
                交易历史
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Price Ticker */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {(Object.keys(TRADING_PAIRS) as TradingPair[]).map((pair) => (
                  <button
                    key={pair}
                    onClick={() => { setActivePair(pair); setLoading(true); }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      activePair === pair 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {TRADING_PAIRS[pair].icon} {pair.split('/')[0]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">
                  ${price.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${price.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {price.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div>
                <div className="text-sm text-gray-400">账户余额</div>
                <div className="text-xl font-semibold text-blue-400">
                  ${account.balance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">总权益</div>
                <div className={`text-xl font-semibold ${equity >= 500 ? 'text-green-400' : 'text-red-400'}`}>
                  ${equity.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">总盈亏</div>
                <div className={`text-xl font-semibold ${account.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {account.totalPnl >= 0 ? '+' : ''}${account.totalPnl.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Trading Panel */}
          <div className="lg:col-span-2">
            <TradingPanel currentPrice={price.price} onTradeComplete={refreshAccount} />
            <div className="mt-6">
              <PositionsPanel currentPrice={price.price} onPositionClosed={refreshAccount} />
            </div>
          </div>
          
          {/* Right: Account Info */}
          <div>
            <AccountPanel account={account} currentPrice={price.price} />
          </div>
        </div>
      </div>
    </div>
  );
}
