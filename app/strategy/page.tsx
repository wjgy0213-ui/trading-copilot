'use client';

import { useState } from 'react';
import { Brain, Zap, Shield, Lock, ChevronRight, Sparkles, BarChart3, Bot, ArrowRight, Check, Star } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: '定制策略生成',
    titleEn: 'Custom Strategy Builder',
    desc: '用自然语言描述你的交易想法，系统自动生成可执行策略。不需要任何编程知识。',
    preview: [
      { role: 'user', text: '"4小时EMA金叉做多，RSI超买时出场，止损2%"' },
      { role: 'system', text: '已生成策略：EMA(9,21) Cross + RSI(70) Exit\n入场：EMA9上穿EMA21\n出场：RSI>70 或 止损-2%\n回测胜率：62.3% | 盈亏比：1.8' },
    ],
  },
  {
    icon: BarChart3,
    title: '高级回测引擎',
    titleEn: 'Advanced Backtesting',
    desc: '手续费模拟、滑点计算、Monte Carlo验证、多币种同时回测、策略A/B对比。',
    highlights: ['真实手续费 (0.04%-0.1%)', '滑点模拟', 'Monte Carlo 1000次', '策略对比视图', 'PDF报告导出'],
  },
  {
    icon: Bot,
    title: '实盘自动化交易',
    titleEn: 'Live Auto-Trading',
    desc: '回测验证过的策略一键接入实盘。支持币安、OKX、Bybit。强制风控保护你的资金。',
    highlights: ['一键从纸盘切实盘', '每日亏损上限', '紧急停止按钮', 'Telegram实时通知', '交易日志自动记录'],
  },
];

const PLANS = [
  {
    name: '免费版',
    nameEn: 'Free',
    price: '$0',
    period: '永久',
    features: ['模拟交易 + 教练评分', '3个基础策略回测', '基础仪表盘 (12指标)', '入门课程 (25课)', '每日市场资讯'],
    cta: '当前计划',
    disabled: true,
    popular: false,
  },
  {
    name: 'Pro',
    nameEn: 'Pro',
    price: '$29',
    period: '/月',
    features: ['定制策略生成 (无限)', '高级回测引擎', '手续费+滑点模拟', 'Monte Carlo验证', '策略A/B对比', 'PDF报告导出', '优先客服支持'],
    cta: '即将上线',
    disabled: true,
    popular: true,
  },
  {
    name: 'Elite',
    nameEn: 'Elite',
    price: '$49',
    period: '/月',
    features: ['Pro全部功能', '实盘自动化交易', '交易所API对接', '风控系统 (熔断+止损)', 'Telegram实时通知', '专属策略优化建议', '1对1策略咨询'],
    cta: '即将上线',
    disabled: true,
    popular: false,
  },
];

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <div className="border border-gray-800 rounded-xl p-6 bg-gray-900/30 hover:bg-gray-900/60 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-100">{feature.title}</h3>
          <p className="text-[10px] text-gray-500">{feature.titleEn}</p>
        </div>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed mb-4">{feature.desc}</p>

      {/* Chat preview for strategy builder */}
      {'preview' in feature && feature.preview && (
        <div className="bg-gray-950 rounded-lg p-3 space-y-2.5 border border-gray-800">
          {feature.preview.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                msg.role === 'user' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-300'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Highlights list */}
      {'highlights' in feature && feature.highlights && (
        <div className="space-y-1.5">
          {feature.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              {h}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StrategyPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
          <Sparkles className="w-3 h-3" />
          即将上线
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          策略工坊
        </h1>
        <p className="text-lg text-gray-400 mb-2">从想法到实盘，一站式完成</p>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">
          用自然语言描述策略 → 系统自动生成 → 高级回测验证 → 一键接入实盘。
          全程不需要写一行代码。
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {FEATURES.map((f, i) => (
          <FeatureCard key={i} feature={f} index={i} />
        ))}
      </div>

      {/* Flow */}
      <div className="mb-12 border border-gray-800 rounded-xl p-6 bg-gray-900/20">
        <h2 className="text-center text-sm font-semibold text-gray-300 mb-6">完整工作流</h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { icon: Brain, label: '描述策略' },
            { icon: Sparkles, label: '生成代码' },
            { icon: BarChart3, label: '回测验证' },
            { icon: Shield, label: '风控设置' },
            { icon: Bot, label: '实盘运行' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] text-gray-500">{step.label}</span>
              </div>
              {i < 4 && <ArrowRight className="w-4 h-4 text-gray-700 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-12">
        <h2 className="text-center text-sm font-semibold text-gray-300 mb-6">选择你的计划</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.name} className={`border rounded-xl p-5 relative ${
              plan.popular ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-800 bg-gray-900/30'
            }`}>
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-black text-[10px] font-bold rounded-full flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" /> 推荐
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-200">{plan.name}</h3>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-3xl font-mono font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-gray-500">{plan.period}</span>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-xs text-gray-400">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
              </div>
              <button disabled={plan.disabled}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                  plan.popular
                    ? 'bg-emerald-600 text-white opacity-60 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist */}
      <div className="text-center border border-gray-800 rounded-xl p-8 bg-gray-900/20">
        <Lock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-200 mb-2">加入等待列表</h2>
        <p className="text-sm text-gray-500 mb-5">策略工坊正在内测中。留下邮箱，上线第一时间通知你。</p>
        {submitted ? (
          <div className="text-emerald-400 text-sm font-medium">已加入等待列表！我们会尽快通知你。</div>
        ) : (
          <div className="flex gap-2 max-w-md mx-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button onClick={() => { if(email) setSubmitted(true); }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all">
              加入
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
