'use client';

import { useState, useCallback } from 'react';
import { STRATEGY_TEMPLATES, TIMEFRAMES, SYMBOLS, BACKTEST_PERIODS, DEFAULT_RISK } from '@/lib/strategies';
import { runBacktest, BacktestResult, BacktestConfig } from '@/lib/backtestEngine';
import { optimize, OptResult } from '@/lib/optimizer';
import Paywall from '@/components/Paywall';
import { ChevronDown, ChevronRight, Play, Trash2, BarChart3, Layers, Search } from 'lucide-react';

function EquityCurve({ data, color = '#10b981', height = 200, compareData }: {
  data: { time: number; equity: number }[]; color?: string; height?: number;
  compareData?: { data: { time: number; equity: number }[]; color: string; name: string }[];
}) {
  if (data.length < 2) return null;
  const allEquities = [data, ...(compareData?.map(c => c.data) || [])].flat().map(d => d.equity);
  const minE = Math.min(...allEquities) * 0.99, maxE = Math.max(...allEquities) * 1.01;
  const w = 800;
  const toPath = (d: { time: number; equity: number }[]) =>
    d.map((pt, i) => {
      const x = (i / (d.length - 1)) * w;
      const y = height - ((pt.equity - minE) / (maxE - minE)) * (height - 20);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map(pct => {
          const y = height - pct * (height - 20);
          return <g key={pct}><line x1="0" y1={y} x2={w} y2={y} stroke="#1f2937" strokeWidth="1" /><text x="5" y={y-4} fill="#6b7280" fontSize="10">${(minE + pct * (maxE - minE)).toFixed(0)}</text></g>;
        })}
        {compareData?.map((cd, idx) => <path key={idx} d={toPath(cd.data)} fill="none" stroke={cd.color} strokeWidth="1.5" opacity="0.6" />)}
        <defs><linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        <path d={`${toPath(data)} L${w},${height} L0,${height} Z`} fill="url(#eqGrad)" />
        <path d={toPath(data)} fill="none" stroke={color} strokeWidth="2" />
      </svg>
      {compareData && compareData.length > 0 && (
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{background: color}} />当前</span>
          {compareData.map((cd, i) => <span key={i} className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{background: cd.color}} />{cd.name}</span>)}
        </div>
      )}
    </div>
  );
}

