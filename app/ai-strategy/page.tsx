'use client';

import { useState } from 'react';
import Link from 'next/link';
import Paywall from '@/components/Paywall';
import { Sparkles, ArrowRight, Loader2, Lightbulb, Zap, BarChart3 } from 'lucide-react';

const EXAMPLES = [
  { text: '我想做趋势跟踪，激进一点', icon: '🚀' },
  { text: '保守的均值回归策略', icon: '🛡️' },
  { text: '用MACD配合成交量做动量交易', icon: '📊' },
  { text: '海龟突破策略，20周期', icon: '🐢' },
  { text: '布林带反转，适合震荡市', icon: '📉' },
  { text: '短线RSI超卖反弹', icon: '⚡' },
];

interface AIResult {
  strategy: {
    strategyId: string;
    params: Record<string, number>;
    name: string;
    reasoning: string;
  };
  risk: { stopLoss: number; takeProfit: number; maxPosition: number };
  suggestions: string[];
}

export default function AIStrategyPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleGenerate = async (text?: string) => {
    const input = text || prompt;
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      alert(e.message || '生成失败');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AI 策略生成器
          </div>
          <h1 className="text-3xl font-bold mb-3">用自然语言创建交易策略</h1>
          <p className="text-gray-500">描述你的交易想法，AI帮你转化为可回测的策略</p>
        </div>

        <Paywall feature="AI策略生成器 — 自然语言创建交易策略">
        {/* Input */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
          <label className="text-xs text-gray-500 block mb-2">描述你想要的策略</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="例如：我想做一个保守的趋势跟踪策略，用50周期EMA确认方向，RSI过滤入场时机..."
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition min-h-[100px] resize-none"
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleGenerate(); }}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-gray-600">⌘+Enter 生成</span>
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition ${
                loading ? 'bg-gray-800 text-gray-500' : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? '生成中...' : '生成策略'}
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-8">
          <div className="text-xs text-gray-600 mb-3 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> 试试这些</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EXAMPLES.map(ex => (
              <button key={ex.text}
                onClick={() => { setPrompt(ex.text); handleGenerate(ex.text); }}
                className="text-left bg-gray-900/30 border border-gray-800 hover:border-violet-500/30 rounded-xl px-3 py-2.5 text-xs text-gray-400 hover:text-gray-200 transition">
                <span className="mr-1.5">{ex.icon}</span>{ex.text}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-gray-900/50 border border-violet-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-violet-500/15 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold">{result.strategy.name}</h3>
                  <p className="text-xs text-gray-500">策略ID: {result.strategy.strategyId}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <div className="text-xs text-gray-500 mb-2">AI 分析</div>
                <p className="text-sm text-gray-300">{result.strategy.reasoning}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-2">策略参数</div>
                  <div className="space-y-1">
                    {Object.entries(result.strategy.params).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-400">{k}</span>
                        <span className="font-mono text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-2">风控建议</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">止损</span>
                      <span className="font-mono text-red-400">{result.risk.stopLoss}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">止盈</span>
                      <span className="font-mono text-green-400">{result.risk.takeProfit}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">最大仓位</span>
                      <span className="font-mono text-white">{result.risk.maxPosition}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {result.suggestions.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-4">
                  <div className="text-xs text-yellow-400/80 font-medium mb-1">💡 建议</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {result.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              )}

              <Link href={`/strategy?sid=${result.strategy.strategyId}&${Object.entries(result.strategy.params).map(([k,v]) => `${k}=${v}`).join('&')}&sl=${result.risk.stopLoss}&tp=${result.risk.takeProfit}`}
                className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition">
                <BarChart3 className="w-4 h-4" /> 去策略工坊回测 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
        </Paywall>
      </div>
    </div>
  );
}
