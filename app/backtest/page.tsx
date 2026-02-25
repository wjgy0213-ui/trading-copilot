'use client';

import { useState } from 'react';
import { runBacktest, STRATEGIES, ASSETS, TIMEFRAMES, PERIODS, BacktestResult, Strategy } from '@/lib/backtestEngine';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Zap, Target, TrendingDown, DollarSign } from 'lucide-react';

export default function BacktestPage() {
  const [strategy, setStrategy] = useState<Strategy>('ema-cross');
  const [asset, setAsset] = useState('BTC');
  const [timeframe, setTimeframe] = useState('4h');
  const [period, setPeriod] = useState(90);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    setIsLoading(true);
    try {
      const backtestResult = await runBacktest(strategy, asset, timeframe, period);
      setResult(backtestResult);
    } catch (error) {
      console.error('Backtest failed:', error);
      alert('回测失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            策略回测引擎
          </h1>
          <p className="text-gray-400">选择策略和参数，一键回测历史表现</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Settings */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                回测参数
              </h2>

              {/* Strategy Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">选择策略</label>
                <div className="space-y-2">
                  {STRATEGIES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStrategy(s.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        strategy === s.id
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{s.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">选择币种</label>
                <div className="grid grid-cols-3 gap-2">
                  {ASSETS.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAsset(a.id)}
                      className={`p-3 rounded-lg border font-medium transition-all ${
                        asset === a.id
                          ? 'bg-purple-600/20 border-purple-500/50 text-purple-400'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {a.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeframe Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">时间框架</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIMEFRAMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTimeframe(t.id)}
                      className={`p-3 rounded-lg border font-medium transition-all ${
                        timeframe === t.id
                          ? 'bg-green-600/20 border-green-500/50 text-green-400'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">回测周期</label>
                <div className="grid grid-cols-3 gap-2">
                  {PERIODS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPeriod(p.id)}
                      className={`p-3 rounded-lg border font-medium transition-all ${
                        period === p.id
                          ? 'bg-orange-600/20 border-orange-500/50 text-orange-400'
                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Run Button */}
              <button
                onClick={handleRunBacktest}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    运行中...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    运行回测
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-2">
            {!result && (
              <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-12 text-center">
                <Target className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">选择参数后点击"运行回测"查看结果</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <TrendingUp className="w-4 h-4" />
                      胜率
                    </div>
                    <div className={`text-2xl font-mono font-bold ${result.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {result.winRate.toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <Target className="w-4 h-4" />
                      盈亏比
                    </div>
                    <div className={`text-2xl font-mono font-bold ${result.profitLossRatio >= 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {result.profitLossRatio.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <TrendingDown className="w-4 h-4" />
                      最大回撤
                    </div>
                    <div className="text-2xl font-mono font-bold text-red-400">
                      {result.maxDrawdown.toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <DollarSign className="w-4 h-4" />
                      总收益
                    </div>
                    <div className={`text-2xl font-mono font-bold ${result.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Equity Curve */}
                <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">资金曲线</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.equityCurve}>
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(ts) => new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => `$${value.toFixed(0)}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                          labelFormatter={(ts) => new Date(ts).toLocaleString('zh-CN')}
                          formatter={(value: any) => [`$${value.toFixed(2)}`, '资金']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="equity"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                          name="资金"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trade List */}
                <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">交易记录（最近10笔）</h3>
                  <div className="space-y-2">
                    {result.trades.slice(-10).reverse().map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.type === 'buy' ? '买入' : '卖出'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(trade.timestamp).toLocaleString('zh-CN')}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-mono">${trade.price.toFixed(2)}</div>
                          {trade.pnl !== undefined && (
                            <div className={`text-sm font-mono font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercent?.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
