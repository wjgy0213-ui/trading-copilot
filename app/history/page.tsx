'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Star, Clock } from 'lucide-react';
import { getAccount, getAIScores } from '@/lib/storage';
import { Trade, AIScore } from '@/lib/types';
import EquityCurve from '@/components/EquityCurve';
import { useI18n } from '@/lib/i18n';
import { formatLocaleCurrency, formatLocaleDateTime, formatLocaleNumber, formatSignedLocaleCurrency, formatSignedLocalePercent } from '@/lib/i18n-helpers';

export default function HistoryPage() {
  const { t, locale } = useI18n();
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [aiScores, setAIScores] = useState<Record<string, AIScore>>({});

  useEffect(() => {
    const account = getAccount();
    setClosedTrades(account.closedTrades.reverse());
    setAIScores(getAIScores());
  }, []);

  const formatTradeCurrency = (value: number, digits = 2) => formatLocaleCurrency(value, locale, 'USD', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  const formatTradePercent = (value: number, digits = 2) => formatSignedLocalePercent(value, locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  if (closedTrades.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <Link href="/trade" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
              <span>{t('history.back_to_trade')}</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-gray-500 text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-4">{t('history.no_trades')}</h2>
            <p className="text-gray-400 mb-8">{t('history.no_trades_desc')}</p>
            <Link
              href="/trade"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              {t('history.go_trade')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/trade" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
            <span>{t('history.back_to_trade')}</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('history.heading')}</h1>

        {/* Equity Curve */}
        <div className="mb-8">
          <EquityCurve trades={closedTrades} initialBalance={500} />
        </div>

        {/* Stats Summary */}
        {(() => {
          const wins = closedTrades.filter(t => (t.pnl || 0) > 0).length;
          const losses = closedTrades.filter(t => (t.pnl || 0) <= 0).length;
          const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
          const winRate = closedTrades.length > 0 ? (wins / closedTrades.length * 100) : 0;
          const avgWin = wins > 0 ? closedTrades.filter(t => (t.pnl || 0) > 0).reduce((s, t) => s + (t.pnl || 0), 0) / wins : 0;
          const avgLoss = losses > 0 ? Math.abs(closedTrades.filter(t => (t.pnl || 0) <= 0).reduce((s, t) => s + (t.pnl || 0), 0) / losses) : 0;
          const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
          const scores = closedTrades.map(t => aiScores[t.id]?.entryScore).filter(Boolean) as number[];
          const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold">{closedTrades.length}</div>
                <div className="text-xs text-gray-400">{t('history.total_trades')}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatLocaleNumber(winRate, locale, { maximumFractionDigits: 0 })}%
                </div>
                <div className="text-xs text-gray-400">{t('history.win_rate')} ({t('history.wins_losses').replace('{wins}', formatLocaleNumber(wins, locale)).replace('{losses}', formatLocaleNumber(losses, locale))})</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatSignedLocaleCurrency(totalPnl, locale, 'USD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-400">{t('history.total_pnl')}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-green-400">{formatTradeCurrency(avgWin)}</div>
                <div className="text-xs text-gray-400">{t('history.avg_win')}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-red-400">{formatTradeCurrency(avgLoss)}</div>
                <div className="text-xs text-gray-400">{t('history.avg_loss')}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className={`text-2xl font-bold ${avgScore >= 70 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {avgScore > 0 ? formatLocaleNumber(avgScore, locale, { maximumFractionDigits: 0 }) : t('common.noData')}
                </div>
                <div className="text-xs text-gray-400">{t('history.avg_ai_score')}</div>
              </div>
            </div>
          );
        })()}

        <div className="space-y-4">
          {closedTrades.map((trade) => {
            const score = aiScores[trade.id];
            const isProfitable = (trade.pnl || 0) >= 0;

            return (
              <div
                key={trade.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                        trade.side === 'long'
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {trade.side === 'long' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {trade.side === 'long' ? t('history.long') : t('history.short')}
                    </div>
                    <span className="text-gray-400 text-sm">
                      {t('history.leverage_value').replace('{value}', formatLocaleNumber(trade.leverage, locale, { maximumFractionDigits: 0 }))}
                    </span>
                  </div>

                  {score && (
                    <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        {t('history.ai_score_value').replace('{score}', formatLocaleNumber(score.entryScore, locale, { maximumFractionDigits: 0 }))}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{t('history.entry_price')}</div>
                    <div className="font-semibold">{formatTradeCurrency(trade.entryPrice)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{t('history.exit_price')}</div>
                    <div className="font-semibold">{trade.exitPrice ? formatTradeCurrency(trade.exitPrice) : '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{t('history.invested')}</div>
                    <div className="font-semibold">{formatTradeCurrency(trade.size)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{t('history.pnl')}</div>
                    <div
                      className={`font-semibold ${
                        isProfitable ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {formatSignedLocaleCurrency(trade.pnl || 0, locale, 'USD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-xs ml-1">
                        ({formatTradePercent(trade.pnlPercent || 0)})
                      </span>
                    </div>
                  </div>
                </div>

                {(trade.stopLoss || trade.takeProfit) && (
                  <div className="flex gap-4 text-sm mb-4">
                    {trade.stopLoss && (
                      <div>
                        <span className="text-gray-400">{t('history.stop_loss')}: </span>
                        <span className="text-red-400 font-semibold">
                          {formatTradeCurrency(trade.stopLoss)}
                        </span>
                      </div>
                    )}
                    {trade.takeProfit && (
                      <div>
                        <span className="text-gray-400">{t('history.take_profit')}: </span>
                        <span className="text-green-400 font-semibold">
                          {formatTradeCurrency(trade.takeProfit)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatLocaleDateTime(trade.openedAt, locale)} -{' '}
                    {trade.closedAt ? formatLocaleDateTime(trade.closedAt, locale) : t('history.ongoing')}
                  </span>
                </div>

                {score && (
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {t('history.ai_feedback')}
                    </h3>
                    <div className="space-y-2">
                      {score.feedback.entry.map((feedback, i) => (
                        <div key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span>•</span>
                          <span>{feedback}</span>
                        </div>
                      ))}
                      {score.feedback.exit?.map((feedback, i) => (
                        <div key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span>•</span>
                          <span>{feedback}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
