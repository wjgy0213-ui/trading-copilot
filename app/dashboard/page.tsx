'use client';

import { ITCIndicators, getRiskColor, getRiskBgColor, getRiskLabel } from '@/lib/mockData';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ITC 风险仪表盘
          </h1>
          <p className="text-gray-400">实时监控市场风险指标，把握入场时机</p>
        </div>

        {/* Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ITCIndicators.map((indicator) => {
            const percentage = Math.round(indicator.value * 100);
            const isUptrend = indicator.history[indicator.history.length - 1].value > indicator.history[indicator.history.length - 7].value;
            
            return (
              <div
                key={indicator.id}
                className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{indicator.name}</h3>
                    <p className="text-xs text-gray-500">{indicator.nameEn}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${getRiskBgColor(indicator.value)}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                </div>

                {/* Value Display */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className={`text-4xl font-mono font-bold ${getRiskColor(indicator.value)}`}>
                      {percentage}
                    </span>
                    <span className="text-gray-500 text-sm">/100</span>
                    <div className={`flex items-center gap-1 text-xs ${isUptrend ? 'text-red-400' : 'text-green-400'}`}>
                      {isUptrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isUptrend ? '上升' : '下降'}
                    </div>
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRiskBgColor(indicator.value)}`}>
                    {getRiskLabel(indicator.value, 'zh')}
                  </div>
                </div>

                {/* Sparkline */}
                <div className="h-16 -mx-2 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={indicator.history}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={indicator.value < 0.3 ? '#4ade80' : indicator.value < 0.7 ? '#facc15' : '#f87171'}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={300}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      indicator.value < 0.3 ? 'bg-green-500' : indicator.value < 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed">{indicator.description}</p>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-blue-950/20 border border-blue-800/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-1">如何使用 ITC 指标</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                <span className="text-green-400 font-medium">低风险（0-30）</span>：适合建仓，市场处于底部区域 • 
                <span className="text-yellow-400 font-medium ml-2">中风险（30-70）</span>：谨慎操作，观望为主 • 
                <span className="text-red-400 font-medium ml-2">高风险（70-100）</span>：建议减仓，市场过热
              </p>
              <p className="text-xs text-gray-600 mt-2">
                * 数据每4小时更新一次，仅供参考，不构成投资建议
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
