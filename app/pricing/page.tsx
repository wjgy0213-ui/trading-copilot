'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { Check, Crown, Zap, Shield, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const PLANS = [
  {
    id: 'free' as const,
    name: '免费版',
    price: 0,
    period: '',
    description: '开始你的交易学习之旅',
    features: ['模拟交易', '3个基础策略', '基础仪表盘', '入门课程', '每日资讯'],
    cta: '当前方案',
    disabled: true,
    icon: Zap,
    color: 'gray',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 39.99,
    period: '/月',
    description: 'AI驱动的策略定制与回测',
    features: ['AI策略定制', '8大策略模板', '高级回测引擎', '参数优化器', '回测报告导出', 'Monte Carlo模拟'],
    cta: '升级 Pro',
    disabled: false,
    icon: Crown,
    color: 'emerald',
    popular: true,
  },
  {
    id: 'elite' as const,
    name: 'Elite',
    price: 79.99,
    period: '/月',
    description: '从策略到实盘的完整闭环',
    features: ['Pro全部功能', '实盘自动化', '交易所API对接', '智能风控系统', 'Telegram实时通知', '1对1优先支持'],
    cta: '升级 Elite',
    disabled: false,
    icon: Shield,
    color: 'violet',
  },
];

export default function PricingPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-950" />}><PricingPage /></Suspense>;
}

function PricingPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');
  const { session, isPro, refresh } = useSession();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState('');

  const doActivate = async (sid: string) => {
    setActivating(true);
    setActivateError('');
    try {
      const r = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sid }),
      });
      const data = await r.json();
      if (!r.ok || data.error) {
        setActivateError(data.error || '激活失败，请联系支持');
      } else {
        await refresh();
      }
    } catch {
      setActivateError('网络错误，请刷新页面重试');
    } finally {
      setActivating(false);
    }
  };

  // Auto-activate on success redirect
  useEffect(() => {
    if (success && sessionId && !activated) {
      setActivated(true);
      doActivate(sessionId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, sessionId, activated]);

  const handleCheckout = async (planId: string) => {
    if (!email || !email.includes('@')) {
      alert('请输入有效的邮箱地址');
      return;
    }
    setLoading(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || '创建支付失败');
      }
    } catch {
      alert('网络错误，请重试');
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> 选择适合你的计划
          </div>
          <h1 className="text-3xl font-bold mb-3">从学习到实战的完整路径</h1>
          <p className="text-gray-500 max-w-lg mx-auto mb-5">不是冷冰冰的工具，是从零到盈利的AI交易陪练系统</p>
          {!isPro && (
            <a href="/strategy" className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
              <Zap className="w-4 h-4" /> 先免费体验 Pro 24小时，再决定是否升级 →
            </a>
          )}
        </div>

        {/* Success/Cancel banners */}
        {success && (
          <div className={`border rounded-xl p-4 mb-8 text-center ${activateError ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
            {activating ? (
              <p className="text-emerald-400 font-medium flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> 正在激活您的订阅…
              </p>
            ) : activateError ? (
              <>
                <p className="text-red-400 font-medium mb-2">⚠️ 激活遇到问题</p>
                <p className="text-red-400/70 text-sm mb-3">{activateError}</p>
                <button onClick={() => sessionId && doActivate(sessionId)}
                  className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-1.5 rounded-lg transition">
                  重试激活
                </button>
                <p className="text-gray-600 text-xs mt-2">如问题持续请联系 support@tradingcopilot.ai（附订单截图）</p>
              </>
            ) : (
              <>
                <p className="text-emerald-400 font-medium">🎉 订阅成功！欢迎成为 Pro 会员</p>
                <p className="text-emerald-400/70 text-sm mt-1">所有高级功能已解锁，开始探索吧</p>
              </>
            )}
          </div>
        )}
        {canceled && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 text-center">
            <p className="text-yellow-400">支付已取消，随时可以再来 👋</p>
          </div>
        )}

        {/* Email input */}
        {!isPro && (
          <div className="max-w-md mx-auto mb-10">
            <label className="text-xs text-gray-500 block mb-1.5">你的邮箱（用于接收订阅信息）</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none transition" />
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            const isCurrentPlan = (session?.plan || 'free') === plan.id;
            const borderColor = plan.popular ? 'border-emerald-500/50' : 'border-gray-800';
            
            return (
              <div key={plan.id}
                className={`relative bg-gray-900/50 border ${borderColor} rounded-2xl p-6 flex flex-col ${plan.popular ? 'ring-1 ring-emerald-500/20' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    最受欢迎
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    plan.color === 'emerald' ? 'bg-emerald-500/15' : plan.color === 'violet' ? 'bg-violet-500/15' : 'bg-gray-800'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      plan.color === 'emerald' ? 'text-emerald-400' : plan.color === 'violet' ? 'text-violet-400' : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                </div>
                
                <div className="mb-3">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                
                <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.color === 'emerald' ? 'text-emerald-400' : plan.color === 'violet' ? 'text-violet-400' : 'text-gray-600'
                      }`} />
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => !plan.disabled && !isCurrentPlan && handleCheckout(plan.id)}
                  disabled={plan.disabled || isCurrentPlan || loading === plan.id}
                  className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition ${
                    isCurrentPlan
                      ? 'bg-gray-800 text-gray-500 cursor-default'
                      : plan.popular
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : plan.color === 'violet'
                          ? 'bg-violet-600 hover:bg-violet-500 text-white'
                          : 'bg-gray-800 text-gray-400 cursor-default'
                  }`}>
                  {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   isCurrentPlan ? '✓ 当前方案' :
                   <>{plan.cta} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-8">常见问题</h2>
          <div className="space-y-4">
            {[
              { q: '可以随时取消吗？', a: '是的，随时可以在设置中取消订阅，当前计费周期内仍可使用全部功能。' },
              { q: '支持哪些支付方式？', a: '通过Stripe支持信用卡、借记卡、Apple Pay、Google Pay等主流支付方式。' },
              { q: 'Elite的实盘自动化安全吗？', a: 'API Key加密存储，仅限交易权限（不可提币），内置风控系统防止异常交易。' },
              { q: '有试用期吗？', a: '有！点击策略工坊中的任意Pro功能，可免费体验24小时全功能Pro版，无需信用卡，到期自动恢复免费版。' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <h3 className="font-medium text-sm mb-1.5">{q}</h3>
                <p className="text-xs text-gray-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
