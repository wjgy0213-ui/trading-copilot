'use client';

import { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { getAccount } from '@/lib/storage';
import { closePosition, calculatePnL } from '@/lib/tradingEngine';
import { Trade } from '@/lib/types';

interface PositionsPanelProps {
  currentPrice: number;
  onPositionClosed: () => void;
}

export default function PositionsPanel({ currentPrice, onPositionClosed }: PositionsPanelProps) {
  const [positions, setPositions] = useState<Trade[]>([]);

  useEffect(() => {
    const account = getAccount();
    setPositions(account.positions);
  }, [currentPrice]);

  const handleClose = (tradeId: string) => {
    const confirmed = confirm('确定要平仓吗？');
    if (!confirmed) return;

    const result = closePosition(tradeId, currentPrice);
    alert(result.message);
    
    const account = getAccount();
    setPositions(account.positions);
    onPositionClosed();
  };

  if (positions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">当前持仓</h2>
        <div className="text-center text-gray-500 py-8">
          暂无持仓
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">当前持仓 ({positions.length})</h2>
      
      <div className="space-y-4">
        {positions.map((position) => {
          const unrealizedPnL = calculatePnL(position, currentPrice);
          const unrealizedPnLPercent = (unrealizedPnL / position.size) * 100;
          const isProfitable = unrealizedPnL >= 0;

          return (
            <div
              key={position.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      position.side === 'long'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {position.side === 'long' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {position.side === 'long' ? '做多' : '做空'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {position.leverage}x 杠杆
                  </div>
                </div>
                
                <button
                  onClick={() => handleClose(position.id)}
                  className="text-gray-400 hover:text-white transition"
                  title="平仓"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-400">入场价格</div>
                  <div className="font-semibold">${position.entryPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">当前价格</div>
                  <div className="font-semibold">${currentPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">投入金额</div>
                  <div className="font-semibold">${position.size.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">未实现盈亏</div>
                  <div className={`font-semibold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfitable ? '+' : ''}${unrealizedPnL.toFixed(2)}
                    <span className="text-xs ml-1">
                      ({unrealizedPnLPercent >= 0 ? '+' : ''}{unrealizedPnLPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {(position.stopLoss || position.takeProfit) && (
                <div className="pt-3 border-t border-gray-600">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {position.stopLoss && (
                      <div>
                        <span className="text-gray-400">止损: </span>
                        <span className="text-red-400 font-semibold">
                          ${position.stopLoss.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {position.takeProfit && (
                      <div>
                        <span className="text-gray-400">止盈: </span>
                        <span className="text-green-400 font-semibold">
                          ${position.takeProfit.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3">
                <button
                  onClick={() => handleClose(position.id)}
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    isProfitable
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  平仓
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
