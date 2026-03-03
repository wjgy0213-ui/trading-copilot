'use client';

import { useState } from 'react';
import { useSession } from '@/lib/useSession';
import { BookOpen, Check, Crown, Shield, Star, Zap, Users, Clock, ArrowRight, Loader2 } from 'lucide-react';

const PLANS = [
  {
    id: 'basic',
    name: '课程基础版',
    price: 49,
    originalPrice: 69,
    eliteMonths: 1,
    eliteLabel: '1个月Pro',
    features: ['全部课程终身访问', '8大策略模板库', '课程进度追踪', '社区讨论权限', '1个月Pro体验'],
    icon: BookOpen,
    color: 'emerald',
    gradient: 'from-emerald-600 to-cyan-600',
  },
  {
    id: 'bundle',
    name: '课程+工具包',
    price: 99,
    originalPrice: 149,
    eliteMonths: 3,
    eliteLabel: '3个月Elite',
    popular: true,
    features: ['全部课程终身访问', '8大策略模板库', '实战案例集（20+真实交易）', '蒙特卡洛回测模板', '课程进度追踪', '3个月Elite体验'],
    icon: Crown,
    color: 'violet',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    id: 'vip',
    name: '全家桶VIP',
    price: 149,
    originalPrice: 249,
    eliteMonths: 6,
    eliteLabel: '6个月Elite',
    features: ['全部课程终身访问', '8大策略模板库', '实战案例集（20+真实交易）', '蒙特卡洛回测模板', '1v1策略复盘（月度）', '专属VIP交流群', '6个月Elite体验', '新课程优先体验'],
    icon: Shield,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
  },
];

const STATS = { students: 127, rating: 4.8, chapters: 24, hours: 12 };

export default function CoursePage() {
  const { session, hasCourse } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleBuy = async (planId: string) => {
    const userEmail = session?.email || email;
    if (!userEmail) return;
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
          <h1 className="text-2xl font-bold text-white mb-2">你已拥有课程</h1>
          <p className="text-gray-500 mb-6">所有课程内容已解锁，开始学习吧！</p>
          <a href="/learn" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500">
            继续学习 <ArrowRight className="w-4 h-4" />
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
          <Star className="w-4 h-4" /> 早鸟优惠 · 限前100名
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          从韭菜到<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">系统化交易者</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          完整的交易学习路径。不是教你发财，是教你不再亏钱。
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-12">
          {[
            { icon: Users, label: '学员', value: `${STATS.students}+` },
            { icon: Star, label: '评分', value: `${STATS.rating}/5` },
            { icon: BookOpen, label: '章节', value: `${STATS.chapters}章` },
            { icon: Clock, label: '时长', value: `${STATS.hours}h+` },
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
              placeholder="输入邮箱开始购买"
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
                  最受欢迎
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-${plan.color}-500/10 text-${plan.color}-400`}>
                    送{plan.eliteLabel}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-lg text-gray-600 line-through">${plan.originalPrice}</span>
                  <span className="text-xs text-emerald-400 font-medium">
                    省${plan.originalPrice - plan.price}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">一次付清 · 终身访问</div>
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
                disabled={loading !== null || (!session && !email)}
                className={`w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all ${
                  plan.popular
                    ? 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/30'
                    : 'bg-gray-800 hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                {loading === plan.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />处理中...</>
                ) : (
                  <>立即购买 <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Course Content Preview */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">课程大纲</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { module: '模块一', title: '交易基础', chapters: '6章', desc: '市场结构、K线、趋势识别' },
            { module: '模块二', title: '技术分析', chapters: '6章', desc: '支撑阻力、指标体系、形态分析' },
            { module: '模块三', title: '策略构建', chapters: '6章', desc: '回测方法、参数优化、风险管理' },
            { module: '模块四', title: '心态与纪律', chapters: '6章', desc: '情绪管理、交易日志、持续进化' },
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

      {/* Guarantees */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 text-center">
          <Zap className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">7天无理由退款</h3>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            购买后7天内，如果觉得不适合你，全额退款，无需理由。
            课程是用来帮你成长的，不是用来绑架你的。
          </p>
        </div>
      </div>
    </div>
  );
}
