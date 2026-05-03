'use client';

import { useI18n } from '@/lib/i18n';

import { useState } from 'react';
import { useSession } from '@/lib/useSession';
import { BookOpen, Check, Crown, Shield, Star, Zap, Users, Clock, ArrowRight, Loader2 } from 'lucide-react';

function usePlans() {
  const { t } = useI18n();
  return [
    {
      id: 'basic',
      name: t('course.plan1.name'),
      price: 49,
      originalPrice: 69,
      eliteMonths: 1,
      eliteLabel: t('course.plan1.eliteLabel'),
      features: [t('course.plan1.f1'), t('course.plan1.f2'), t('course.plan1.f3'), t('course.plan1.f4'), t('course.plan1.f5')],
      icon: BookOpen,
      color: 'emerald',
      gradient: 'from-emerald-600 to-cyan-600',
    },
    {
      id: 'bundle',
      name: t('course.plan2.name'),
      price: 99,
      originalPrice: 149,
      eliteMonths: 3,
      eliteLabel: t('course.plan2.eliteLabel'),
      popular: true,
      features: [t('course.plan1.f1'), t('course.plan1.f2'), t('course.plan2.f1'), t('course.plan2.f2'), t('course.plan1.f3'), t('course.plan2.f3')],
      icon: Crown,
      color: 'violet',
      gradient: 'from-violet-600 to-purple-600',
    },
    {
      id: 'vip',
      name: t('course.plan3.name'),
      price: 149,
      originalPrice: 249,
      eliteMonths: 6,
      eliteLabel: t('course.plan3.eliteLabel'),
      features: [t('course.plan1.f1'), t('course.plan1.f2'), t('course.plan2.f1'), t('course.plan2.f2'), t('course.plan3.f1'), t('course.plan3.f2'), t('course.plan3.f3'), t('course.plan3.f4')],
      icon: Shield,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600',
    },
  ];
}

const STATS = { students: 127, rating: 4.8, chapters: 24, hours: 12 };

export default function CoursePage() {
  const { t } = useI18n();
  const PLANS = usePlans();
  const { session, hasCourse } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleBuy = async (planId: string) => {
    const userEmail = session?.email || email;
    if (!userEmail) {
      // Not logged in and no email entered → redirect to login
      window.location.href = '/login';
      return;
    }
    setLoading(planId);
    try {
      const r = await fetch('/api/checkout/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email: userEmail }),
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
    } catch {} finally {
      setLoading(null);
    }
  };

  if (hasCourse) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('course.owned')}</h1>
          <p className="text-gray-500 mb-6">{t('course.ownedDesc')}</p>
          <a href="/learn" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500">
            {t('course.continueLearning')} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="pt-24 pb-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm mb-6">
          <Star className="w-4 h-4" /> {t('course.earlyBird')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {t('course.heroTitle1')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">{t('course.heroTitle2')}</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          {t('course.heroDesc')}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-12">
          {[
            { icon: Users, label: t('course.students'), value: `${STATS.students}${t('course.studentsValueSuffix')}` },
            { icon: Star, label: t('course.rating'), value: `${STATS.rating}/5` },
            { icon: BookOpen, label: t('course.chapters'), value: `${STATS.chapters}` },
            { icon: Clock, label: t('course.duration'), value: `${STATS.hours}${t('course.hoursValueSuffix')}` },
          ].map(s => (
            <div key={s.label} className="text-center">
              <s.icon className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        {!session && (
          <div className="max-w-md mx-auto mb-8">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t('course.emailPlaceholder')}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-center" />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.id} className={`relative bg-gray-900/50 border rounded-2xl p-6 flex flex-col ${
              plan.popular ? 'border-violet-500/50 ring-1 ring-violet-500/20' : 'border-gray-800'
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-violet-600 text-white text-xs font-bold rounded-full">
                  {t('course.mostPopular')}
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-${plan.color}-500/10 text-${plan.color}-400`}>
                    {t('course.giftPrefix')}{plan.eliteLabel}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-lg text-gray-600 line-through">${plan.originalPrice}</span>
                  <span className="text-xs text-emerald-400 font-medium">
                    {t('course.save')}${plan.originalPrice - plan.price}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">{t('course.oneTime')}</div>
              </div>

              <div className="flex-1 space-y-3 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 text-${plan.color}-400 shrink-0`} />
                    <span className="text-gray-300">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleBuy(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all ${
                  plan.popular
                    ? 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/30'
                    : 'bg-gray-800 hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{t('course.processing')}</>
                ) : (
                  <>{t('course.buyNow')} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Course Content Preview */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">{t('course.outlineTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { module: t('course.module1'), title: t('course.module1Title'), chapters: '6 ' + t('course.chapUnit'), desc: t('course.module1Desc') },
            { module: t('course.module2'), title: t('course.module2Title'), chapters: '6 ' + t('course.chapUnit'), desc: t('course.module2Desc') },
            { module: t('course.module3'), title: t('course.module3Title'), chapters: '6 ' + t('course.chapUnit'), desc: t('course.module3Desc') },
            { module: t('course.module4'), title: t('course.module4Title'), chapters: '6 ' + t('course.chapUnit'), desc: t('course.module4Desc') },
          ].map(m => (
            <div key={m.module} className="bg-gray-900/30 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-violet-400 font-medium">{m.module}</span>
                <span className="text-xs text-gray-600">{m.chapters}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{m.title}</h3>
              <p className="text-sm text-gray-500">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guarantee */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 text-center">
          <Zap className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">{t('course.guarantee')}</h3>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            {t('course.guaranteeDesc')}
          </p>
        </div>
      </div>
    </div>
  );
}
