'use client';

import Link from 'next/link';
import { ArrowRight, Target, TrendingUp, Brain, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            交易陪练AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            从韭菜到交易者的第一步
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            在真实价格环境下进行零风险模拟交易，AI教练实时评分，帮你建立交易纪律，告别情绪化操作
          </p>
          
          <Link 
            href="/trade" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
          >
            开始练习
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Target className="w-10 h-10" />}
            title="纸盘交易"
            description="虚拟$500账户，接入真实BTC价格，模拟开仓/平仓，零风险练习"
          />
          
          <FeatureCard 
            icon={<Brain className="w-10 h-10" />}
            title="AI教练"
            description="每笔交易即时评分，分析止损、仓位、杠杆，指出情绪化操作"
          />
          
          <FeatureCard 
            icon={<TrendingUp className="w-10 h-10" />}
            title="风险管理"
            description="支持止损止盈、1-10x杠杆，学习如何控制风险和资金管理"
          />
          
          <FeatureCard 
            icon={<BarChart3 className="w-10 h-10" />}
            title="复盘日志"
            description="查看历史交易、胜率、盈亏比、最大回撤，系统化提升"
          />
        </div>
      </div>

      {/* Why Section */}
      <div className="container mx-auto px-4 py-16">
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
              💡 交易陪练AI帮你建立纪律
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>零成本模拟真实交易环境</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>AI实时评分，纠正坏习惯</span>
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
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
        <p className="text-gray-400 mb-8">不需要登录，不需要绑卡，立即开始免费练习</p>
        <Link 
          href="/trade" 
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-lg text-xl font-semibold transition-all transform hover:scale-105"
        >
          开始交易
          <ArrowRight className="w-6 h-6" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800 text-center text-gray-500">
        <p>交易陪练AI - 帮助韭菜觉醒者建立交易纪律</p>
        <p className="text-sm mt-2">⚠️ 本工具仅用于教育目的，不构成投资建议</p>
        <div className="flex justify-center gap-4 mt-4 text-sm">
          <Link href="/trade" className="hover:text-blue-400 transition">模拟交易</Link>
          <span>|</span>
          <Link href="/learn" className="hover:text-blue-400 transition">📚 入门课程</Link>
          <span>|</span>
          <Link href="/history" className="hover:text-blue-400 transition">交易记录</Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
      <div className="text-blue-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
