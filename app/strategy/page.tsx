'use client';

import { useI18n } from '@/lib/i18n';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { STRATEGY_TEMPLATES, TIMEFRAMES, SYMBOLS, BACKTEST_PERIODS, DEFAULT_RISK } from '@/lib/strategies';
import { runBacktest, BacktestResult, BacktestConfig } from '@/lib/backtestEngine';
import { optimize, OptResult } from '@/lib/optimizer';
import { runMonteCarlo, MonteCarloResult } from '@/lib/monteCarlo';
import { saveStrategy } from '@/lib/autoTrader';
import Paywall from '@/components/Paywall';
import { ChevronDown, ChevronRight, Play, Trash2, BarChart3, Layers, Search, Share2, X as XIcon, Copy, Check, Rocket } from 'lucide-react';

function EquityCurve({ data, color = '#10b981', height = 200, compareData }: {
  data: { time: number; equity: number }[]; color?: string; height?: number;
  compareData?: { data: { time: number; equity: number }[]; color: string; name: string }[];
}) {
  const { t: tr } = useI18n();
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
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded" style={{background: color}} />{tr('strategy.current')}</span>
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
  const { t: tr } = useI18n();
  const [show, setShow] = useState(false);
  if (trades.length === 0) return null;
  return (
    <div>
      <button onClick={() => setShow(!show)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition mb-2">
        {show ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {tr('strategy.tradeDetails')} ({trades.length}{tr('strategy.tradeCount')})
      </button>
      {show && (
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-950"><tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-2">{tr('strategy.time')}</th><th className="text-left py-2 px-2">{tr('strategy.direction')}</th>
              <th className="text-right py-2 px-2">{tr('strategy.entry')}</th><th className="text-right py-2 px-2">{tr('strategy.exit')}</th>
              <th className="text-right py-2 px-2">{tr('strategy.pnl')}</th><th className="text-right py-2 px-2">{tr('strategy.pnlPct')}</th>
              <th className="text-left py-2 px-2">{tr('strategy.reason')}</th>
            </tr></thead>
            <tbody>{trades.map((t, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-1.5 px-2 text-gray-400">{new Date(t.entryTime).toLocaleDateString()}</td>
                <td className="py-1.5 px-2"><span className={t.direction === 'long' ? 'text-green-400' : 'text-red-400'}>{t.direction === 'long' ? tr('strategy.long') : tr('strategy.short')}</span></td>
                <td className="py-1.5 px-2 text-right font-mono text-gray-300">${t.entryPrice.toFixed(2)}</td>
                <td className="py-1.5 px-2 text-right font-mono text-gray-300">${t.exitPrice.toFixed(2)}</td>
                <td className={`py-1.5 px-2 text-right font-mono ${t.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>{t.pnl > 0 ? '+' : ''}${t.pnl.toFixed(2)}</td>
                <td className={`py-1.5 px-2 text-right font-mono ${t.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>{t.pnlPercent > 0 ? '+' : ''}{t.pnlPercent.toFixed(2)}%</td>
                <td className="py-1.5 px-2 text-gray-500">{t.exitReason === 'stopLoss' ? tr('strategy.exitStopLoss') : t.exitReason === 'takeProfit' ? tr('strategy.exitTakeProfit') : tr('strategy.exitSignal')}</td>
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
  const { t: tr, locale } = useI18n();
  if (results.length < 2) return null;
  const colors = ['#10b981', '#3b82f6', '#f59e0b'];
  const metrics = [
    { label: tr('strategy.totalReturn'), fn: (r: BacktestResult) => `${r.totalReturnPercent > 0 ? '+' : ''}${r.totalReturnPercent.toFixed(2)}%` },
    { label: tr('strategy.winRateLabel'), fn: (r: BacktestResult) => `${r.winRate.toFixed(1)}%` },
    { label: tr('strategy.profitFactor'), fn: (r: BacktestResult) => r.profitFactor === Infinity ? '∞' : r.profitFactor.toFixed(2) },
    { label: tr('strategy.maxDrawdown'), fn: (r: BacktestResult) => `${r.maxDrawdownPercent.toFixed(2)}%` },
    { label: tr('strategy.sharpeRatio'), fn: (r: BacktestResult) => r.sharpeRatio.toFixed(2) },
    { label: tr('strategy.totalTrades'), fn: (r: BacktestResult) => `${r.totalTrades} ${tr('strategy.tradeUnit2')}` },
  ];
  return (
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b border-gray-800"><th className="text-left py-2 px-3 text-gray-500">{tr('strategy.metric')}</th>
        {results.map((r, i) => <th key={i} className="text-right py-2 px-3"><span className="flex items-center justify-end gap-1.5"><span className="w-2 h-2 rounded-full" style={{background: colors[i]}} /><span className="text-gray-300">{(locale === 'en' ? (STRATEGY_TEMPLATES.find(t => t.id === r.strategyName)?.nameEn || STRATEGY_TEMPLATES.find(t => t.id === r.strategyName)?.name) : STRATEGY_TEMPLATES.find(t => t.id === r.strategyName)?.name) || r.strategyName}</span></span></th>)}
      </tr></thead>
      <tbody>{metrics.map(m => <tr key={m.label} className="border-b border-gray-800/50"><td className="py-2 px-3 text-gray-400">{m.label}</td>
        {results.map((r, i) => <td key={i} className="py-2 px-3 text-right font-mono text-gray-200">{m.fn(r)}</td>)}
      </tr>)}</tbody>
    </table></div>
  );
}

function ShareCard({ result, strategyName, symbol, timeframe, onClose }: {
  result: BacktestResult; strategyName: string; symbol: string; timeframe: string; onClose: () => void;
}) {
  const { t: tr, locale } = useI18n();
  const [copied, setCopied] = useState(false);
  const score = (() => {
    let s = 0;
    if (result.sharpeRatio > 2) s += 40; else if (result.sharpeRatio > 1) s += 25; else if (result.sharpeRatio > 0) s += 10;
    if (result.winRate > 60) s += 25; else if (result.winRate > 50) s += 15;
    if (result.profitFactor > 2) s += 25; else if (result.profitFactor > 1.5) s += 15;
    if (result.maxDrawdownPercent < 5) s += 25; else if (result.maxDrawdownPercent < 10) s += 15;
    return Math.min(s, 100);
  })();
  const grade = score >= 80 ? 'S' : score >= 61 ? 'A' : score >= 31 ? 'B' : 'C';
  const gradeColor = score >= 80 ? '#a78bfa' : score >= 61 ? '#34d399' : score >= 31 ? '#fbbf24' : '#f87171';
  const returnColor = result.totalReturnPercent >= 0 ? '#34d399' : '#f87171';
  const symbolLabel = symbol.replace('USDT', '/USDT');
  const tfLabel: Record<string,string> = { '1h': tr('strategy.1h'), '4h': tr('strategy.4h'), '1d': tr('strategy.daily') };

  // Mini equity SVG
  const eqData = result.equityCurve;
  let miniSVG = '';
  if (eqData.length >= 2) {
    const minE = Math.min(...eqData.map(d => d.equity));
    const maxE = Math.max(...eqData.map(d => d.equity));
    const pts = eqData.map((d, i) => {
      const x = (i / (eqData.length - 1)) * 280;
      const y = 60 - ((d.equity - minE) / (maxE - minE + 0.001)) * 55;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    miniSVG = pts;
  }

  const shareText = `${tr('strategy.shareText')}\n📊 ${strategyName} (${symbolLabel} ${tfLabel[timeframe]})\n⭐ 综合评分 ${score} ${tr('strategy.scoreLabel')} (${grade}级)\n💰 总收益 ${result.totalReturnPercent > 0 ? '+' : ''}${result.totalReturnPercent.toFixed(1)}%\n✅ 胜率 ${result.winRate.toFixed(1)}%  📉 最大回撤 ${result.maxDrawdownPercent.toFixed(1)}%\n\n免费试用 👉 trading-copilot-delta.vercel.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="flex flex-col items-center gap-4 max-w-sm w-full" onClick={e => e.stopPropagation()}>
        {/* Instructions */}
        <div className="text-xs text-gray-400 text-center">{tr('strategy.shareHint')}</div>

        {/* The shareable card */}
        <div id="share-card" className="w-full rounded-2xl overflow-hidden border border-gray-700"
          style={{ background: 'linear-gradient(145deg, #0f172a 0%, #111827 60%, #0d1a2e 100%)' }}>

          {/* Header bar */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{tr('strategy.reportCard')}</div>
                <div className="text-base font-bold text-white">{strategyName}</div>
                <div className="text-xs text-gray-400 mt-0.5">{symbolLabel} · {tfLabel[timeframe]} · {result.totalTrades}{tr('strategy.tradeUnit2')}</div>
              </div>
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 shrink-0"
                style={{ borderColor: gradeColor, background: `${gradeColor}15` }}>
                <div className="text-2xl font-black" style={{ color: gradeColor }}>{grade}</div>
                <div className="text-[10px] font-bold" style={{ color: gradeColor }}>{score}{tr('strategy.scoreUnit')}</div>
              </div>
            </div>

            {/* Score bar */}
            <div className="h-1.5 bg-gray-800 rounded-full mb-5">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: gradeColor }} />
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: tr('strategy.totalReturn'), value: `${result.totalReturnPercent > 0 ? '+' : ''}${result.totalReturnPercent.toFixed(1)}%`, color: returnColor },
                { label: tr('strategy.winRateLabel'), value: `${result.winRate.toFixed(1)}%`, color: result.winRate >= 50 ? '#34d399' : '#fbbf24' },
                { label: tr('strategy.profitFactor'), value: result.profitFactor === Infinity ? '∞' : result.profitFactor.toFixed(2), color: result.profitFactor >= 1.5 ? '#34d399' : '#fbbf24' },
                { label: tr('strategy.maxDrawdown'), value: `-${result.maxDrawdownPercent.toFixed(1)}%`, color: result.maxDrawdownPercent < 10 ? '#34d399' : '#fbbf24' },
                { label: tr('strategy.sharpeRatio'), value: result.sharpeRatio.toFixed(2), color: result.sharpeRatio > 1 ? '#34d399' : '#fbbf24' },
                { label: tr('strategy.annualized'), value: `${(result.totalReturnPercent * 365 / (result.totalTrades > 0 ? 90 : 90)).toFixed(0)}%`, color: '#a78bfa' },
              ].map((m, i) => (
                <div key={i} className="bg-gray-800/60 rounded-lg px-3 py-2">
                  <div className="text-[9px] text-gray-500 mb-0.5">{m.label}</div>
                  <div className="text-sm font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Mini equity chart */}
            {miniSVG && (
              <div className="bg-gray-800/40 rounded-lg p-3 mb-4">
                <div className="text-[9px] text-gray-500 mb-2">{tr('strategy.equityChart')}</div>
                <svg viewBox="0 0 280 65" className="w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={returnColor} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={returnColor} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${miniSVG} L280,65 L0,65 Z`} fill="url(#sg)" />
                  <path d={miniSVG} fill="none" stroke={returnColor} strokeWidth="1.5" />
                </svg>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-400">TradingCopilot</div>
              <div className="text-[9px] text-gray-600">trading-copilot-delta.vercel.app</div>
            </div>
            <div className="text-[9px] text-gray-600">{new Date().toLocaleDateString('zh-CN')}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 py-2.5 rounded-xl text-sm font-medium transition-all border border-gray-700">
            {copied ? <><Check className="w-4 h-4 text-emerald-400" />{tr('strategy.copied')}</> : <><Copy className="w-4 h-4" />{tr('strategy.copyShare')}</>}
          </button>
          <button onClick={onClose}
            className="px-4 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-xl border border-gray-700 transition-all">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] text-gray-600 text-center">{tr('strategy.saveHint')}</div>
      </div>
    </div>
  );
}

export default function StrategyPageWrapper() {
  const { t: tr, locale } = useI18n();
  return <Suspense fallback={<div className="min-h-screen bg-gray-950" />}><StrategyPage /></Suspense>;
}

function StrategyPage() {
  const { t: tr, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSid = searchParams.get('sid');
  const [selectedId, setSelectedId] = useState(urlSid && STRATEGY_TEMPLATES.find(t => t.id === urlSid) ? urlSid : STRATEGY_TEMPLATES[0].id);
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
  const [showShareCard, setShowShareCard] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optProgress, setOptProgress] = useState({ current: 0, total: 0 });
  const [optResults, setOptResults] = useState<OptResult[]>([]);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [mcRunning, setMcRunning] = useState(false);

  // Read URL params from AI strategy generator
  useEffect(() => {
    const sid = searchParams.get('sid');
    if (sid && STRATEGY_TEMPLATES.find(t => t.id === sid)) {
      setSelectedId(sid);
      const tmpl = STRATEGY_TEMPLATES.find(t => t.id === sid)!;
      const p: Record<string, number> = {};
      tmpl.params.forEach(pp => {
        const urlVal = searchParams.get(pp.key);
        p[pp.key] = urlVal ? parseFloat(urlVal) : pp.default;
      });
      setParams(p);
      const sl = searchParams.get('sl');
      const tp = searchParams.get('tp');
      if (sl) setStopLoss(parseFloat(sl));
      if (tp) setTakeProfit(parseFloat(tp));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    } catch (e: any) { setError(e.message || tr('strategy.backtestFail')); }
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
            <h1 className="text-2xl font-bold flex items-center gap-2"><Layers className="w-6 h-6 text-emerald-400" />{tr('strategy.workshopTitle')}</h1>
            <p className="text-sm text-gray-500 mt-1">{tr('strategy.workshopFlow')}</p>
          </div>
          {results.length > 0 && <button onClick={() => setResults([])} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"><Trash2 className="w-3 h-3" /> 清空</button>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Strategy Templates */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs text-gray-500 font-medium mb-2">{tr('strategy.templates')}</div>
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
              <div className="text-xs text-gray-500 font-medium mb-3">{tr('strategy.params')}</div>
              <div className="space-y-4">
                {selected.params.map(p => (
                  <div key={p.key}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{locale === 'en' ? p.labelEn || p.label : p.label}</span><span className="font-mono text-emerald-400">{params[p.key]}{p.unit||''}</span></div>
                    <input type="range" min={p.min} max={p.max} step={p.step} value={params[p.key] ?? p.default}
                      onChange={e => setParams(prev => ({...prev, [p.key]: parseFloat(e.target.value)}))}
                      className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    <div className="flex justify-between text-[10px] text-gray-600"><span>{p.min}</span><span>{p.max}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 font-medium mb-3">{tr('strategy.marketSettings')}</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] text-gray-500 block mb-1">{tr('strategy.symbolLabel')}</label>
                  <select value={symbol} onChange={e => setSymbol(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm">
                    {SYMBOLS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">{tr('strategy.timeframeLabel')}</label>
                  <select value={timeframe} onChange={e => setTimeframe(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm">
                    {TIMEFRAMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">{tr('strategy.periodLabel')}</label>
                  <select value={periodDays} onChange={e => setPeriodDays(parseInt(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm">
                    {BACKTEST_PERIODS.map(p => <option key={p.value} value={p.value}>{locale === 'en' ? p.labelEn || p.label : p.label}</option>)}</select></div>
                <div><label className="text-[10px] text-gray-500 block mb-1">{tr('strategy.capitalLabel')}</label>
                  <input type="number" value={capital} onChange={e => setCapital(parseInt(e.target.value)||10000)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-sm font-mono" /></div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-500 font-medium mb-3">{tr('strategy.riskParamsLabel')}</div>
              <div className="space-y-3">
                {[{l:tr('strategy.exitStopLoss'),v:stopLoss,s:setStopLoss,mn:1,mx:20,u:'%'},{l:tr('strategy.exitTakeProfit'),v:takeProfit,s:setTakeProfit,mn:1,mx:50,u:'%'},
                  {l:tr('strategy.maxPositionLabel'),v:maxPosition,s:setMaxPosition,mn:10,mx:100,u:'%'},{l:tr('strategy.feeLabel'),v:feeRate,s:setFeeRate,mn:0,mx:0.2,u:'%',st:0.01},
                  {l:tr('strategy.slippageLabel'),v:slippage,s:setSlippage,mn:0,mx:0.1,u:'%',st:0.01}].map(r => (
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
              {showCode ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />} {tr('strategy.logicPreviewLabel')}
            </button>
            {showCode && <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-emerald-300 font-mono whitespace-pre-wrap">{selected.pseudoCode(params)}</pre>}

            <button onClick={handleRun} disabled={loading}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition ${loading ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
              {loading ? <><div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" /> {tr('strategy.calculating')}</> : <><Play className="w-4 h-4" /> 运行回测</>}
            </button>
            {results.length > 0 && results.length < 3 && <p className="text-[10px] text-gray-600 text-center">{tr('strategy.compareHint')}</p>}
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}

            <Paywall feature={tr('strategy.paywallOptimizer')}>
            <button onClick={handleOptimize} disabled={optimizing || loading}
              className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition ${optimizing ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}>
              {optimizing ? <><div className="w-4 h-4 border-2 border-gray-600 border-t-white rounded-full animate-spin" /> {tr('strategy.searching')} {optProgress.current}/{optProgress.total}</> : <><Search className="w-4 h-4" /> {tr('strategy.autoSearch')}</>}
            </button>
            {optimizing && optProgress.total > 0 && (
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${(optProgress.current / optProgress.total) * 100}%` }} />
              </div>
            )}
            {optResults.length > 0 && (
              <div className="bg-gray-900/30 border border-violet-800/50 rounded-xl p-4">
                <div className="text-xs text-violet-400 font-medium mb-3">{tr('strategy.top5')}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left py-1.5 px-2">#</th>
                      <th className="text-left py-1.5 px-2">{tr('strategy.paramsCol')}</th>
                      <th className="text-right py-1.5 px-2">{tr('strategy.returnCol')}</th>
                      <th className="text-right py-1.5 px-2">{tr('strategy.winRateCol')}</th>
                      <th className="text-right py-1.5 px-2">{tr('strategy.sharpeCol')}</th>
                      <th className="text-right py-1.5 px-2">{tr('strategy.drawdownCol')}</th>
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
                            className="text-[10px] text-violet-400 hover:text-violet-300">{tr('strategy.apply')}</button>
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
                ? <><div className="w-4 h-4 border-2 border-gray-600 border-t-violet-400 rounded-full animate-spin" /> {tr('strategy.searching')}…</>
                : <><Search className="w-4 h-4" /> {tr('strategy.autoSearchLabel')}</>}
            </button>
            {optimizing && optProgress.total > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500"><span>{tr('strategy.testParams')}</span><span>{optProgress.current}/{optProgress.total}</span></div>
                <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{width: `${(optProgress.current / optProgress.total) * 100}%`}} /></div>
              </div>
            )}
            {optResults.length > 0 && (
              <div className="bg-gray-900/30 border border-violet-800/40 rounded-xl p-3">
                <div className="text-xs text-gray-400 font-medium mb-2">{tr('strategy.top5Best')}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-gray-600 border-b border-gray-800">
                      <th className="text-left py-1 pr-2">#</th>
                      <th className="text-right py-1 pr-2">{tr('strategy.sharpeCol')}</th>
                      <th className="text-right py-1 pr-2">{tr('strategy.returnCol')}</th>
                      <th className="text-right py-1 pr-2">{tr('strategy.winRateCol')}</th>
                      <th className="text-right py-1">{tr('strategy.drawdownCol')}</th>
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
                          <button onClick={() => setParams(r.params)} className="text-[10px] text-violet-400 hover:text-violet-300 border border-violet-700/50 rounded px-1.5 py-0.5">{tr('strategy.apply')}</button>
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
                <div className="text-center text-gray-600"><BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="text-sm">{tr('strategy.selectAndRun')}</p><p className="text-xs mt-1">结果将显示在这里</p></div>
              </div>
            )}
            {latest && (<>
              {showShareCard && (
                <ShareCard
                  result={latest}
                  strategyName={(locale === 'en' ? (STRATEGY_TEMPLATES.find(t => t.id === selectedId)?.nameEn || STRATEGY_TEMPLATES.find(t => t.id === selectedId)?.name) : STRATEGY_TEMPLATES.find(t => t.id === selectedId)?.name) || selectedId}
                  symbol={symbol}
                  timeframe={timeframe}
                  onClose={() => setShowShareCard(false)}
                />
              )}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">{tr('strategy.backtestResult')}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        saveStrategy({
                          strategyId: selectedId,
                          params: params,
                          symbol: symbol,
                          timeframe: timeframe,
                          riskParams: { stopLoss, takeProfit, maxPosition },
                          name: (locale === 'en' ? (STRATEGY_TEMPLATES.find(t => t.id === selectedId)?.nameEn || STRATEGY_TEMPLATES.find(t => t.id === selectedId)?.name) : STRATEGY_TEMPLATES.find(t => t.id === selectedId)?.name),
                        });
                        router.push('/trade');
                      }}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-all border border-emerald-500/20">
                      <Rocket className="w-3.5 h-3.5" /> {tr('strategy.deployPaper')}
                    </button>
                    <button onClick={() => setShowShareCard(true)}
                      className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg transition-all border border-violet-500/20">
                      <Share2 className="w-3.5 h-3.5" /> {tr('strategy.shareReport')}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(() => { const s = calcScore(latest); const color = s >= 61 ? 'text-green-400' : s >= 31 ? 'text-yellow-400' : 'text-red-400'; const grade = s >= 80 ? 'S级' : s >= 61 ? 'A级' : s >= 31 ? 'B级' : 'C级'; return <StatCard label="综合评分" value={`${s}`} sub={grade} color={color} />; })()}
                  <StatCard label={tr('strategy.totalReturn')} value={`${latest.totalReturnPercent > 0 ? '+' : ''}${latest.totalReturnPercent.toFixed(2)}%`} sub={`$${latest.totalReturn.toFixed(0)}`} color={latest.totalReturnPercent > 0 ? 'text-green-400' : 'text-red-400'} />
                  <StatCard label={tr('strategy.winRateLabel')} value={`${latest.winRate.toFixed(1)}%`} sub={`${latest.winTrades} ${tr('strategy.winLabel')} ${latest.lossTrades} ${tr('strategy.loseLabel')}`} color={latest.winRate >= 50 ? 'text-green-400' : 'text-yellow-400'} />
                  <StatCard label={tr('strategy.profitFactor')} value={latest.profitFactor === Infinity ? '∞' : latest.profitFactor.toFixed(2)} color={latest.profitFactor >= 1.5 ? 'text-green-400' : latest.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'} />
                  <StatCard label={tr('strategy.maxDrawdown')} value={`${latest.maxDrawdownPercent.toFixed(2)}%`} sub={`$${latest.maxDrawdown.toFixed(0)}`} color={latest.maxDrawdownPercent < 10 ? 'text-green-400' : latest.maxDrawdownPercent < 20 ? 'text-yellow-400' : 'text-red-400'} />
                  <StatCard label={tr('strategy.sharpeRatio')} value={latest.sharpeRatio.toFixed(2)} color={latest.sharpeRatio > 1 ? 'text-green-400' : latest.sharpeRatio > 0 ? 'text-yellow-400' : 'text-red-400'} />
                  <StatCard label={tr('strategy.totalTrades')} value={`${latest.totalTrades} ${tr('strategy.tradeUnit2')}`} sub={`平均${latest.avgHoldBars.toFixed(1)}根K线`} />
                </div>
              </div>

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-3">{tr('strategy.equityChart')}</div>
                <EquityCurve data={latest.equityCurve} color={colors[results.length-1]}
                  compareData={results.slice(0,-1).map((r,i) => ({ data: r.equityCurve, color: colors[i], name: (locale === 'en' ? (STRATEGY_TEMPLATES.find(t => t.id === r.strategyName)?.nameEn || STRATEGY_TEMPLATES.find(t => t.id === r.strategyName)?.name) : STRATEGY_TEMPLATES.find(t => t.id === r.strategyName)?.name) || r.strategyName }))} />
              </div>

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-3">{tr('strategy.drawdownUW')}</div>
                <DrawdownChart data={latest.equityCurve} />
              </div>

              {results.length >= 2 && <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4"><div className="text-xs text-gray-500 font-medium mb-3">{tr('strategy.compareChart')}</div><CompareTable results={results} /></div>}

              {latest.monthlyReturns.length > 0 && <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4"><div className="text-xs text-gray-500 font-medium mb-3">{tr('strategy.monthlyReturn')}</div><MonthlyHeatmap data={latest.monthlyReturns} /></div>}

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-3">{tr('strategy.pnlScatter')}</div>
                <TradeScatter trades={latest.trades} />
              </div>

              {/* Monte Carlo Simulation */}
              <Paywall feature={tr('strategy.mcPaywall')}>
              <div className="bg-gray-900/30 border border-emerald-800/40 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-emerald-400 font-medium">{tr('strategy.mcTitle')}</div>
                  <button onClick={() => {
                    if (!latest || latest.trades.length < 2) return;
                    setMcRunning(true);
                    setTimeout(() => {
                      try {
                        const mc = runMonteCarlo(latest, { numSimulations: 1000, initialCapital: capital, confidenceLevels: [0.05, 0.25, 0.5, 0.75, 0.95] });
                        setMcResult(mc);
                      } catch (e: any) { setError(e.message); }
                      setMcRunning(false);
                    }, 50);
                  }} disabled={mcRunning || !latest || latest.trades.length < 2}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${mcRunning ? 'bg-gray-800 text-gray-500 cursor-wait' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}`}>
                    {mcRunning ? tr('strategy.mcRunning') : tr('strategy.mcRun1000')}
                  </button>
                </div>
                <p className="text-[10px] text-gray-600">{tr('strategy.mcDesc')}</p>

                {mcResult && (<>
                  {/* Probability Cards */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-gray-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500 mb-1">{tr('strategy.winProb')}</div>
                      <div className={`text-lg font-bold font-mono ${mcResult.probProfit >= 0.7 ? 'text-green-400' : mcResult.probProfit >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {(mcResult.probProfit * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500 mb-1">{tr('strategy.doubleProb')}</div>
                      <div className="text-lg font-bold font-mono text-emerald-400">{(mcResult.probDouble * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500 mb-1">{tr('strategy.blowupProb')}</div>
                      <div className={`text-lg font-bold font-mono ${mcResult.probRuin <= 0.05 ? 'text-green-400' : mcResult.probRuin <= 0.15 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {(mcResult.probRuin * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500 mb-1">{tr('strategy.beatHold')}</div>
                      <div className="text-lg font-bold font-mono text-violet-400">{(mcResult.probBeatBuyHold * 100).toFixed(0)}%</div>
                    </div>
                  </div>

                  {/* Return Distribution */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-[10px] text-gray-500 mb-2">{tr('strategy.returnDist')}</div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-gray-500">{tr('strategy.best')}</span><span className="text-green-400 font-mono">+{mcResult.bestCase.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">{tr('strategy.p75')}</span><span className="text-green-400 font-mono">+{mcResult.percentiles.find(p => p.level === 0.75)?.returnPercent.toFixed(1)}%</span></div>
                        <div className="flex justify-between font-medium"><span className="text-gray-400">{tr('strategy.median')}</span><span className={`font-mono ${mcResult.medianReturn > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{mcResult.medianReturn > 0 ? '+' : ''}{mcResult.medianReturn.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">{tr('strategy.p25')}</span><span className={`font-mono ${(mcResult.percentiles.find(p => p.level === 0.25)?.returnPercent || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>{mcResult.percentiles.find(p => p.level === 0.25)?.returnPercent.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">{tr('strategy.worst')}</span><span className="text-red-400 font-mono">{mcResult.worstCase.toFixed(1)}%</span></div>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-[10px] text-gray-500 mb-2">{tr('strategy.drawdownDist')}</div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><span className="text-gray-500">{tr('strategy.avgDrawdown')}</span><span className="text-yellow-400 font-mono">{mcResult.meanMaxDrawdown.toFixed(1)}%</span></div>
                        <div className="flex justify-between font-medium"><span className="text-gray-400">{tr('strategy.medianDrawdown')}</span><span className="text-yellow-400 font-mono">{mcResult.medianMaxDrawdown.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">{tr('strategy.maxDDLabel')}</span><span className="text-red-400 font-mono">{mcResult.worstDrawdown.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">{tr('strategy.avgReturn')}</span><span className="text-gray-300 font-mono">{mcResult.meanReturn > 0 ? '+' : ''}{mcResult.meanReturn.toFixed(1)}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">{tr('strategy.stdDev')}</span><span className="text-gray-300 font-mono">±{mcResult.stdReturn.toFixed(1)}%</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Percentile Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="text-gray-600 border-b border-gray-800">
                        <th className="text-left py-1.5 px-2">{tr('strategy.confidence')}</th>
                        <th className="text-right py-1.5 px-2">{tr('strategy.finalCapital')}</th>
                        <th className="text-right py-1.5 px-2">{tr('strategy.returnRate')}</th>
                        <th className="text-right py-1.5 px-2">{tr('strategy.maxDDCol')}</th>
                      </tr></thead>
                      <tbody>{mcResult.percentiles.map(p => (
                        <tr key={p.level} className={`border-b border-gray-800/50 ${p.level === 0.5 ? 'bg-emerald-500/5' : ''}`}>
                          <td className="py-1.5 px-2 text-gray-400">{(p.level * 100).toFixed(0)}%</td>
                          <td className="py-1.5 px-2 text-right font-mono text-gray-300">${p.finalCapital.toLocaleString()}</td>
                          <td className={`py-1.5 px-2 text-right font-mono ${p.returnPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>{p.returnPercent > 0 ? '+' : ''}{p.returnPercent.toFixed(1)}%</td>
                          <td className="py-1.5 px-2 text-right font-mono text-red-400">{p.maxDrawdown.toFixed(1)}%</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>

                  {/* MC Equity Fan Chart (SVG) */}
                  <div>
                    <div className="text-[10px] text-gray-500 mb-2">{tr('strategy.mc1000paths')}</div>
                    <svg viewBox="0 0 600 200" className="w-full" style={{background: 'transparent'}}>
                      {mcResult.paths.map((path, i) => {
                        const pts = path.equityCurve;
                        if (pts.length < 2) return null;
                        const maxLen = Math.max(...mcResult.paths.map(p => p.equityCurve.length));
                        const allVals = mcResult.paths.flatMap(p => p.equityCurve);
                        const minY = Math.min(...allVals) * 0.95;
                        const maxY = Math.max(...allVals) * 1.05;
                        const d = pts.map((v, j) => {
                          const x = (j / (maxLen - 1)) * 600;
                          const y = 200 - ((v - minY) / (maxY - minY)) * 200;
                          return `${j === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                        }).join(' ');
                        const color = path.totalReturnPercent >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(248,81,73,0.08)';
                        return <path key={i} d={d} fill="none" stroke={color} strokeWidth="0.8" />;
                      })}
                      {/* Median line */}
                      {(() => {
                        const medianPath = [...mcResult.paths].sort((a, b) =>
                          Math.abs(a.totalReturnPercent - mcResult.medianReturn) - Math.abs(b.totalReturnPercent - mcResult.medianReturn)
                        )[0];
                        if (!medianPath) return null;
                        const pts = medianPath.equityCurve;
                        const maxLen = Math.max(...mcResult.paths.map(p => p.equityCurve.length));
                        const allVals = mcResult.paths.flatMap(p => p.equityCurve);
                        const minY = Math.min(...allVals) * 0.95;
                        const maxY = Math.max(...allVals) * 1.05;
                        const d = pts.map((v, j) => {
                          const x = (j / (maxLen - 1)) * 600;
                          const y = 200 - ((v - minY) / (maxY - minY)) * 200;
                          return `${j === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                        }).join(' ');
                        return <path d={d} fill="none" stroke="#10b981" strokeWidth="2" />;
                      })()}
                      {/* Start line */}
                      {(() => {
                        const allVals = mcResult.paths.flatMap(p => p.equityCurve);
                        const minY = Math.min(...allVals) * 0.95;
                        const maxY = Math.max(...allVals) * 1.05;
                        const y = 200 - ((capital - minY) / (maxY - minY)) * 200;
                        return <line x1="0" y1={y} x2="600" y2={y} stroke="#484f58" strokeWidth="0.5" strokeDasharray="4,4" />;
                      })()}
                    </svg>
                  </div>

                  <div className="text-[10px] text-gray-600 text-center">
                    {tr('strategy.mcBasis').replace('{trades}', String(latest.totalTrades))}
                  </div>
                </>)}
              </div>
              </Paywall>

              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-4"><TradeTable trades={latest.trades} /></div>

              {/* ── Result Interpretation ── */}
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-gray-900 p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300 mb-3">{tr('strategy.whatMeans')}</div>
                <div className="grid gap-3 sm:grid-cols-2 text-sm text-gray-400 leading-relaxed">
                  <div>
                    <span className="text-gray-200 font-medium">胜率 {latest.winRate.toFixed(1)}%</span>
                    <p className="mt-1">{latest.winRate >= 50 ? '超过半数交易盈利。但胜率高不等于赚钱——关键看盈亏比是否匹配。' : '不到一半交易盈利。这没问题——只要每次赢的比输的多，低胜率也能稳定赚钱。趋势策略通常 35-45% 胜率。'}</p>
                  </div>
                  <div>
                    <span className="text-gray-200 font-medium">最大回撤 {latest.maxDrawdown.toFixed(1)}%</span>
                    <p className="mt-1">{latest.maxDrawdown <= 15 ? '回撤控制出色，15% 以下说明策略稳健。' : latest.maxDrawdown <= 30 ? '中等水平。实盘中你能承受账户缩水这么多吗？心理承受力是关键。' : '回撤偏大，实盘可能很难坚持。建议降低仓位或加紧止损来压缩回撤。'}</p>
                  </div>
                  <div>
                    <span className="text-gray-200 font-medium">总交易 {latest.totalTrades} 笔</span>
                    <p className="mt-1">{latest.totalTrades >= 50 ? '样本量足够，结果有统计意义。' : '交易笔数偏少，结果可能受个别交易影响较大。建议拉长回测周期增加样本。'}</p>
                  </div>
                  <div>
                    <span className="text-gray-200 font-medium">总收益 {latest.totalReturnPercent > 0 ? '+' : ''}{latest.totalReturnPercent.toFixed(1)}%</span>
                    <p className="mt-1">{latest.totalReturnPercent > 0 ? '策略整体盈利。但别忘了：过去盈利不保证未来——用蒙特卡洛看看在不同运气下表现如何。' : '策略整体亏损。先检查止损是否太紧、入场信号是否有效，再考虑参数优化。'}</p>
                  </div>
                </div>
              </div>

              {/* ── Next Step CTA ── */}
              <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-gray-900 p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">{tr('strategy.nextStepLabel')}</div>
                <h3 className="mt-2 text-lg font-semibold text-white">{tr('strategy.nextStepTitle')}</h3>
                <p className="mt-2 text-sm text-gray-400">{tr('strategy.nextStepDesc')}</p>
                <a href="/practice" className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-cyan-400">去 Practice 训练 →</a>
              </div>
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}
