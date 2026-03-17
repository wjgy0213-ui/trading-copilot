'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import { Check, Crown, Zap, Shield, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { analytics } from '@/lib/analytics';
import CancelRetentionModal from '@/components/CancelRetentionModal';

type BillingInterval = 'monthly' | 'yearly';

const PLANS = [
  {
    id: 'free' as const,
    name: '免费版',
    monthlyPrice: 0,
    yearlyMonthly: 0,
    yearlyPrice: 0,
    description: '每天3次免费市场分析',
    features: ['模拟交易', '3个基础策略', '基础仪表盘', '入门课程', '每日资讯', '每天3次市场分析'],
    cta: '当前方案',
    disabled: true,
    icon: Zap,
    color: 'gray',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    monthlyPrice: 39.99,
    yearlyMonthly: 19.99,
    yearlyPrice: 239.88,
    description: 'AI驱动的策略定制与回测',
    features: ['无限市场分析', 'AI策略定制', '8大策略模板', '高级回测引擎', '参数优化器', '回测报告导出', 'Monte Carlo模拟'],
    cta: '升级 Pro',
    disabled: false,
    icon: Crown,
    color: 'emerald',
    popular: true,
  },
  {
    id: 'elite' as const,
    name: 'Elite',
    monthlyPrice: 79.99,
    yearlyMonthly: 39.99,
    yearlyPrice: 479.88,
    description: '从策略到实盘的完整闭环',
    features: ['Pro全部功能', '4大交易所API对接（Binance/OKX/Bybit/Hyperliquid）', '智能风控系统（单笔/日亏损/杠杆限制）', '风控实时监控（绿/黄/红灯）', '紧急一键平仓', 'Telegram机器人通知', '1对1优先支持'],
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
  const { t } = useI18n();
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
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('yearly');
  const [showCancelModal, setShowCancelModal] = useState(false);

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
        analytics.activationSuccess({
          plan: data.plan,
          email: data.email,
          session_id: sid,
          page: '/pricing',
        });
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
      analytics.checkoutClick({
        plan: planId,
        page: '/pricing',
        email_present: !!email,
      });
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email, interval: billingInterval }),
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
            <Sparkles className="w-3.5 h-3.5" /> {t('pricing.badge')}
          </div>
          <h1 className="text-3xl font-bold mb-3">{t('pricing.heading')}</h1>
          <p className="text-gray-500 max-w-lg mx-auto mb-6">{t('pricing.desc')}</p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              年付
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                省50%
              </span>
            </button>
          </div>
        </div>

        {/* Success/Cancel banners */}
        {success && (
          <div className={`border rounded-xl p-4 mb-8 text-center ${activateError ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
            {activating ? (
              <p className="text-emerald-400 font-medium flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {t('pricing.activating')}
              </p>
            ) : activateError ? (
              <>
                <p className="text-red-400 font-medium mb-2">{t('pricing.activateError')}</p>
                <p className="text-red-400/70 text-sm mb-3">{activateError}</p>
                <button onClick={() => sessionId && doActivate(sessionId)}
                  className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-1.5 rounded-lg transition">
                  {t('pricing.retryActivate')}
                </button>
                <p className="text-gray-600 text-xs mt-2">{t('pricing.activateHelp')}</p>
              </>
            ) : (
              <>
                <p className="text-emerald-400 font-medium">{t('pricing.success')}</p>
                <p className="text-emerald-400/70 text-sm mt-1">{t('pricing.successDesc')}</p>
              </>
            )}
          </div>
        )}
        {canceled && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 text-center">
            <p className="text-yellow-400">{t('pricing.canceled')}</p>
          </div>
        )}

        {/* Email input */}
        {!isPro && (
          <div className="max-w-md mx-auto mb-10">
            <label className="text-xs text-gray-500 block mb-1.5">{t('pricing.emailLabel')}</label>
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
            const displayPrice = plan.id === 'free'
              ? 0
              : billingInterval === 'yearly'
                ? plan.yearlyMonthly
                : plan.monthlyPrice;
            
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
                
                <div className="mb-1">
                  <span className="text-3xl font-bold">${displayPrice}</span>
                  <span className="text-gray-500 text-sm">/月</span>
                </div>
                {plan.id !== 'free' && billingInterval === 'yearly' && (
                  <p className="text-xs text-gray-500 mb-3">
                    按年付费 <span className="text-emerald-400">${plan.yearlyPrice}/年</span>
                    <span className="ml-1.5 text-amber-400">（省50%）</span>
                  </p>
                )}
                {plan.id !== 'free' && billingInterval === 'monthly' && (
                  <p className="text-xs text-gray-500 mb-3">&nbsp;</p>
                )}
                {plan.id === 'free' && <p className="text-xs text-gray-500 mb-3">&nbsp;</p>}
                
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

        {/* Cancel subscription hint for paid users */}
        {isPro && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-gray-600 hover:text-gray-400 transition"
            >
              取消订阅 →
            </button>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-8">{t('pricing.faq.title')}</h2>
          <div className="space-y-4">
            {[
              { q: '可以随时取消吗？', a: '是的，随时可以在设置中取消订阅，当前计费周期内仍可使用全部功能。' },
              { q: '支持哪些支付方式？', a: '通过Stripe支持信用卡、借记卡、Apple Pay、Google Pay等主流支付方式。' },
              { q: 'Elite的实盘自动化安全吗？', a: 'API Key加密存储，仅限交易权限（不可提币），内置风控系统防止异常交易。' },
              { q: '免费版能做什么？', a: '注册用户每天可免费使用3次市场分析（市场体检、信号聚合等核心功能），模拟交易和基础策略不限次数。' },
              { q: '年付和月付有什么区别？', a: '年付享受5折优惠，相当于买6个月送6个月。可以随时从月付切换到年付。' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
                <h3 className="font-medium text-sm mb-1.5">{q}</h3>
                <p className="text-xs text-gray-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancel Retention Modal */}
      {session && (session.plan === 'pro' || session.plan === 'elite') && (
        <CancelRetentionModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          currentPlan={session.plan}
          email={session.email}
        />
      )}
    </div>
  );
}
