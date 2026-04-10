'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Brain, BarChart3, ChevronDown, Sparkles, Shield, Zap, LineChart, Activity, Crosshair, Fish, Gamepad2, ShieldAlert, Radio, BookOpen, Package, Gift, CircleDot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { analytics } from '@/lib/analytics';

function CountUpNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000, steps = 60, inc = target / steps;
    let cur = 0;
    const t = setInterval(() => { cur += inc; if (cur >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(cur)); }, duration / steps);
    return () => clearInterval(t);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition">
        <span className="font-medium text-gray-200">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{answer}</div>}
    </div>
  );
}

export default function LandingPage() {
  const { t } = useI18n();

  const features = [
    { icon: Gamepad2, titleKey: 'features.practice.title', descKey: 'features.practice.desc', color: 'emerald', href: '/practice' },
    { icon: Activity, titleKey: 'features.health.title', descKey: 'features.health.desc', color: 'blue', href: '/health' },
    { icon: Radio, titleKey: 'features.signals.title', descKey: 'features.signals.desc', color: 'cyan', href: '/signals' },
    { icon: Crosshair, titleKey: 'features.sniper.title', descKey: 'features.sniper.desc', color: 'amber', href: '/sniper' },
    { icon: Fish, titleKey: 'features.whales.title', descKey: 'features.whales.desc', color: 'violet', href: '/whales' },
    { icon: Brain, titleKey: 'features.review.title', descKey: 'features.review.desc', color: 'rose', href: '/review' },
    { icon: ShieldAlert, titleKey: 'features.guardian.title', descKey: 'features.guardian.desc', color: 'orange', href: '/guardian' },
    { icon: Sparkles, titleKey: 'features.aiStrategy.title', descKey: 'features.aiStrategy.desc', color: 'purple', href: '/ai-strategy' },
    { icon: LineChart, titleKey: 'features.strategy.title', descKey: 'features.strategy.desc', color: 'teal', href: '/strategy' },
    { icon: BarChart3, titleKey: 'features.dashboard.title', descKey: 'features.dashboard.desc', color: 'sky', href: '/dashboard' },
    { icon: Shield, titleKey: 'features.elite.title', descKey: 'features.elite.desc', color: 'emerald', href: '/elite' },
  ];

  const howItWorks = [
    { step: '1', titleKey: 'howItWorks.step1.title', descKey: 'howItWorks.step1.desc', icon: Zap },
    { step: '2', titleKey: 'howItWorks.step2.title', descKey: 'howItWorks.step2.desc', icon: Sparkles },
    { step: '3', titleKey: 'howItWorks.step3.title', descKey: 'howItWorks.step3.desc', icon: TrendingUp },
  ];

  const plans = [
    { nameKey: 'pricing.free', price: '$0', features: ['pricing.free.f1', 'pricing.free.f2', 'pricing.free.f3', 'pricing.free.f4'], ctaKey: 'pricing.cta.free', href: '/trade', color: 'gray' },
    { nameKey: 'pricing.pro', price: '$39.99', features: ['pricing.pro.f1', 'pricing.pro.f2', 'pricing.pro.f3', 'pricing.pro.f4', 'pricing.pro.f5'], ctaKey: 'pricing.cta.pro', href: '/pricing', color: 'emerald', popular: true },
    { nameKey: 'pricing.elite', price: '$79.99', features: ['pricing.elite.f1', 'pricing.elite.f2', 'pricing.elite.f3', 'pricing.elite.f4', 'pricing.elite.f5'], ctaKey: 'pricing.cta.elite', href: '/pricing', color: 'violet' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white pt-16">
      {/* Hero */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> {t('hero.badge')}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {t('hero.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-4">
            {t('hero.subtitle1')}
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-gray-500 mb-10 max-w-3xl mx-auto">
            {t('hero.subtitle2')}
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/health"
              onClick={() => analytics.ctaClick({ cta_id: 'hero_primary', cta_text: 'start_market_health', target: '/health', page: '/', location: 'hero' })}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-900/30">
              {t('hero.cta.primary')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              onClick={() => analytics.ctaClick({ cta_id: 'hero_secondary', cta_text: 'view_pricing', target: '/pricing', page: '/', location: 'hero' })}
              className="inline-flex items-center justify-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
              <Zap className="w-5 h-5 text-emerald-400" /> {t('hero.cta.secondary')}
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }}
            className="text-xs text-gray-600 mt-4">
            {t('hero.trust.noCreditCard')} &nbsp;·&nbsp; {t('hero.trust.fullAccess')} &nbsp;·&nbsp; {t('hero.trust.autoRevert')}
          </motion.p>
        </div>
      </div>

      {/* Decision Workflow */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-5xl mx-auto rounded-3xl border border-gray-800 bg-gray-900/60 p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                <CircleDot className="w-3 h-3" /> {t('workflow.badge')}
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold">{t('workflow.title')}</h2>
              <p className="mt-2 max-w-2xl text-sm md:text-base text-gray-400">
                {t('workflow.desc')}
              </p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200">
              {t('workflow.dashboardLink')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { step: '01', titleKey: 'workflow.step01.title', descKey: 'workflow.step01.desc', href: '/health', icon: Activity, color: 'text-emerald-400' },
              { step: '02', titleKey: 'workflow.step02.title', descKey: 'workflow.step02.desc', href: '/practice', icon: Gamepad2, color: 'text-cyan-400' },
              { step: '03', titleKey: 'workflow.step03.title', descKey: 'workflow.step03.desc', href: '/strategy', icon: Sparkles, color: 'text-violet-400' },
            ].map((item) => (
              <Link key={item.step} href={item.href} className="group rounded-2xl border border-gray-800 bg-black/20 p-5 hover:border-gray-700 hover:bg-black/30 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-[0.2em] text-gray-500">STEP {item.step}</span>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm text-gray-400">{t(item.descKey)}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-200 group-hover:text-white">
                  {t('workflow.stepCta')} <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { n: 1247, s: '+', labelKey: 'social.traders', color: 'text-blue-400' },
            { n: 15328, s: '+', labelKey: 'social.trades', color: 'text-green-400' },
            {n: 12, s: '+', labelKey: 'social.templates', color: 'text-violet-400' },
            { n: 68, s: '%', labelKey: 'social.improvement', color: 'text-amber-400' },
          ].map((d, i) => (
            <div key={i}>
              <div className={`text-3xl md:text-4xl font-bold ${d.color} mb-1`}><CountUpNumber target={d.n} suffix={d.s} /></div>
              <div className="text-xs text-gray-500">{t(d.labelKey)}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Product Screenshot */}
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="container mx-auto px-4 pb-20">
        <div className="max-w-5xl mx-auto relative">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 shadow-2xl">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-700 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600 ml-2">{t('app.name')} · {t('nav.strategy')}</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">{t('screenshot.score')}</span><span className="text-2xl font-bold text-green-400">78</span></div>
                <div className="text-[10px] text-gray-600">{t('screenshot.grade')}</div>
                <div className="mt-3 h-2 bg-gray-800 rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{ width: '78%' }} /></div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">{t('screenshot.profit')}</span><span className="text-2xl font-bold text-green-400">+156.3%</span></div>
                <div className="text-[10px] text-gray-600">{t('screenshot.backtest')}</div>
                <svg viewBox="0 0 200 40" className="w-full mt-2"><path d="M0,35 L20,30 L40,32 L60,25 L80,20 L100,22 L120,15 L140,18 L160,10 L180,8 L200,5" fill="none" stroke="#10b981" strokeWidth="2" /><path d="M0,35 L20,30 L40,32 L60,25 L80,20 L100,22 L120,15 L140,18 L160,10 L180,8 L200,5 V40 H0Z" fill="#10b981" fillOpacity="0.1" /></svg>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-xs text-gray-500 mb-2">{t('screenshot.aiRecommend')}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-gray-400">{t('home.strategyPicks.supertrend')}</span><span className="text-green-400">85</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">{t('home.strategyPicks.dualMaVol')}</span><span className="text-green-400">72</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">{t('home.strategyPicks.channelBreak')}</span><span className="text-yellow-400">58</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl opacity-15 blur-xl -z-10" />
        </div>
      </motion.div>

      {/* Testimonials / Social Proof */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">{t('testimonials.title', 'What Traders Say')}</h2>
        <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">{t('testimonials.subtitle', 'Real feedback from traders who practice with Trading Copilot')}</p>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { quote: t('testimonials.1.quote', "I blew 2 accounts before finding this. The AI coach caught my revenge trading pattern — something no YouTube video ever told me."), author: t('testimonials.1.author', "Alex K."), role: t('testimonials.1.role', "Crypto Swing Trader"), stars: 5 },
            { quote: t('testimonials.2.quote', "The Monte Carlo simulation changed how I think about strategies. Seeing the worst-case scenario before risking real money is invaluable."), author: t('testimonials.2.author', "Maria S."), role: t('testimonials.2.role', "DeFi Trader"), stars: 5 },
            { quote: t('testimonials.3.quote', "I practiced for 3 months on Trading Copilot before going live. My first real month was profitable. Coincidence? I don't think so."), author: t('testimonials.3.author', "David W."), role: t('testimonials.3.role', "Day Trader, 6 months exp"), stars: 5 },
          ].map((t, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                  {t.author[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{t.author}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4">{t('features.title')}</motion.h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">{t('features.subtitle')}</p>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link href={f.href} className={`block bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-${f.color}-500/50 transition-all hover:scale-[1.02] group`}>
                <f.icon className={`w-8 h-8 text-${f.color}-400 mb-3 group-hover:scale-110 transition`} />
                <h3 className="text-lg font-semibold mb-1.5">{t(f.titleKey)}</h3>
                <p className="text-sm text-gray-500">{t(f.descKey)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Course & Toolkit */}
      <div className="container mx-auto px-4 py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4">{t('course.sectionTitle', '学习 & 工具包')}</motion.h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">{t('course.sectionDesc', '系统化学习交易，从入门到进阶')}</p>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Link href="/learn" className="block bg-gradient-to-br from-emerald-900/30 to-gray-900/50 rounded-2xl p-6 border border-emerald-500/30 hover:border-emerald-500/60 transition-all hover:scale-[1.02] group h-full">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-6 h-6 text-emerald-400" />
                <span className="text-xs font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{t('course.free', '免费')}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{t('course.freeTitle', '交易入门课程')}</h3>
              <p className="text-sm text-gray-400 mb-4">{t('course.freeDesc', '6节核心课程，从零开始建立交易认知。技术分析、风险管理、交易心理一网打尽')}</p>
              <ul className="space-y-1.5 text-xs text-gray-500 mb-4">
                <li>✓ {t('course.freeF1', '6节视频课程')}</li><li>✓ {t('course.freeF2', '永久免费观看')}</li><li>✓ {t('course.freeF3', '配套练习题')}</li>
              </ul>
              <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                {t('course.freeCta', '免费开始学习')} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Link href="/course" className="block bg-gradient-to-br from-violet-900/30 to-gray-900/50 rounded-2xl p-6 border border-violet-500/30 hover:border-violet-500/60 transition-all hover:scale-[1.02] group h-full relative">
              <div className="absolute -top-3 right-4 bg-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">{t('course.hot', '热门')}</div>
              <BookOpen className="w-6 h-6 text-violet-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">{t('course.paidTitle', '进阶课程包')}</h3>
              <p className="text-sm text-gray-400 mb-4">{t('course.paidDesc', '深度策略拆解、实战案例分析、蒙特卡洛回测方法论。从入门到盈利的完整路径')}</p>
              <ul className="space-y-1.5 text-xs text-gray-500 mb-4">
                <li>✓ {t('course.paidF1', '20+实战案例')}</li><li>✓ {t('course.paidF2', '终身访问')}</li><li>✓ {t('course.paidF3', '赠送Pro/Elite体验')}</li>
              </ul>
              <span className="inline-flex items-center gap-1 text-violet-400 text-sm font-medium group-hover:gap-2 transition-all">
                {t('course.paidCta', '从 $49 起')} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Link href="/pricing" className="block bg-gradient-to-br from-amber-900/30 to-gray-900/50 rounded-2xl p-6 border border-amber-500/30 hover:border-amber-500/60 transition-all hover:scale-[1.02] group h-full">
              <Package className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="text-xl font-bold mb-2">{t('course.toolkitTitle', 'Pro 工具包')}</h3>
              <p className="text-sm text-gray-400 mb-4">{t('course.toolkitDesc', 'AI策略生成器、参数优化器、Monte Carlo模拟、风控守门员...全套专业工具')}</p>
              <ul className="space-y-1.5 text-xs text-gray-500 mb-4">
                <li>✓ {t('course.toolkitF1', '12+策略模板')}</li><li>✓ {t('course.toolkitF2', 'AI策略生成')}</li><li>✓ {t('course.toolkitF3', '24小时免费试用')}</li>
              </ul>
              <span className="inline-flex items-center gap-1 text-amber-400 text-sm font-medium group-hover:gap-2 transition-all">
                {t('course.toolkitCta', '$39.99/月 起')} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('howItWorks.title')}</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {howItWorks.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }} className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">{item.step}</div>
              <item.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">{t(item.titleKey)}</h3>
              <p className="text-gray-500 text-sm">{t(item.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Preview */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">{t('pricing.title')}</h2>
        <p className="text-gray-500 text-center mb-10">{t('pricing.subtitle')}</p>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`bg-gray-900/50 border ${p.popular ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-gray-800'} rounded-2xl p-6 relative`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">{t('pricing.popular')}</div>}
              <h3 className="text-lg font-bold mb-1">{t(p.nameKey)}</h3>
              <div className="mb-4"><span className="text-3xl font-bold">{p.price}</span>{p.price !== '$0' && <span className="text-gray-500 text-sm">{t('pricing.perMonth')}</span>}</div>
              <ul className="space-y-2 mb-6">
                {p.features.map(fk => <li key={fk} className="flex items-center gap-2 text-sm text-gray-400"><span className={`text-${p.color}-400`}>✓</span>{t(fk)}</li>)}
              </ul>
              <Link href={p.href} className={`block w-full py-2.5 rounded-xl text-sm font-medium text-center transition ${
                p.popular ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : p.color === 'violet' ? 'bg-violet-600/20 text-violet-400 hover:bg-violet-600/30' : 'bg-gray-800 text-gray-400'
              }`}>{t(p.ctaKey)}</Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pain Points */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-gray-900/50 rounded-2xl p-8 md:p-12 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('pain.title')}</h2>
          <div className="space-y-3 text-gray-300 mb-8">
            {['pain.p1', 'pain.p2', 'pain.p3', 'pain.p4'].map(k => (
              <p key={k} className="flex items-center gap-3 text-sm"><span className="text-red-400">❌</span>{t(k)}</p>
            ))}
          </div>
          <div className="pt-6 border-t border-gray-800">
            <p className="text-center text-emerald-400 font-semibold mb-4">{t('pain.solution')}</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-400">
              {['pain.s1', 'pain.s2', 'pain.s3', 'pain.s4'].map(k => (
                <p key={k} className="flex items-center gap-2"><span className="text-green-400">✓</span>{t(k)}</p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQ */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('faq.title')}</h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {[1,2,3,4,5].map(n => (
            <FAQItem key={n} question={t(`faq.q${n}`)} answer={t(`faq.a${n}`)} />
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
        className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
        <p className="text-gray-500 mb-8">{t('cta.subtitle')}</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all hover:scale-105">
          {t('cta.button')} <ArrowRight className="w-6 h-6" />
        </Link>
      </motion.div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-center text-gray-600 text-sm">
        <p>{t('app.name')} — {t('app.tagline')}</p>
        <p className="mt-1">{t('app.disclaimer')}</p>
      </footer>
    </div>
  );
}
