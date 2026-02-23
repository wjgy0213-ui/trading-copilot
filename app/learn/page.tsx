'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Shield, Brain, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const lessons = [
  {
    id: 'mindset',
    icon: <Brain className="w-8 h-8" />,
    title: '第一课：交易心态',
    subtitle: '90%的亏损来自心态问题',
    content: [
      {
        heading: '为什么大多数人亏钱？',
        text: '不是技术不行，是心态崩了。贪婪让你重仓追高，恐惧让你割在最低点。交易的本质是概率游戏，但人的情绪会严重扭曲判断。',
      },
      {
        heading: '情绪化交易的特征',
        bullets: [
          '亏损后立刻加仓想回本（报复性交易）',
          '看到别人赚钱就FOMO冲进去',
          '赚了一点就急着跑，亏了却死扛不止损',
          '频繁交易，一天开几十个仓位',
          '盈利时觉得自己是天才，亏损时怀疑人生',
        ],
      },
      {
        heading: '正确的交易心态',
        bullets: [
          '接受亏损是交易的一部分——每笔交易都可能亏',
          '关注过程而非结果——执行纪律比赚钱重要',
          '做好亏光的准备——只用输得起的钱交易',
          '耐心等待机会——没有信号就不开仓',
          '活下来 > 赚钱——保住本金永远是第一位',
        ],
      },
    ],
    keyTakeaway: '交易不是赌博。赌徒追求每一把都赢，交易者追求长期正期望值。',
  },
  {
    id: 'risk',
    icon: <Shield className="w-8 h-8" />,
    title: '第二课：风险管理',
    subtitle: '活下来才能赚到钱',
    content: [
      {
        heading: '单笔风险控制',
        text: '每笔交易的最大亏损不应超过账户的2-5%。这意味着即使连亏10次，你的账户还能存活。',
      },
      {
        heading: '止损的重要性',
        text: '止损不是认输，是保护。没有止损的交易就像没有刹车的车——迟早出事。每笔交易开仓前，先确定止损位，再计算仓位大小。',
        bullets: [
          '止损 = 你承受的最大亏损，不是随便设个数字',
          '仓位大小 = 可承受亏损 ÷ (入场价 - 止损价)',
          '止损设在逻辑失效处，不是心理舒适点',
          '设了止损就不要移动（除非往盈利方向移）',
        ],
      },
      {
        heading: '杠杆是双刃剑',
        text: '3x杠杆意味着价格波动3%你就亏9%。新手建议从1-3x开始，永远不要用超过10x的杠杆。',
        bullets: [
          '1x = 现货等效，最安全',
          '2-3x = 适合有经验的交易者',
          '5-10x = 高风险，需要精确止损',
          '20x+ = 赌博，99%的人都会爆仓',
        ],
      },
      {
        heading: '资金管理公式',
        text: '假设账户$500，单笔风险3%=$15。如果止损距离是2%，那么：仓位=$15÷2%=$750。用3x杠杆，投入=$250。',
      },
    ],
    keyTakeaway: '风险管理的核心：活下来。只要账户还在，就永远有翻盘的机会。',
  },
  {
    id: 'entry',
    icon: <Target className="w-8 h-8" />,
    title: '第三课：入场与出场',
    subtitle: '会买的是徒弟，会卖的是师傅',
    content: [
      {
        heading: '什么时候该入场？',
        text: '好的入场需要"理由"，而不是"感觉"。入场前问自己三个问题：',
        bullets: [
          '趋势方向是什么？（顺势交易成功率更高）',
          '我的止损在哪？（入场前必须知道出场点）',
          '盈亏比是多少？（至少1:2，即赚2亏1）',
        ],
      },
      {
        heading: '盈亏比（Risk/Reward）',
        text: '盈亏比是交易的核心概念。如果你的止损是$10，目标利润应该至少$20（1:2）。这样即使只有40%胜率，长期也是赚钱的。',
        bullets: [
          '1:1 = 需要超过50%胜率才能盈利',
          '1:2 = 34%胜率就能盈利',
          '1:3 = 26%胜率就能盈利',
          '盈亏比越高，对胜率要求越低',
        ],
      },
      {
        heading: '什么时候该出场？',
        bullets: [
          '触发止损 → 无条件执行，不犹豫',
          '达到目标位 → 可以部分止盈',
          '入场逻辑失效 → 趋势反转或关键支撑/阻力被突破',
          '时间止损 → 持仓太久没动静，可能判断错了',
        ],
      },
    ],
    keyTakeaway: '入场有理由，出场有纪律。每笔交易都是一个假设——当假设被否定时，果断离场。',
  },
  {
    id: 'journal',
    icon: <BookOpen className="w-8 h-8" />,
    title: '第四课：交易日志',
    subtitle: '不复盘的交易者注定重复犯错',
    content: [
      {
        heading: '为什么需要交易日志？',
        text: '人的记忆会美化或扭曲过去。没有记录，你永远不知道自己的真实胜率、平均盈亏比、最大连亏。交易日志是你进步的唯一证据。',
      },
      {
        heading: '记录什么？',
        bullets: [
          '入场时间、价格、方向、仓位大小',
          '止损和目标位',
          '入场理由（用文字描述你的逻辑）',
          '出场时间、价格、盈亏',
          '出场理由（止损？止盈？手动？为什么？）',
          '当时的情绪状态（冷静？焦虑？兴奋？）',
          '事后复盘（做对了什么？做错了什么？）',
        ],
      },
      {
        heading: '如何复盘？',
        bullets: [
          '每周回顾所有交易，找出重复的错误',
          '统计胜率、盈亏比、最大回撤',
          '标记情绪化交易，分析触发原因',
          '好交易不一定赚钱，坏交易不一定亏钱——关注执行质量',
        ],
      },
    ],
    keyTakeaway: '交易陪练AI会自动帮你记录和分析每笔交易。但你需要养成复盘的习惯——这是从韭菜变成交易者的分水岭。',
  },
  {
    id: 'common-mistakes',
    icon: <AlertTriangle className="w-8 h-8" />,
    title: '第五课：新手常见错误',
    subtitle: '别人踩过的坑，你不用再踩',
    content: [
      {
        heading: '❌ 错误1：满仓梭哈',
        text: '把所有钱押在一笔交易上。一次对了赚100%，一次错了亏100%。这不是交易，是赌博。',
      },
      {
        heading: '❌ 错误2：频繁交易',
        text: '一天开几十个仓位，手续费吃掉所有利润。很多人纸盘能赚钱，实盘亏钱——手续费是隐形杀手。',
      },
      {
        heading: '❌ 错误3：移动止损',
        text: '价格快到止损了，把止损往下移"再给它一次机会"。这样做的结果：小亏变大亏，大亏变爆仓。',
      },
      {
        heading: '❌ 错误4：盈利太早跑',
        text: '赚了$10就急着平仓，怕利润回吐。但亏了$50还死扛。长期下来必然亏损。',
      },
      {
        heading: '❌ 错误5：逆势交易',
        text: '看到暴跌就抄底，看到暴涨就做空。"我觉得到顶了"——你觉得的不重要，趋势说了算。',
      },
      {
        heading: '❌ 错误6：不看大周期',
        text: '在1分钟图上做多，但日线是下跌趋势。小周期的信号在大趋势面前毫无意义。',
      },
    ],
    keyTakeaway: '所有错误的根源：没有交易计划，或者有计划但不执行。交易陪练AI的目标就是帮你建立并执行纪律。',
  },
];

