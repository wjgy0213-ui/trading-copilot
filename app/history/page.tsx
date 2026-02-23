'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Star, Clock } from 'lucide-react';
import { getAccount, getAIScores } from '@/lib/storage';
import { Trade, AIScore } from '@/lib/types';
import EquityCurve from '@/components/EquityCurve';

export default function HistoryPage() {
  const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
  const [aiScores, setAIScores] = useState<Record<string, AIScore>>({});

  useEffect(() => {
    const account = getAccount();
    setClosedTrades(account.closedTrades.reverse()); // 最新的在前
    setAIScores(getAIScores());
  }, []);

  if (closedTrades.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <Link href="/trade" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
              <span>返回交易</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-gray-500 text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-4">还没有交易记录</h2>
            <p className="text-gray-400 mb-8">开始你的第一笔交易，建立交易历史</p>
            <Link
              href="/trade"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              去交易
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
            <span>返回交易</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">交易历史</h1>

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
                <div className="text-xs text-gray-400">总交易</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {winRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400">胜率 ({wins}胜{losses}负)</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">总盈亏</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-green-400">${avgWin.toFixed(2)}</div>
                <div className="text-xs text-gray-400">平均盈利</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-red-400">${avgLoss.toFixed(2)}</div>
                <div className="text-xs text-gray-400">平均亏损</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
                <div className={`text-2xl font-bold ${avgScore >= 70 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {avgScore > 0 ? avgScore.toFixed(0) : '-'}
                </div>
                <div className="text-xs text-gray-400">平均AI评分</div>
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
                      {trade.side === 'long' ? '做多' : '做空'}
                    </div>
                    <span className="text-gray-400 text-sm">{trade.leverage}x 杠杆</span>
                  </div>

                  {score && (
                    <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold">
                        AI评分: {score.entryScore}/100
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">入场价格</div>
                    <div className="font-semibold">${trade.entryPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">出场价格</div>
                    <div className="font-semibold">${trade.exitPrice?.toFixed(2) || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">投入金额</div>
                    <div className="font-semibold">${trade.size.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">盈亏</div>
                    <div
                      className={`font-semibold ${
                        isProfitable ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {isProfitable ? '+' : ''}${trade.pnl?.toFixed(2) || '0.00'}
                      <span className="text-xs ml-1">
                        ({trade.pnlPercent?.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {(trade.stopLoss || trade.takeProfit) && (
                  <div className="flex gap-4 text-sm mb-4">
                    {trade.stopLoss && (
                      <div>
                        <span className="text-gray-400">止损: </span>
                        <span className="text-red-400 font-semibold">
                          ${trade.stopLoss.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {trade.takeProfit && (
                      <div>
                        <span className="text-gray-400">止盈: </span>
                        <span className="text-green-400 font-semibold">
                          ${trade.takeProfit.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(trade.openedAt).toLocaleString('zh-CN')} -{' '}
                    {trade.closedAt ? new Date(trade.closedAt).toLocaleString('zh-CN') : '进行中'}
                  </span>
                </div>

                {score && (
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      AI教练反馈
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
