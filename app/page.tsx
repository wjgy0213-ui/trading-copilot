'use client';

import Link from 'next/link';
import { ArrowRight, Target, TrendingUp, Brain, BarChart3, ChevronDown, Sparkles, Shield, Zap, Crown, LineChart, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white pt-16">
      {/* Hero */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI驱动的交易陪练系统
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            从韭菜到交易者
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-4">
            零风险练习 · AI实时评分 · 策略回测 · 参数优化
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            不是冷冰冰的工具，是从零到盈利的AI陪练。在真实价格环境下练习，建立交易纪律，告别情绪化操作
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/strategy" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-900/30">
              免费体验 Pro 24小时 <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/trade" className="inline-flex items-center justify-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 border border-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
              <Zap className="w-5 h-5 text-emerald-400" /> 开始练习交易
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }}
            className="text-xs text-gray-600 mt-4">
            ✓ 无需信用卡 &nbsp;·&nbsp; ✓ 24小时全功能体验 &nbsp;·&nbsp; ✓ 到期自动恢复免费版
          </motion.p>
        </div>
      </div>

      {/* Social Proof */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-6 text-center">
          {[
            { n: 1247, s: '+', label: '练习交易者', color: 'text-blue-400' },
            { n: 15328, s: '+', label: '模拟交易', color: 'text-green-400' },
            { n: 8, s: '', label: '策略模板', color: 'text-violet-400' },
            { n: 68, s: '%', label: '平均提升', color: 'text-amber-400' },
          ].map((d, i) => (
            <div key={i}>
              <div className={`text-3xl md:text-4xl font-bold ${d.color} mb-1`}><CountUpNumber target={d.n} suffix={d.s} /></div>
              <div className="text-xs text-gray-500">{d.label}</div>
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
              <span className="text-xs text-gray-600 ml-2">交易陪练 · 策略工坊</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">综合评分</span><span className="text-2xl font-bold text-green-400">78</span></div>
                <div className="text-[10px] text-gray-600">A级 · 优秀</div>
                <div className="mt-3 h-2 bg-gray-800 rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{ width: '78%' }} /></div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">总收益</span><span className="text-2xl font-bold text-green-400">+156.3%</span></div>
                <div className="text-[10px] text-gray-600">90天回测 · BTC/USDT</div>
                <svg viewBox="0 0 200 40" className="w-full mt-2"><path d="M0,35 L20,30 L40,32 L60,25 L80,20 L100,22 L120,15 L140,18 L160,10 L180,8 L200,5" fill="none" stroke="#10b981" strokeWidth="2" /><path d="M0,35 L20,30 L40,32 L60,25 L80,20 L100,22 L120,15 L140,18 L160,10 L180,8 L200,5 V40 H0Z" fill="#10b981" fillOpacity="0.1" /></svg>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-xs text-gray-500 mb-2">AI策略推荐</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-gray-400">🚀 Supertrend</span><span className="text-green-400">评分 85</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">📊 双均线+量能</span><span className="text-green-400">评分 72</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">🔔 通道突破</span><span className="text-yellow-400">评分 58</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl opacity-15 blur-xl -z-10" />
        </div>
      </motion.div>

      {/* Features Grid - 6 features */}
      <div className="container mx-auto px-4 py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4">完整的交易学习系统</motion.h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">从练习到策略到实盘，每一步都有AI陪你</p>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Target, title: '纸盘交易', desc: '真实价格，虚拟资金，零风险练手', color: 'emerald', href: '/trade' },
            { icon: Brain, title: 'AI教练', desc: '每笔交易即时评分，纠正坏习惯', color: 'blue', href: '/trade' },
            { icon: Sparkles, title: 'AI策略生成', desc: '自然语言描述，AI帮你创建策略', color: 'violet', href: '/ai-strategy' },
            { icon: LineChart, title: '策略工坊', desc: '8大策略模板，高级回测引擎', color: 'cyan', href: '/strategy' },
            { icon: Search, title: '参数优化器', desc: '自动寻找最优参数组合', color: 'amber', href: '/strategy' },
            { icon: BarChart3, title: '数据仪表盘', desc: '实时ITC风险、Fear指数、TVL', color: 'rose', href: '/dashboard' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link href={f.href} className={`block bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-${f.color}-500/50 transition-all hover:scale-[1.02] group`}>
                <f.icon className={`w-8 h-8 text-${f.color}-400 mb-3 group-hover:scale-110 transition`} />
                <h3 className="text-lg font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">3步开始</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: '免费练习', desc: '虚拟$500账户，真实BTC/ETH/SOL价格', icon: Zap },
            { step: '2', title: 'AI生成策略', desc: '描述想法，AI帮你创建可回测的策略', icon: Sparkles },
            { step: '3', title: '回测验证', desc: '历史数据回测，优化参数，找到最优解', icon: TrendingUp },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }} className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">{item.step}</div>
              <item.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Preview */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">选择你的计划</h2>
        <p className="text-gray-500 text-center mb-10">免费开始，随时升级</p>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { name: '免费版', price: '$0', features: ['模拟交易', '3个基础策略', 'AI教练', '基础仪表盘'], cta: '开始练习', href: '/trade', color: 'gray' },
            { name: 'Pro', price: '$39.99', features: ['AI策略生成', '8大策略模板', '参数优化器', '高级回测', '回测报告导出'], cta: '升级 Pro', href: '/pricing', color: 'emerald', popular: true },
            { name: 'Elite', price: '$79.99', features: ['Pro全部功能', '实盘自动化', '风控系统', 'Telegram通知', '优先支持'], cta: '升级 Elite', href: '/pricing', color: 'violet' },
          ].map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`bg-gray-900/50 border ${p.popular ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-gray-800'} rounded-2xl p-6 relative`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">最受欢迎</div>}
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <div className="mb-4"><span className="text-3xl font-bold">{p.price}</span>{p.price !== '$0' && <span className="text-gray-500 text-sm">/月</span>}</div>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-gray-400"><span className={`text-${p.color}-400`}>✓</span>{f}</li>)}
              </ul>
              <Link href={p.href} className={`block w-full py-2.5 rounded-xl text-sm font-medium text-center transition ${
                p.popular ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : p.color === 'violet' ? 'bg-violet-600/20 text-violet-400 hover:bg-violet-600/30' : 'bg-gray-800 text-gray-400'
              }`}>{p.cta}</Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pain Points */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-gray-900/50 rounded-2xl p-8 md:p-12 border border-gray-800">
          <h2 className="text-2xl font-bold mb-6 text-center">为什么需要交易陪练？</h2>
          <div className="space-y-3 text-gray-300 mb-8">
            {['看着别人晒单心动，冲动梭哈结果爆仓', '没有止损概念，亏损死扛，盈利提前跑', '高杠杆赌方向，一次失误血本无归', '没有记录和复盘，同样的错误反复犯'].map(t => (
              <p key={t} className="flex items-center gap-3 text-sm"><span className="text-red-400">❌</span>{t}</p>
            ))}
          </div>
          <div className="pt-6 border-t border-gray-800">
            <p className="text-center text-emerald-400 font-semibold mb-4">💡 交易陪练帮你建立纪律</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-400">
              {['零成本模拟真实交易环境', 'AI实时评分，纠正坏习惯', '8种策略模板+参数优化', '记录每笔交易，系统化复盘'].map(t => (
                <p key={t} className="flex items-center gap-2"><span className="text-green-400">✓</span>{t}</p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQ */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {[
            { q: '这是真钱交易吗？', a: '不是！100%模拟交易。虚拟$500账户，真实市场价格，零风险。' },
            { q: '需要注册吗？', a: '不需要。数据存浏览器本地，随时开始。Pro功能需要邮箱订阅。' },
            { q: 'AI策略生成器怎么用？', a: '用自然语言描述你的交易想法，如"保守的趋势跟踪策略"，AI会匹配最佳策略模板并调整参数。' },
            { q: '练习多久可以实盘？', a: '建议至少50笔模拟交易，胜率55%+，理解止损和仓位管理后再考虑。' },
            { q: '可以随时取消订阅吗？', a: '可以，Stripe处理支付，随时取消，当前周期内仍可使用全部功能。' },
          ].map(f => <FAQItem key={f.q} question={f.q} answer={f.a} />)}
        </div>
      </div>

      {/* Final CTA */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
        className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">准备好了吗？</h2>
        <p className="text-gray-500 mb-8">不需要登录，不需要绑卡，现在就开始</p>
        <Link href="/trade" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-10 py-5 rounded-xl text-xl font-semibold transition-all hover:scale-105">
          开始交易 <ArrowRight className="w-6 h-6" />
        </Link>
      </motion.div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-center text-gray-600 text-sm">
        <p>交易陪练 — AI驱动的交易学习系统</p>
        <p className="mt-1">⚠️ 本工具仅用于教育目的，不构成投资建议</p>
      </footer>
    </div>
  );
}
