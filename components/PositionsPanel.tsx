'use client';

import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { getAccount } from '@/lib/storage';
import { closePosition, calculatePnL } from '@/lib/tradingEngine';
import { Trade } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { formatLocaleCurrency, formatLocaleNumber, formatSignedLocaleCurrency, formatSignedLocalePercent } from '@/lib/i18n-helpers';

interface PositionsPanelProps {
  currentPrice: number;
  onPositionClosed: () => void;
}

export default function PositionsPanel({ currentPrice, onPositionClosed }: PositionsPanelProps) {
  const { t, locale } = useI18n();
  const positions: Trade[] = getAccount().positions;

  const formatCount = (value: number) => formatLocaleNumber(value, locale);
  const formatMoney = (value: number) => formatLocaleCurrency(value, locale, 'USD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleClose = (tradeId: string) => {
    const confirmed = confirm(t('positions.confirm_close'));
    if (!confirmed) return;

    const result = closePosition(tradeId, currentPrice, locale);
    alert(result.message);
    
    onPositionClosed();
  };

  if (positions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">{t('positions.title')}</h2>
        <div className="text-center text-gray-500 py-8">
          {t('positions.no_positions')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">{t('positions.titleWithCount').replace('{count}', formatCount(positions.length))}</h2>
      
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
                    {position.side === 'long' ? t('positions.long') : t('positions.short')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {position.leverage}x {t('positions.leverage')}
                  </div>
                </div>
                
                <button
                  onClick={() => handleClose(position.id)}
                  className="text-gray-400 hover:text-white transition"
                  title={t('positions.close')}
                  aria-label={t('positions.close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-400">{t('positions.entry_price')}</div>
                  <div className="font-semibold">{formatMoney(position.entryPrice)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">{t('positions.current_price')}</div>
                  <div className="font-semibold">{formatMoney(currentPrice)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">{t('positions.invested')}</div>
                  <div className="font-semibold">{formatMoney(position.size)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">{t('positions.unrealized_pnl')}</div>
                  <div className={`font-semibold ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                    {formatSignedLocaleCurrency(unrealizedPnL, locale, 'USD', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-xs ml-1">
                      ({formatSignedLocalePercent(unrealizedPnLPercent, locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })})
                    </span>
                  </div>
                </div>
              </div>

              {(position.stopLoss || position.takeProfit) && (
                <div className="pt-3 border-t border-gray-600">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {position.stopLoss && (
                      <div>
                        <span className="text-gray-400">{t('positions.stop_loss')}: </span>
                        <span className="text-red-400 font-semibold">
                          {formatMoney(position.stopLoss)}
                        </span>
                      </div>
                    )}
                    {position.takeProfit && (
                      <div>
                        <span className="text-gray-400">{t('positions.take_profit')}: </span>
                        <span className="text-green-400 font-semibold">
                          {formatMoney(position.takeProfit)}
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
                  {t('positions.close')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