export default function LearnPage() {
  const [activeLesson, setActiveLesson] = useState(0);
  const lesson = lessons[activeLesson];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </Link>
          <h1 className="text-lg font-semibold">📚 交易入门课程</h1>
          <Link href="/trade" className="text-blue-400 hover:text-blue-300 text-sm">
            开始练习 →
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 space-y-2">
            {lessons.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setActiveLesson(i)}
                className={`w-full text-left px-4 py-3 rounded-lg transition text-sm ${
                  i === activeLesson
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="font-medium">{l.title}</div>
                <div className="text-xs mt-1 opacity-70">{l.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl">
          {/* Mobile lesson selector */}
          <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
            {lessons.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setActiveLesson(i)}
                className={`shrink-0 px-3 py-2 rounded-lg text-sm ${
                  i === activeLesson ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="text-blue-400">{lesson.icon}</div>
            <div>
              <h2 className="text-3xl font-bold">{lesson.title}</h2>
              <p className="text-gray-400 mt-1">{lesson.subtitle}</p>
            </div>
          </div>

          <div className="space-y-8">
            {lesson.content.map((section, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-3">{section.heading}</h3>
                {section.text && <p className="text-gray-300 leading-relaxed mb-4">{section.text}</p>}
                {section.bullets && (
                  <ul className="space-y-2">
                    {section.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-300">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Key Takeaway */}
          <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <p className="text-blue-400 font-semibold mb-2">💡 核心要点</p>
            <p className="text-gray-200 text-lg">{lesson.keyTakeaway}</p>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
              disabled={activeLesson === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
              上一课
            </button>
            {activeLesson < lessons.length - 1 ? (
              <button
                onClick={() => setActiveLesson(activeLesson + 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                下一课
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/trade"
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition"
              >
                开始练习
                <TrendingUp className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
