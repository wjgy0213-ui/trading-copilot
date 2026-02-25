'use client';

import Link from 'next/link';
import { ArrowRight, Target, TrendingUp, Brain, BarChart3, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// 数字滚动动画组件
function CountUpNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2秒
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// FAQ 折叠面板
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition"
      >
        <span className="font-medium text-gray-200">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white pt-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent"
          >
            交易陪练
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-4"
          >
            从韭菜到交易者的第一步
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            在真实价格环境下进行零风险模拟交易，教练实时评分，帮你建立交易纪律，告别情绪化操作
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link 
              href="/trade" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              开始练习
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Social Proof - 数字滚动 */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 pb-16"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">
              <CountUpNumber target={1247} suffix="+" />
            </div>
            <div className="text-sm text-gray-400">练习交易者</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">
              <CountUpNumber target={15328} suffix="+" />
            </div>
            <div className="text-sm text-gray-400">模拟交易</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">
              <CountUpNumber target={68} suffix="%" />
            </div>
            <div className="text-sm text-gray-400">平均提升</div>
          </div>
        </div>
      </motion.div>

      {/* Product Screenshot Mock */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 pb-16"
      >
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-8 shadow-2xl">
            {/* Mock Trading Interface */}
            <div className="space-y-4">
              {/* Mock Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm text-gray-500">交易陪练 · Demo</div>
              </div>

              {/* Mock Content */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Mock Chart */}
                <div className="bg-gray-900/50 rounded-lg p-4 h-48 flex items-center justify-center border border-gray-700">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-2 opacity-50" />
                    <div className="text-sm text-gray-500">实时价格图表</div>
                  </div>
                </div>

                {/* Mock Trading Panel */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 space-y-3">
                  <div className="h-8 bg-blue-600/30 rounded"></div>
                  <div className="h-8 bg-gray-700/50 rounded"></div>
                  <div className="h-8 bg-gray-700/50 rounded"></div>
                  <div className="h-10 bg-green-600/50 rounded"></div>
                </div>
              </div>

              {/* Mock Coach */}
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 mb-2">教练建议</div>
                    <div className="h-3 bg-gray-700/50 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl opacity-20 blur-xl -z-10"></div>
          </div>
        </div>
      </motion.div>

      {/* How It Works - 3步流程 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">3步开始练习</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: '选择币种', desc: 'BTC、ETH、SOL真实价格', icon: Target },
            { step: '2', title: '模拟交易', desc: '设置止损止盈，开多或开空', icon: TrendingUp },
            { step: '3', title: '教练评分', desc: '每笔交易即时反馈建议', icon: Brain },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <item.icon className="w-10 h-10 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Target, title: '纸盘交易', description: '虚拟$500账户，接入真实BTC价格，模拟开仓/平仓，零风险练习' },
            { icon: Brain, title: '教练', description: '每笔交易即时评分，分析止损、仓位、杠杆，指出情绪化操作' },
            { icon: TrendingUp, title: '风险管理', description: '支持止损止盈、1-10x杠杆，学习如何控制风险和资金管理' },
            { icon: BarChart3, title: '复盘日志', description: '查看历史交易、胜率、盈亏比、最大回撤，系统化提升' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="max-w-3xl mx-auto bg-gray-800/50 rounded-2xl p-8 md:p-12 border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">为什么需要交易陪练？</h2>
          <div className="space-y-4 text-gray-300">
            <p className="flex items-start gap-3">
              <span className="text-red-400 text-xl">❌</span>
              <span>看着别人晒单心动，冲动梭哈结果爆仓</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-red-400 text-xl">❌</span>
              <span>没有止损概念，亏损时死扛，盈利时却提前跑路</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-red-400 text-xl">❌</span>
              <span>高杠杆赌方向，一次失误血本无归</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-red-400 text-xl">❌</span>
              <span>没有交易记录和复盘，同样的错误反复犯</span>
            </p>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-center text-lg text-blue-400 font-semibold mb-4">
              💡 交易陪练帮你建立纪律
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>零成本模拟真实交易环境</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>实时评分，纠正坏习惯</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>强制设置止损，学习风控</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>记录每笔交易，系统化复盘</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <FAQItem
            question="这是真钱交易吗？"
            answer="不是！这是100%模拟交易环境。你的初始账户是虚拟的$500，价格是真实的（来自市场API），但所有交易都是模拟的，不会产生任何真实资金损失。"
          />
          <FAQItem
            question="需要注册登录吗？"
            answer="不需要。为了让你快速开始练习，我们采用本地存储方案，所有数据保存在你的浏览器里。缺点是换设备后数据不同步，优点是隐私100%安全。"
          />
          <FAQItem
            question="教练是如何评分的？"
            answer="教练会从4个维度评估你的交易：止损设置（有没有设、位置合理性）、仓位大小（是否过度集中）、杠杆使用（新手是否过高）、持仓时间（是否过于频繁）。每笔交易会给出0-100分和具体改进建议。"
          />
          <FAQItem
            question="练习多久可以实盘？"
            answer="建议至少完成50笔交易，胜率达到55%以上，且理解了止损、仓位管理的重要性后再考虑实盘。记住：模拟盈利不代表实盘一定盈利，但模拟都亏的话实盘必亏。"
          />
          <FAQItem
            question="支持哪些交易品种？"
            answer="目前支持BTC、ETH、SOL三个主流币种，价格每10秒更新一次（模拟真实市场波动）。未来会加入更多币种和股票市场。"
          />
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
        <p className="text-gray-400 mb-8">不需要登录，不需要绑卡，立即开始免费练习</p>
        <Link 
          href="/trade" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-lg text-xl font-semibold transition-all transform hover:scale-105"
        >
          开始交易
          <ArrowRight className="w-6 h-6" />
        </Link>
      </motion.div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-center text-gray-500">
        <p>交易陪练 - 帮助韭菜觉醒者建立交易纪律</p>
        <p className="text-sm mt-2">⚠️ 本工具仅用于教育目的，不构成投资建议</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover:transform hover:scale-105">
      <div className="text-blue-400 mb-4"><Icon className="w-10 h-10" /></div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