function MonthlyHeatmap({ data }: { data: { month: string; returnPct: number }[] }) {
  if (data.length === 0) return null;
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
      {data.map(d => (
        <div key={d.month} className={`rounded-lg p-2 text-center text-xs ${d.returnPct > 0 ? 'bg-green-600/20 text-green-400' : d.returnPct < 0 ? 'bg-red-600/20 text-red-400' : 'bg-gray-800 text-gray-500'}`}>
          <div className="text-[10px] text-gray-500 mb-0.5">{d.month}</div>
          <div className="font-mono font-bold">{d.returnPct > 0 ? '+' : ''}{d.returnPct.toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-3">
      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-mono font-bold ${color || 'text-white'}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function TradeTable({ trades }: { trades: BacktestResult['trades'] }) {
  const [show, setShow] = useState(false);
  if (trades.length === 0) return null;
  return (
    <div>
      <button onClick={() => setShow(!show)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition mb-2">
        {show ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        交易明细（{trades.length}笔）
      </button>
      {show && (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-950"><tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-2">时间</th><th className="text-left py-2 px-2">方向</th>
              <th className="text-right py-2 px-2">入场</th><th className="text-right py-2 px-2">出场</th>
              <th className="text-right py-2 px-2">盈亏</th><th className="text-right py-2 px-2">盈亏%</th>
              <th className="text-left py-2 px-2">原因</th>
            </tr></thead>
            <tbody>{trades.map((t, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-1.5 px-2 text-gray-400">{new Date(t.entryTime).toLocaleDateString()}</td>
                <td className="py-1.5 px-2"><span className={t.direction === 'long' ? 'text-green-400' : 'text-red-400'}>{t.direction === 'long' ? '多' : '空'}</span></td>
                <td className="py-1.5 px-2 text-right font-mono text-gray-300">${t.entryPrice.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right font-mono text-gray-300">${t.exitPrice.toFixed(2)}</td>
                <td className={`py-1.5 px-2 text-right font-mono ${t.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>{t.pnl > 0 ? '+' : ''}${t.pnl.toFixed(2)}</td>
                <td className={`py-1.5 px-2 text-right font-mono ${t.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>{t.pnlPercent > 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%</td>
                <td className="py-1.5 px-2 text-gray-500">{t.exitReason === 'stopLoss' ? '止损' : t.exitReason === 'takeProfit' ? '止盈' : '信号'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DrawdownChart({ data }: { data: { time: number; equity: number }[] }) {
  if (data.length < 2) return null;
  const drawdowns: number[] = [];
  let peak = data[0].equity;
  for (const pt of data) {
    if (pt.equity > peak) peak = pt.equity;
    drawdowns.push(((pt.equity - peak) / peak) * 100);
  }
  const minDD = Math.min(...drawdowns);
  if (minDD >= 0) return null;
  const w = 800, h = 100;
  const toPath = drawdowns.map((dd, i) => {
    const x = (i / (drawdowns.length - 1)) * w;
    const y = (dd / minDD) * (h - 10);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <line x1="0" y1="0" x2={w} y2="0" stroke="#374151" strokeWidth="1" />
        <text x="5" y="12" fill="#6b7280" fontSize="9">0%</text>
        <text x="5" y={h - 4} fill="#6b7280" fontSize="9">{minDD.toFixed(1)}%</text>
        <defs>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={`${toPath} L${w},0 L0,0 Z`} fill="url(#ddGrad)" />
        <path d={toPath} fill="none" stroke="#ef4444" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function TradeScatter({ trades }: { trades: BacktestResult['trades'] }) {
  if (trades.length === 0) return null;
  const maxAbs = Math.max(...trades.map(t => Math.abs(t.pnl)), 1);
  const w = 800, h = 150;
  const midY = h / 2;
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <line x1="0" y1={midY} x2={w} y2={midY} stroke="#374151" strokeWidth="1" strokeDasharray="4,4" />
        <text x="5" y={midY - 4} fill="#6b7280" fontSize="9">$0</text>
        {trades.map((t, i) => {
          const x = (i / Math.max(trades.length - 1, 1)) * (w - 20) + 10;
          const y = midY - (t.pnl / maxAbs) * (midY - 10);
          return (
            <circle key={i} cx={x} cy={y} r="3"
              fill={t.pnl > 0 ? '#10b981' : '#ef4444'} opacity="0.7" />
          );
        })}
      </svg>
    </div>
  );
}

function calcScore(r: BacktestResult): number {
  let score = 0;
  if (r.sharpeRatio > 2) score += 40;
  else if (r.sharpeRatio > 1) score += 25;
  else if (r.sharpeRatio > 0) score += 10;
  if (r.winRate > 60) score += 25;
  else if (r.winRate > 50) score += 15;
  if (r.profitFactor > 2) score += 25;
  else if (r.profitFactor > 1.5) score += 15;
  if (r.maxDrawdownPercent < 5) score += 25;
  else if (r.maxDrawdownPercent < 10) score += 15;
  return Math.min(score, 100);
}

function CompareTable({ results }: { results: BacktestResult[] }) {
  if (results.length < 2) return null;
  const colors = ['#10b981', '#3b82f6', '#f59e0b'];
  const metrics = [
    { label: '总收益', fn: (r: BacktestResult) => `${r.totalReturnPercent > 0 ? '+' : ''}${r.totalReturnPercent.toFixed(2)}%` },
    { label: '胜率', fn: (r: BacktestResult) => `${r.winRate.toFixed(1)}%` },
    { label: '盈亏比', fn: (r: BacktestResult) => r.profitFactor === Infinity ? '∞' : r.profitFactor.toFixed(2) },
    { label: '最大回撤', fn: (r: BacktestResult) => `${r.maxDrawdownPercent.toFixed(2)}%` },
    { label: '夏普比率', fn: (r: BacktestResult) => r.sharpeRatio.toFixed(2) },
    { label: '总交易', fn: (r: BacktestResult) => `${r.totalTrades}笔` },
  ];
  return (
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b border-gray-800"><th className="text-left py-2 px-3 text-gray-500">指标</th>
        {results.map((r, i) => <th key={i} className="text-right py-2 px-3"><span className="flex items-center justify-end gap-1.5"><span className="w-2 h-2 rounded-full" style={{background: colors[i]}} /><span className="text-gray-300">{STRATEGY_TEMPLATES.find(t => t.id === r.strategyName)?.name || r.strategyName}</span></span></th>)}
      </tr></thead>
      <tbody>{metrics.map(m => <tr key={m.label} className="border-b border-gray-800/50"><td className="py-2 px-3 text-gray-400">{m.label}</td>
        {results.map((r, i) => <td key={i} className="py-2 px-3 text-right font-mono text-gray-200">{m.fn(r)}</td>)}
      </tr>)}</tbody>
    </table></div>
  );
}

export default function StrategyPage() {
  const [selectedId, setSelectedId] = useState(STRATEGY_TEMPLATES[0].id);
  const selected = STRATEGY_TEMPLATES.find(t => t.id === selectedId)!;
  const [params, setParams] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {}; STRATEGY_TEMPLATES[0].params.forEach(pp => p[pp.key] = pp.default); return p;
  });
  const [symbol, setSymbol] = useState<'BTCUSDT'|'ETHUSDT'|'SOLUSDT'>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<'1h'|'4h'|'1d'>('4h');
  const [periodDays, setPeriodDays] = useState(90);
  const [capital, setCapital] = useState(10000);
  const [feeRate, setFeeRate] = useState(0.04);
  const [slippage, setSlippage] = useState(0.01);
  const [stopLoss, setStopLoss] = useState(DEFAULT_RISK.stopLoss);
  const [takeProfit, setTakeProfit] = useState(DEFAULT_RISK.takeProfit);
  const [maxPosition, setMaxPosition] = useState(DEFAULT_RISK.maxPosition);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optProgress, setOptProgress] = useState({ current: 0, total: 0 });
  const [optResults, setOptResults] = useState<OptResult[]>([]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const tmpl = STRATEGY_TEMPLATES.find(t => t.id === id)!;
    const p: Record<string, number> = {}; tmpl.params.forEach(pp => p[pp.key] = pp.default); setParams(p);
  };

  const handleRun = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const config: BacktestConfig = { strategyId: selectedId, params, symbol, timeframe, periodDays,
        initialCapital: capital, feeRate: feeRate / 100, slippage: slippage / 100, stopLoss, takeProfit, maxPosition };
      const result = await runBacktest(config);
      setResults(prev => [...prev, result].slice(-3));
    } catch (e: any) { setError(e.message || '回测失败'); }
    setLoading(false);
  }, [selectedId, params, symbol, timeframe, periodDays, capital, feeRate, slippage, stopLoss, takeProfit, maxPosition]);

  const handleOptimize = useCallback(async () => {
    setOptimizing(true); setOptResults([]);
    try {
      const baseConfig = { symbol, timeframe, periodDays, initialCapital: capital,
        feeRate: feeRate / 100, slippage: slippage / 100, stopLoss, takeProfit, maxPosition };
      const top = await optimize(selectedId, baseConfig, (c, t) => setOptProgress({ current: c, total: t }));
      setOptResults(top);
    } catch {}
    setOptimizing(false);
  }, [selectedId, symbol, timeframe, periodDays, capital, feeRate, slippage, stopLoss, takeProfit, maxPosition]);

  const latest = results.length > 0 ? results[results.length - 1] : null;
  const colors = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-emerald-400" />策略工坊</h1>
            <p className="text-sm text-gray-500 mt-1">选择策略 → 调整参数 → 回测验证</p>
          </div>
          {results.length > 0 && <button onClick={() => setResults([])} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"><Trash2 className="w-3 h-3" /> 清空</button>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Strategy Templates */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs text-gray-500 font-medium mb-2">策略模板</div>
            {STRATEGY_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => handleSelect(t.id)}
                className={`w-full text-left p-3 rounded-xl border transition ${selectedId === t.id ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'}`}>
                <div className="flex items-center gap-2"><span className="text-lg">{t.icon}</span><span className="font-medium text-sm">{t.name}</span></div>
                <p className="text-[11px] text-gray-500 mt-1">{t.description}</p>
              </button>
            ))}
          </div>

          {/* Middle: Parameters */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 font-medium mb-3">策略参数</div>
              <div className="space-y-4">
                {selected.params.map(p => (
                  <div key={p.key}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{p.label}</span><span className="font-mono text-emerald-400">{params[p.key]}{p.unit||''}</span></div>
                    <input type="range" min={p.min} max={p.max} step={p.step} value={params[p.key] ?? p.default}
                      onChange={e => setParams(prev => ({...prev, [p.key]: parseFloat(e.target.value)}))}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    <div className="flex justify-between text-[10px] text-gray-600"><span>{p.min}</span><span>{p.max}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 font-medium mb-3">市场设置</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] text-gray-500 block mb-1">币种</label>
                  <select value={symbol} onChange={e => setSymbol(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm">
                    {SYMBOLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">时间框架</label>
                  <select value={timeframe} onChange={e => setTimeframe(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm">
                    {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">回测周期</label>
                  <select value={periodDays} onChange={e => setPeriodDays(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm">
                    {BACKTEST_PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">初始资金</label>
                  <input type="number" value={capital} onChange={e => setCapital(parseInt(e.target.value)||10000)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm font-mono" /></div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 font-medium mb-3">风控参数</div>
              <div className="space-y-3">
                {[{l:'止损',v:stopLoss,s:setStopLoss,mn:1,mx:20,u:'%'},{l:'止盈',v:takeProfit,s:setTakeProfit,mn:1,mx:50,u:'%'},
                  {l:'最大仓位',v:maxPosition,s:setMaxPosition,mn:10,mx:100,u:'%'},{l:'手续费',v:feeRate,s:setFeeRate,mn:0,mx:0.2,u:'%',st:0.01},
                  {l:'滑点',v:slippage,s:setSlippage,mn:0,mx:0.1,u:'%',st:0.01}].map(r => (
                  <div key={r.l} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{r.l}</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={r.v} step={r.st||1} min={r.mn} max={r.mx} onChange={e => r.s(parseFloat(e.target.value)||0)}
                        className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-right" />
                      <span className="text-[10px] text-gray-600 w-4">{r.u}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setShowCode(!showCode)} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition">
              {showCode ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} 策略逻辑预览
            </button>
            {showCode && <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-emerald-300 font-mono whitespace-pre-wrap">{selected.pseudoCode(params)}</pre>}

            <button onClick={handleRun} disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition ${loading ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
              {loading ? <><div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" /> 计算中...</> : <><Play className="w-4 h-4" /> 运行回测</>}
            </button>
            {results.length > 0 && results.length < 3 && <p className="text-[10px] text-gray-600 text-center">切换策略再运行可对比（最多3个）</p>}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <Paywall feature="参数优化器 — 自动寻找最优策略参数">
            <button onClick={handleOptimize} disabled={optimizing || loading}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition ${optimizing ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}>
              {optimizing ? <><div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" /> 寻参中 {optProgress.current}/{optProgress.total}</> : <><Search className="w-4 h-4" /> 🔍 自动寻参</>}
            </button>
            {optimizing && optProgress.total > 0 && (
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${(optProgress.current / optProgress.total) * 100}%` }} />
              </div>
            )}
            {optResults.length > 0 && (
              <div className="bg-gray-900/30 border border-violet-800/50 rounded-xl p-4">
                <div className="text-xs text-violet-400 font-medium mb-3">🏆 Top 5 参数组合（按夏普排序）</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left py-1.5 px-2">#</th>
                      <th className="text-left py-1.5 px-2">参数</th>
                      <th className="text-right py-1.5 px-2">收益%</th>
                      <th className="text-right py-1.5 px-2">胜率</th>
                      <th className="text-right py-1.5 px-2">夏普</th>
                      <th className="text-right py-1.5 px-2">回撤</th>
                      <th className="text-right py-1.5 px-2"></th>
                    </tr></thead>
                    <tbody>{optResults.map((o, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-violet-500/5">
                        <td className="py-1.5 px-2 text-gray-400">{i + 1}</td>
                        <td className="py-1.5 px-2 font-mono text-gray-300 text-[10px]">{Object.entries(o.params).map(([k,v]) => `${k}=${v}`).join(' ')}</td>
                        <td className={`py-1.5 px-2 text-right font-mono ${o.returnPct > 0 ? 'text-green-400' : 'text-red-400'}`}>{o.returnPct > 0 ? '+' : ''}{o.returnPct.toFixed(1)}%</td>
                        <td className="py-1.5 px-2 text-right font-mono text-gray-300">{o.winRate.toFixed(1)}%</td>
                        <td className="py-1.5 px-2 text-right font-mono text-violet-400">{o.sharpe.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right font-mono text-red-400">{o.maxDD.toFixed(1)}%</td>
                        <td className="py-1.5 px-2 text-right">
                          <button onClick={() => { setParams(o.params); setOptResults([]); }}
                            className="text-[10px] text-violet-400 hover:text-violet-300">应用</button>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}
            </Paywall>

            <button onClick={handleOptimize} disabled={optimizing || loading}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition ${optimizing ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-violet-700 hover:bg-violet-600 text-white'}`}>
              {optimizing
                ? <><div className="w-4 h-4 border-2 border-gray-600 border-t-violet-400 rounded-full animate-spin" /> 寻参中…</>
                : <><Search className="w-4 h-4" /> 🔍 自动寻参</>}
            </button>
            {optimizing && optProgress.total > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500"><span>测试参数组合</span><span>{optProgress.current}/{optProgress.total}</span></div>
                <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{width: `${(optProgress.current / optProgress.total) * 100}%`}} /></div>
              </div>
            )}
            {optResults.length > 0 && (
              <div className="bg-gray-900/30 border border-violet-800/40 rounded-xl p-3">
                <div className="text-xs text-gray-400 font-medium mb-2">🏆 Top 5 最优参数</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-gray-600 border-b border-gray-800">
                      <th className="text-left py-1 pr-2">#</th>
                      <th className="text-right py-1 pr-2">夏普</th>
                      <th className="text-right py-1 pr-2">收益%</th>
                      <th className="text-right py-1 pr-2">胜率</th>
                      <th className="text-right py-1">回撤</th>
                      <th className="py-1"></th>
                    </tr></thead>
                    <tbody>{optResults.map((r, i) => (
                      <tr key={i} className="border-b border-gray-800/40 hover:bg-gray-800/30">
                        <td className="py-1 pr-2 text-gray-500">{i + 1}</td>
                        <td className="py-1 pr-2 text-right font-mono text-violet-300">{r.sharpe.toFixed(2)}</td>
                        <td className={`py-1 pr-2 text-right font-mono ${r.returnPct > 0 ? 'text-green-400' : 'text-red-400'}`}>{r.returnPct > 0 ? '+' : ''}{r.returnPct.toFixed(1)}%</td>
                        <td className="py-1 pr-2 text-right font-mono text-gray-300">{r.winRate.toFixed(0)}%</td>
                        <td className="py-1 text-right font-mono text-red-400">{r.maxDD.toFixed(1)}%</td>
                        <td className="py-1 pl-2">
                          <button onClick={() => setParams(r.params)} className="text-[10px] text-violet-400 hover:text-violet-300 border border-violet-700/50 rounded px-1.5 py-0.5">应用</button>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="mt-2 text-[10px] text-gray-600">点击"应用"将最优参数填入滑块</div>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-5 space-y-4">
            {!latest && !loading && (
              <div className="flex items-center justify-center h-96 border border-gray-800 rounded-xl bg-gray-900/20">
                <div className="text-center text-gray-600"><BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">选择策略并运行回测</p><p className="text-xs mt-1">结果将显示在这里</p></div>
              </div>
            )}
            {latest && (<>
              <div className="grid grid-cols-4 gap-2">
                {(() => { const s = calcScore(latest); const color = s >= 61 ? 'text-green-400' : s >= 31 ? 'text-yellow-400' : 'text-red-400'; const grade = s >= 80 ? 'S级' : s >= 61 ? 'A级' : s >= 31 ? 'B级' : 'C级'; return <StatCard label="综合评分" value={`${s}`} sub={grade} color={color} />; })()}
                <StatCard label="总收益" value={`${latest.totalReturnPercent > 0 ? '+' : ''}${latest.totalReturnPercent.toFixed(2)}%`} sub={`$${latest.totalReturn.toFixed(0)}`} color={latest.totalReturnPercent > 0 ? 'text-green-400' : 'text-red-400'} />
                <StatCard label="胜率" value={`${latest.winRate.toFixed(1)}%`} sub={`${latest.winTrades}胜 ${latest.lossTrades}负`} color={latest.winRate >= 50 ? 'text-green-400' : 'text-yellow-400'} />
                <StatCard label="盈亏比" value={latest.profitFactor === Infinity ? '∞' : latest.profitFactor.toFixed(2)} color={latest.profitFactor >= 1.5 ? 'text-green-400' : latest.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'} />
                <StatCard label="最大回撤" value={`${latest.maxDrawdownPercent.toFixed(2)}%`} sub={`$${latest.maxDrawdown.toFixed(0)}`} color={latest.maxDrawdownPercent < 10 ? 'text-green-400' : latest.maxDrawdownPercent < 20 ? 'text-yellow-400' : 'text-red-400'} />
                <StatCard label="夏普比率" value={latest.sharpeRatio.toFixed(2)} color={latest.sharpeRatio > 1 ? 'text-green-400' : latest.sharpeRatio > 0 ? 'text-yellow-400' : 'text-red-400'} />
                <StatCard label="总交易" value={`${latest.totalTrades}笔`} sub={`平均${latest.avgHoldBars.toFixed(1)}根K线`} />
              </div>

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-3">资金曲线</div>
                <EquityCurve data={latest.equityCurve} color={colors[results.length-1]}
                  compareData={results.slice(0,-1).map((r,i) => ({ data: r.equityCurve, color: colors[i], name: STRATEGY_TEMPLATES.find(t => t.id === r.strategyName)?.name || r.strategyName }))} />
              </div>

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-3">回撤水下图</div>
                <DrawdownChart data={latest.equityCurve} />
              </div>

              {results.length >= 2 && <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4"><div className="text-xs text-gray-500 font-medium mb-3">策略对比</div><CompareTable results={results} /></div>}

              {latest.monthlyReturns.length > 0 && <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4"><div className="text-xs text-gray-500 font-medium mb-3">月度收益</div><MonthlyHeatmap data={latest.monthlyReturns} /></div>}

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-3">盈亏散点图</div>
                <TradeScatter trades={latest.trades} />
              </div>

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4"><TradeTable trades={latest.trades} /></div>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}
