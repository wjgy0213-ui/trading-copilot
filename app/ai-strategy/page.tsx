'use client';

import { useI18n } from '@/lib/i18n';

import { useState } from 'react';
import Link from 'next/link';
import Paywall from '@/components/Paywall';
import { Sparkles, ArrowRight, Loader2, Lightbulb, Zap, BarChart3 } from 'lucide-react';
import { STRATEGY_TEMPLATES } from '@/lib/strategies';
import { formatLocaleNumber, formatSignedLocalePercent } from '@/lib/i18n-helpers';

const EXAMPLES = [
  { textKey: 'aiStrategy.prompt1', icon: '🚀' },
  { textKey: 'aiStrategy.prompt2', icon: '🛡️' },
  { textKey: 'aiStrategy.prompt3', icon: '📊' },
  { textKey: 'aiStrategy.prompt4', icon: '🐢' },
  { textKey: 'aiStrategy.prompt5', icon: '📉' },
  { textKey: 'aiStrategy.prompt6', icon: '⚡' },
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

// @i18n
export default function AIStrategyPage() {
  const { t, locale } = useI18n();
  const formatAiStrategyText = (key: string, replacements: Record<string, string | number> = {}) => {
    let text = t(key);
    for (const [name, value] of Object.entries(replacements)) {
      text = text.replace(`{${name}}`, String(value));
    }
    return text;
  };
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
      alert(e.message || t('aiStrategy.genFail'));
    }
    setLoading(false);
  };

  const getLocalizedStrategyName = (result: AIResult) => {
    const template = STRATEGY_TEMPLATES.find(item => item.id === result.strategy.strategyId);
    if (!template) return result.strategy.name;
    return t(`strategy.template.${template.id}.name`, locale === 'zh' ? template.name : template.nameEn);
  };

  const getLocalizedParamLabel = (strategyId: string, key: string) => {
    const template = STRATEGY_TEMPLATES.find(item => item.id === strategyId);
    const param = template?.params.find(item => item.key === key);
    const fallback = locale === 'zh' ? (param?.label || key) : (param?.labelEn || param?.label || key);
    return t(`strategy.template.${strategyId}.param.${key}`, fallback);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> {t('aiStrategy.badge')}
          </div>
          <h1 className="text-3xl font-bold mb-3">{t('aiStrategy.title')}</h1>
          <p className="text-gray-500">{t('aiStrategy.desc')}</p>
        </div>

        <Paywall feature={t('aiStrategy.paywallLabel')}>
        {/* Input */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 mb-6">
          <label className="text-xs text-gray-500 block mb-2">{t('aiStrategy.inputLabel')}</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={t('aiStrategy.placeholder')}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition min-h-[100px] resize-none"
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleGenerate(); }}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-[10px] text-gray-600">{t('aiStrategy.hint')}</span>
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition ${
                loading ? 'bg-gray-800 text-gray-500' : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? t('aiStrategy.generating') : t('aiStrategy.generate')}
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-8">
          <div className="text-xs text-gray-600 mb-3 flex items-center gap-1"><Lightbulb className="w-3 h-3" /> {t('aiStrategy.tryThese')}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {EXAMPLES.map(ex => (
              <button key={ex.textKey}
                onClick={() => { setPrompt(t(ex.textKey)); handleGenerate(t(ex.textKey)); }}
                className="text-left bg-gray-900/30 border border-gray-800 hover:border-violet-500/30 rounded-xl px-3 py-2.5 text-xs text-gray-400 hover:text-gray-200 transition">
                <span className="mr-1.5">{ex.icon}</span>{t(ex.textKey)}
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
                  <h3 className="font-bold">{getLocalizedStrategyName(result)}</h3>
                  <p className="text-xs text-gray-500">{formatAiStrategyText('aiStrategy.strategyIdValue', { id: result.strategy.strategyId })}</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                <div className="text-xs text-gray-500 mb-2">{t('aiStrategy.aiAnalysis')}</div>
                <p className="text-sm text-gray-300">{result.strategy.reasoning}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-2">{t('aiStrategy.params')}</div>
                  <div className="space-y-1">
                    {Object.entries(result.strategy.params).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-400">{getLocalizedParamLabel(result.strategy.strategyId, k)}</span>
                        <span className="font-mono text-white">{formatLocaleNumber(v, locale, { maximumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-2">{t('aiStrategy.riskAdvice')}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{t('aiStrategy.slLabel')}</span>
                      <span className="font-mono text-red-400">{formatSignedLocalePercent(-result.risk.stopLoss, locale, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{t('aiStrategy.tpLabel')}</span>
                      <span className="font-mono text-green-400">{formatSignedLocalePercent(result.risk.takeProfit, locale, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">{t('aiStrategy.maxPosLabel')}</span>
                      <span className="font-mono text-white">{formatLocaleNumber(result.risk.maxPosition, locale, { maximumFractionDigits: 0 })}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {result.suggestions.length > 0 && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 mb-4">
                  <div className="text-xs text-yellow-400/80 font-medium mb-1">{t('aiStrategy.suggestion')}</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {result.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
              )}

              <Link href={`/strategy?${new URLSearchParams({
                sid: result.strategy.strategyId,
                ...Object.fromEntries(Object.entries(result.strategy.params).map(([k, v]) => [k, String(v)])),
                sl: String(result.risk.stopLoss),
                tp: String(result.risk.takeProfit),
              }).toString()}`}
                className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition">
                <BarChart3 className="w-4 h-4" /> {t('aiStrategy.goBacktest')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
        </Paywall>
      </div>
    </div>
  );
}
