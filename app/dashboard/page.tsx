'use client';

import { useState } from 'react';
import { getRiskColor, getRiskBgColor, getRiskLabel, getRiskStrokeColor, type ITCIndicator } from '@/lib/mockData';
import { useITCData } from '@/lib/useITCData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceLine } from 'recharts';
import { Activity, TrendingUp, TrendingDown, X, Maximize2, BarChart3, Globe, Link2, Wifi, WifiOff } from 'lucide-react';

function DetailModal({ indicator, onClose }: { indicator: ITCIndicator; onClose: () => void }) {
  const [range, setRange] = useState<30 | 90 | 180>(90);
  const color = getRiskStrokeColor(indicator.value);
  const data = indicator.history.slice(-range);
  const pct = Math.round(indicator.value * 100);
  const prev7 = indicator.history[indicator.history.length - 8]?.value || indicator.value;
  const change7d = ((indicator.value - prev7) / prev7 * 100).toFixed(1);
  const prev30 = indicator.history[indicator.history.length - 31]?.value || indicator.value;
  const change30d = ((indicator.value - prev30) / prev30 * 100).toFixed(1);
  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-semibold">{indicator.name}</h2>
            <p className="text-xs text-gray-500">{indicator.nameEn}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 p-5">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 mb-1">当前值</div>
            <div className={`text-2xl font-mono font-bold ${getRiskColor(indicator.value)}`}>{pct}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 mb-1">7日变化</div>
            <div className={`text-lg font-mono font-semibold ${Number(change7d) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {Number(change7d) >= 0 ? '+' : ''}{change7d}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 mb-1">30日变化</div>
            <div className={`text-lg font-mono font-semibold ${Number(change30d) >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {Number(change30d) >= 0 ? '+' : ''}{change30d}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-[10px] text-gray-500 mb-1">区间</div>
            <div className="text-sm font-mono text-gray-300">{Math.round(min*100)} — {Math.round(max*100)}</div>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex gap-1.5 px-5 mb-3">
          {([30, 90, 180] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${range === r ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800'}`}>
              {r}天
            </button>
          ))}
        </div>

        {/* Full Chart */}
        <div className="px-5 pb-3" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
              <YAxis domain={[0, 1]} tickFormatter={v => Math.round(v * 100).toString()} tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#374151" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelFormatter={v => new Date(v).toLocaleDateString('zh-CN')}
                formatter={(v: number | undefined) => [Math.round((v || 0) * 100), indicator.name]} />
              <ReferenceLine y={0.3} stroke="#34d399" strokeDasharray="5 5" strokeOpacity={0.4} />
              <ReferenceLine y={0.7} stroke="#f87171" strokeDasharray="5 5" strokeOpacity={0.4} />
              <defs>
                <linearGradient id={`grad-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${indicator.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Description */}
        <div className="px-5 pb-5">
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 leading-relaxed">{indicator.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${getRiskBgColor(indicator.value)}`}>
                {getRiskLabel(indicator.value)}
              </span>
              <span className="text-[10px] text-gray-600">分类: {indicator.category === 'crypto' ? '加密' : indicator.category === 'macro' ? '宏观' : '链上'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_TABS = [
  { id: 'all', label: '全部', icon: BarChart3 },
  { id: 'crypto', label: '加密', icon: Activity },
  { id: 'onchain', label: '链上', icon: Link2 },
  { id: 'macro', label: '宏观', icon: Globe },
] as const;

export default function DashboardPage() {
  const [selected, setSelected] = useState<ITCIndicator | null>(null);
  const [category, setCategory] = useState<string>('all');
  const { indicators: ITCIndicators, prices, loading: dataLoading, error: dataError, isLive } = useITCData();

  const filtered = category === 'all' ? ITCIndicators : ITCIndicators.filter(i => i.category === category);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-gray-100">市场仪表盘</h1>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
            {ITCIndicators.length} 个指标 · 点击查看详情
            {isLive ? <span className="inline-flex items-center gap-1 text-emerald-400"><Wifi className="w-3 h-3" />实时</span> : <span className="inline-flex items-center gap-1 text-gray-600"><WifiOff className="w-3 h-3" />模拟</span>}
            {prices && <span className="text-gray-500">BTC ${prices.BTC.toLocaleString()} · ETH ${prices.ETH.toLocaleString()}</span>}
          </p>
        </div>
        <div className="flex gap-1">
          {CATEGORY_TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                category === id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-800'
              }`}>
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: '低风险指标', count: ITCIndicators.filter(i => i.value < 0.3).length, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/20' },
          { label: '中风险指标', count: ITCIndicators.filter(i => i.value >= 0.3 && i.value < 0.7).length, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/20' },
          { label: '高风险指标', count: ITCIndicators.filter(i => i.value >= 0.7).length, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`border rounded-lg p-3 ${s.bg}`}>
            <div className="text-[10px] text-gray-500">{s.label}</div>
            <div className={`text-2xl font-mono font-bold ${s.color}`}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(indicator => {
          const pct = Math.round(indicator.value * 100);
          const color = getRiskStrokeColor(indicator.value);
          const prev = indicator.history[indicator.history.length - 8]?.value || indicator.value;
          const isUp = indicator.value > prev;

          return (
            <div key={indicator.id} onClick={() => setSelected(indicator)}
              className="border border-gray-800/50 rounded-lg p-3.5 bg-gray-900/30 hover:bg-gray-900/60 hover:border-gray-700 transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">{indicator.name}</span>
                <Maximize2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-2xl font-mono font-bold ${getRiskColor(indicator.value)}`}>{pct}</span>
                <div className={`flex items-center gap-0.5 text-[10px] ${isUp ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {isUp ? '↑' : '↓'}
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="h-10 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={indicator.history.slice(-30)}>
                    <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getRiskBgColor(indicator.value)}`}>
                  {getRiskLabel(indicator.value)}
                </span>
                <span className="text-[9px] text-gray-600">{indicator.nameEn}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-5 border border-gray-800 rounded-lg p-3 bg-gray-900/30">
        <div className="flex gap-4 text-[10px] text-gray-500 justify-center">
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />低风险(0-30): 买入区间</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />中风险(30-70): 观望区间</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />高风险(70-100): 减仓区间</span>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && <DetailModal indicator={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
