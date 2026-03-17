#!/usr/bin/env python3
"""
Add bilingual English translations to courseData.ts and chapterQuizzes.ts.
Inserts *En fields after each Chinese field. Idempotent (won't double-insert).
"""
import os, re, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read(f):
    with open(os.path.join(ROOT, f), encoding='utf-8') as fh:
        return fh.read()

def write(f, content):
    with open(os.path.join(ROOT, f), 'w', encoding='utf-8') as fh:
        fh.write(content)

def esc(s):
    """Escape for single-quoted TS string."""
    return s.replace("\\", "\\\\").replace("'", "\\'")

# ============================================================
# STEP 1: Update interfaces in courseData.ts
# ============================================================
def update_interfaces(content):
    """Add optional En fields to interfaces."""
    replacements = [
        # QuizQuestion
        ("  question: string;\n  options: string[];\n  correctIndex: number;\n  explanation: string;",
         "  question: string;\n  questionEn?: string;\n  options: string[];\n  optionsEn?: string[];\n  correctIndex: number;\n  explanation: string;\n  explanationEn?: string;"),
        # Lesson
        ("  title: string;\n  description: string;\n  icon: string;\n  duration: string;\n  tier:",
         "  title: string;\n  titleEn?: string;\n  description: string;\n  descriptionEn?: string;\n  icon: string;\n  duration: string;\n  durationEn?: string;\n  tier:"),
        ("  content: string;\n  quiz?:",
         "  content: string;\n  contentEn?: string;\n  quiz?:"),
        ("  homework?: string;\n}",
         "  homework?: string;\n  homeworkEn?: string;\n}"),
        # Chapter
        ("export interface Chapter {\n  id: string;\n  title: string;\n  description: string;",
         "export interface Chapter {\n  id: string;\n  title: string;\n  titleEn?: string;\n  description: string;\n  descriptionEn?: string;"),
    ]
    for old, new in replacements:
        if old in content and new not in content:
            content = content.replace(old, new)
    return content

# ============================================================
# STEP 2: Insert English fields after Chinese ones
# ============================================================

# All translations keyed by unique Chinese text markers
CHAPTER_EN = {
    "title: '交易入门：心态与纪律',": ("titleEn", "Trading Basics: Mindset & Discipline"),
    "description: '在学任何技术之前，先建立正确的交易心态。这是一切的基础。',": ("descriptionEn", "Before learning any technical skills, build the right trading mindset. This is the foundation of everything."),
    "title: '技术分析基础',": ("titleEn", "Technical Analysis Fundamentals"),
    "description: '看懂图表的第一课——K线、支撑阻力、趋势、成交量',": ("descriptionEn", "Your first chart-reading lesson — candlesticks, support & resistance, trends, and volume"),
    "title: '偏向判定系统',": ("titleEn", "Bias Determination System"),
    "description: '如何在任何时间框架上判断市场方向——交易的第一性原理',": ("descriptionEn", "How to determine market direction on any timeframe — the first principle of trading"),
    "title: '顶底信号系统',": ("titleEn", "Top & Bottom Signal System"),
    "description: '量化判断市场周期顶部和底部的完整评分体系',": ("descriptionEn", "A complete quantitative scoring system for identifying market cycle tops and bottoms"),
    "title: '情绪与市场心理',": ("titleEn", "Sentiment & Market Psychology"),
    "description: '理解市场情绪周期，用情绪指标确认交易信号',": ("descriptionEn", "Understand market sentiment cycles and use sentiment indicators to confirm trading signals"),
    "title: '交易心理学',": ("titleEn", "Trading Psychology"),
    "description: '90%的交易失败来自心理而非技术。这可能是最值钱的一章。',": ("descriptionEn", "90% of trading failures come from psychology, not technique. This may be the most valuable chapter."),
    "title: '实战交易策略',": ("titleEn", "Practical Trading Strategies"),
    "description: '从理论到实践——完整的交易策略和资金管理',": ("descriptionEn", "From theory to practice — complete trading strategies and capital management"),
    "title: '真实案例分析',": ("titleEn", "Real Case Studies"),
    "description: '真实发生的交易惨案——每个案例都是用真金白银换来的血泪教训',": ("descriptionEn", "Real trading disasters — each case is a lesson paid for in blood and tears"),
}

LESSON_EN = {
    # ch0 lessons
    "title: '为什么90%的人亏钱',": ("titleEn", "Why 90% of Traders Lose Money"),
    "description: '理解交易的残酷真相，以及如何成为那10%',": ("descriptionEn", "Understand the harsh reality of trading and how to be in the top 10%"),
    "title: '风险管理：活下来才能赚钱',": ("titleEn", "Risk Management: Survive First, Profit Later"),
    "description: '仓位管理、止损设置、杠杆控制的完整框架',": ("descriptionEn", "A complete framework for position sizing, stop loss placement, and leverage control"),
    "title: '入场与出场的基本逻辑',": ("titleEn", "Entry & Exit Logic Fundamentals"),
    "description: '什么时候买、什么时候卖的基础决策框架',": ("descriptionEn", "The basic decision framework for when to buy and when to sell"),
    "title: '交易日志：你的成长加速器',": ("titleEn", "Trading Journal: Your Growth Accelerator"),
    "description: '为什么记录每笔交易是进步最快的方式',": ("descriptionEn", "Why recording every trade is the fastest way to improve"),
    "title: '新手常犯的5个致命错误',": ("titleEn", "5 Fatal Mistakes Beginners Make"),
    "description: '避开这些坑，少走3年弯路',": ("descriptionEn", "Avoid these pitfalls and save yourself 3 years of costly lessons"),
    # ch1 lessons
    "title: 'K线语言：一根K线告诉你的信息',": ("titleEn", "Candlestick Language: What One Candle Tells You"),
    "description: '理解K线的开盘价、收盘价、最高价、最低价，以及常见K线形态的含义',": ("descriptionEn", "Understanding open, close, high, low prices and common candlestick pattern meanings"),
    "title: '支撑与阻力：价格的记忆',": ("titleEn", "Support & Resistance: The Memory of Price"),
    "description: '如何识别关键价格水平，以及为什么价格会在这些位置\"停留\"',": ("descriptionEn", "How to identify key price levels and why price tends to pause at these zones"),
    "title: '趋势与均线：跟着大方向走',": ("titleEn", "Trends & Moving Averages: Follow the Big Picture"),
    "description: '趋势的定义、判断方法，以及移动平均线的实用技巧',": ("descriptionEn", "Trend definitions, identification methods, and practical moving average techniques"),
    "title: '成交量：价格背后的真相',": ("titleEn", "Volume: The Truth Behind Price"),
    "description: '成交量如何确认或否定价格信号，以及常见的量价关系',": ("descriptionEn", "How volume confirms or invalidates price signals, and common volume-price relationships"),
    # ch2 lessons
    "title: '什么是偏向？为什么它比入场更重要',": ("titleEn", "What Is Bias? Why It Matters More Than Entry"),
    "description: '理解偏向的概念，以及为什么方向判断是一切交易的基础',": ("descriptionEn", "Understanding the concept of bias and why directional judgment is the foundation of all trading"),
    "title: '时间框架层级与偏向溢出',": ("titleEn", "Timeframe Hierarchy & Bias Spillover"),
    "description: '不同时间框架之间的关系，偏向如何从高级别传导到低级别',": ("descriptionEn", "How different timeframes relate and how bias flows from higher to lower timeframes"),
    "title: '低相关性信号系统',": ("titleEn", "Low-Correlation Signal System"),
    "description: '用6个不同维度的指标构建你的偏向确认系统',": ("descriptionEn", "Build your bias confirmation system using 6 different dimensional indicators"),
    # ch3 lessons
    "title: '顶部信号的6个维度',": ("titleEn", "Top Signals: The 6 Dimensions"),
    "description: '从价格、时间、成交量等6个维度识别周期顶部',": ("descriptionEn", "Identifying cycle tops from 6 dimensions: price, time, volume, and more"),
    "title: '底部信号与买入时机',": ("titleEn", "Bottom Signals & Buy Timing"),
    "description: '用底部评分系统量化判断买入时机',": ("descriptionEn", "Using a bottom scoring system to quantitatively determine buy timing"),
    "title: '波段交易6步系统',": ("titleEn", "Swing Trading 6-Step System"),
    "description: '从偏向到入场到出场的机械化执行系统',": ("descriptionEn", "A mechanical execution system from bias to entry to exit"),
    # ch4 lessons
    "title: '情绪指标：市场的体温计',": ("titleEn", "Sentiment Indicators: The Market\\'s Thermometer"),
    "description: '0-1量表的情绪指标如何帮你判断市场拐点',": ("descriptionEn", "How a 0-1 scale sentiment indicator helps identify market turning points"),
    # ch5 lessons
    "title: 'FOMO与恐惧：你的大脑在骗你',": ("titleEn", "FOMO & Fear: Your Brain Is Lying to You"),
    "description: '理解FOMO和恐惧的生物学根源，以及如何识别和克服它们',": ("descriptionEn", "Understanding the biological roots of FOMO and fear, and how to identify and overcome them"),
    "title: '亏损心理：为什么止损这么难',": ("titleEn", "Loss Psychology: Why Stop Losses Are So Hard"),
    "description: '深入理解止损背后的心理障碍，以及重新定义\"亏损\"',": ("descriptionEn", "Deep dive into psychological barriers behind stop losses, and redefining loss"),
    "title: '过度交易：忙≠赚钱',": ("titleEn", "Overtrading: Busy ≠ Profitable"),
    "description: '为什么交易越多不代表赚越多，以及如何识别过度交易',": ("descriptionEn", "Why more trades doesn\\'t mean more profit, and how to spot overtrading"),
    "title: '连亏后的心理重建',": ("titleEn", "Mental Recovery After a Losing Streak"),
    "description: '如何从大亏损中恢复信心，重新找回交易节奏',": ("descriptionEn", "How to rebuild confidence after major losses and regain your trading rhythm"),
    "title: '建立你的交易仪式',": ("titleEn", "Building Your Trading Ritual"),
    "description: '用固定的交易流程替代随机决策，让纪律变成习惯',": ("descriptionEn", "Replace random decisions with a fixed trading process — turn discipline into habit"),
    # ch6 lessons
    "title: 'Retest策略：横盘中的低风险机会',": ("titleEn", "Retest Strategy: Low-Risk Opportunities in Ranges"),
    "description: '在横盘市场中通过Retest策略捕捉低风险入场',": ("descriptionEn", "Capturing low-risk entries through the Retest strategy in ranging markets"),
    "title: '资金分类与周期投资策略',": ("titleEn", "Capital Classification & Cycle Investment Strategy"),
    "description: '如何区分投资仓位和交易仓位，在周期中最优配置资金',": ("descriptionEn", "How to separate investment and trading positions for optimal capital allocation across cycles"),
    # ch7 lessons
    "title: '案例：LUNA崩盘中的百万美元教训',": ("titleEn", "Case Study: Million-Dollar Lessons from the LUNA Crash"),
    "description: 'Do Kwon的UST/LUNA崩盘如何让无数交易者一夜归零——完整复盘与教训',": ("descriptionEn", "How the UST/LUNA collapse wiped out countless traders overnight — full post-mortem and lessons"),
    "title: '案例：从$8000到$150万再到负债——一个期货交易者的过山车',": ("titleEn", "Case Study: From $8K to $1.5M to Debt — A Futures Trader\\'s Rollercoaster"),
    "description: '一个真实的\"暴富后爆仓\"故事——高杠杆的甜蜜与毒药',": ("descriptionEn", "A true get-rich-then-go-broke story — the sweet poison of high leverage"),
}

HOMEWORK_EN = {
    "homework: '打开交易陪练AI的模拟交易页面，用$500虚拟资金做一笔交易。记录：为什么买/卖？止损设在哪？目标是什么？',":
        "homeworkEn: 'Open the Trading Copilot AI practice page and make one trade with $500 virtual funds. Record: Why buy/sell? Where is stop loss? What is the target?',",
    "homework: '在模拟交易中，按照本课的公式计算仓位大小：假设账户$500、风险3%、止损5%，你的仓位应该是多少？然后按这个仓位做一笔交易。',":
        "homeworkEn: 'In the simulator, calculate position size: with $500 account, 3% risk, 5% stop loss, what should your position be? Then execute a trade at that size.',",
    "homework: '在模拟交易中做一笔完整的交易：写下4问检查清单的答案，设好止损和目标价（R:R ≥ 1:2），执行后记录结果。',":
        "homeworkEn: 'Complete one full trade in the simulator: answer the 4-question checklist, set stop loss and target (R:R ≥ 1:2), execute and record the result.',",
    "homework: '在纸上或笔记软件中创建你的交易日志模板（参照课程中的表格），然后在模拟交易中记录3笔完整的交易。',":
        "homeworkEn: 'Create your trading journal template on paper or in a note app (use the table from this lesson), then record 3 complete trades in the simulator.',",
    "homework: '回顾你在模拟交易中的所有交易记录。找出是否犯了以上5个错误中的任何一个。写下你的发现和改进计划。',":
        "homeworkEn: 'Review all your trades in the simulator. Check if you made any of the 5 mistakes above. Write down findings and improvement plan.',",
    "homework: '打开TradingView，切换到BTC日线图。找出最近1个月内的3个锤子线或射击之星，标注它们出现的位置和之后价格的走势。',":
        "homeworkEn: 'Open TradingView, switch to BTC daily chart. Find 3 hammers or shooting stars from the past month. Note their positions and subsequent price action.',",
    "homework: '在TradingView的BTC 4小时图上，画出当前价格附近的3个主要支撑位和3个主要阻力位。截图保存。',":
        "homeworkEn: 'On TradingView\\'s BTC 4-hour chart, draw 3 major support and 3 major resistance levels near the current price. Save a screenshot.',",
    "homework: '在TradingView上给BTC日线图添加EMA9、EMA21和MA200。观察当前价格与这些均线的关系，判断当前处于什么趋势。',":
        "homeworkEn: 'Add EMA9, EMA21, and MA200 to BTC daily chart on TradingView. Observe the price vs. these MAs and determine the current trend.',",
    "homework: '在TradingView上观察BTC最近3次突破关键价位时的成交量。哪次是真突破？哪次是假突破？用成交量来验证你的判断。',":
        "homeworkEn: 'On TradingView, examine volume during BTC\\'s last 3 breakouts of key levels. Which was real? Which was fake? Use volume to validate.',",
    "homework: '用4问框架分析当前BTC市场：1. 你想交易什么时间框架？2. 上一层偏向？3. 上两层偏向？4. 你应该做什么？写下来。',":
        "homeworkEn: 'Analyze the current BTC market with the 4-question framework: 1. Your timeframe? 2. Bias one level up? 3. Two levels up? 4. What should you do? Write it down.',",
    "homework: '打开BTC月线图和周线图，分别判断当前的偏向。两个偏向是否一致？如果不一致，根据本课学到的\"偏向溢出\"原则，你应该怎么操作？',":
        "homeworkEn: 'Open BTC monthly and weekly charts. Determine current bias for each. Aligned? If not, based on bias spillover, how should you trade?',",
    "homework: '建一个Excel表格：列出6个维度，每个维度选1个你能获取的指标，给当前市场打分。计算综合分数。',":
        "homeworkEn: 'Create an Excel sheet: list 6 dimensions, pick 1 accessible indicator per dimension, score the current market. Calculate the composite score.',",
    "homework: '用CoinGlass查看当前BTC的聚合资金费率。正还是负？查看过去3个月的趋势。这告诉你什么？',":
        "homeworkEn: 'Check current BTC aggregate funding rate on CoinGlass. Positive or negative? Review the 3-month trend. What does it tell you?',",
    "homework: '查找BTC的CVDD当前值（链上数据网站可查）。它告诉你BTC的\"绝对底线\"在哪里？当前价格距离它多远？',":
        "homeworkEn: 'Find the current BTC CVDD value on an on-chain data site. Where is BTC\\'s absolute floor? How far is the current price from it?',",
    "homework: '用TradingView的Replay功能，回到2024年底，按照6步系统模拟执行一次波段交易。记录每一步的决策。',":
        "homeworkEn: 'Use TradingView Replay to go back to late 2024. Simulate one swing trade using the 6-step system. Record each step\\'s decision.',",
    "homework: '查看当前的Fear & Greed Index值。查看过去30天的走势。当前的恐惧程度在历史上处于什么水平？',":
        "homeworkEn: 'Check the current Fear & Greed Index value. Review the 30-day trend. Where does the current fear level stand historically?',",
    "homework: '回忆你过去因为FOMO或恐惧做的一笔交易（真实或模拟）。写下：当时的情绪状态是什么？决策过程是什么？结果如何？如果重来你会怎么做？',":
        "homeworkEn: 'Recall a trade you made from FOMO or fear (real or simulated). Write down: emotional state, decision process, result, and what you\\'d do differently.',",
    "homework: '在模拟交易中，设置5笔仓位极小但止损很近的交易。目标不是赚钱，是练习被止损后保持冷静。记录每次被止损后的情绪变化。',":
        "homeworkEn: 'In the simulator, set 5 tiny-position trades with tight stops. Goal: practice staying calm after stop-outs. Record emotional changes after each.',",
    "homework: '下周实施\"每日最多3笔\"规则。每天记录：做了几笔？有没有想做但忍住的？一周后统计结果。',":
        "homeworkEn: 'Implement the max-3-trades-per-day rule next week. Daily record: how many trades? Any you resisted? Tally results after one week.',",
    "homework: '写一份个人的\"连亏应急预案\"：1. 连亏几笔后暂停？2. 暂停多久？3. 恢复时仓位多大？4. 什么条件恢复正常仓位？把它打印出来贴在电脑旁边。',":
        "homeworkEn: 'Write a personal losing-streak emergency plan: 1. Stop after how many losses? 2. Pause how long? 3. Resume position size? 4. Conditions to restore normal size? Print and post by your screen.',",
    "homework: '根据本课的模板，写出你自己的\"交易仪式\"清单（交易前、交易中、交易后各3-5条）。打印出来贴在交易桌旁。接下来一周严格执行。',":
        "homeworkEn: 'Using this lesson\\'s template, write your own trading ritual checklist (3-5 items each for pre/during/post-trade). Print and post it. Follow strictly for one week.',",
    "homework: '在TradingView上找出BTC最近3个月的一个Retest案例。标注4部分结构，标出理想的入场点和止损位。',":
        "homeworkEn: 'On TradingView, find one Retest example from BTC\\'s last 3 months. Label the 4-part structure and mark the ideal entry and stop loss.',",
    "homework: '假设你有$5000准备在底部建仓BTC。根据底部分数的分批策略，制定你的买入计划表：什么分数买多少。',":
        "homeworkEn: 'With $5000 to build a BTC position at the bottom, create your batch-buy plan: what score triggers what amount.',",
    "homework: '选一个你目前持有或关注的项目，回答：1. 它的收益从哪里来？2. 什么情况下它会归零？3. 你能承受多大的亏损？如果答不上来，你需要更多研究。',":
        "homeworkEn: 'Pick a project you hold or watch. Answer: 1. Where does its yield come from? 2. What could make it go to zero? 3. How much loss can you handle? If you can\\'t answer, research more.',",
    "homework: '如果你的账户从$1000涨到$10,000，你的提款计划是什么？写下具体的规则：涨到多少提多少，放到哪里。现在写，不要等到那一天再想。',":
        "homeworkEn: 'If your account grew from $1,000 to $10,000, what is your withdrawal plan? Write specific rules: at what amount, withdraw how much, to where. Write it NOW.',",
}

# Quiz translations: keyed by unique Chinese question text
QUIZ_EN = {
    # ch0-1
    "question: '以下哪个是散户亏钱的最常见原因？',": {
        "questionEn": "Which is the most common reason retail traders lose money?",
        "optionsEn": ["Market manipulation", "No trading plan and emotional trading", "Insufficient technical analysis", "Not enough capital"],
        "explanationEn": "While market manipulation and capital size matter, research shows lack of planning and emotional trading are the primary causes. Most losses can be avoided through discipline."
    },
    "question: '亏损50%后，需要上涨多少才能回本？',": {
        "questionEn": "After a 50% loss, how much gain is needed to break even?",
        "optionsEn": ["50%", "75%", "100%", "150%"],
        "explanationEn": "If $100 drops to $50 (-50%), it needs to go from $50 to $100 (+100%) to break even. This is why stop losses are critical — keeping losses small enables faster recovery."
    },
    "question: '关于杠杆，以下哪个说法正确？',": {
        "questionEn": "Which statement about leverage is correct?",
        "optionsEn": ["Higher leverage = faster profits", "Leverage amplifies both gains and risks", "Beginners should use high leverage to accumulate fast", "10x leverage is safe"],
        "explanationEn": "Leverage is a double-edged sword that amplifies everything. 10x leverage means a 10% adverse move wipes you out. Beginners should stick to 1-3x."
    },
    # ch0-2
    "question: '账户$1000，风险控制在3%，最大单笔亏损是多少？',": {
        "questionEn": "With a $1000 account and 3% risk control, what is the max single-trade loss?",
        "optionsEn": ["$10", "$30", "$50", "$100"],
        "explanationEn": "$1000 × 3% = $30. No matter how confident, your stop-loss loss should not exceed $30."
    },
    "question: '以下哪种止损方式最合理？',": {
        "questionEn": "Which stop loss method is most reasonable?",
        "optionsEn": ["Stop at $50 loss", "Stop when price breaks key support", "Stop at 20% loss", "Stop when it feels wrong"],
        "explanationEn": "Stop losses should be based on market structure (support levels, trendlines), not fixed amounts or feelings. Structure-based stops have logical foundation."
    },
    "question: '一笔交易止损$20，目标盈利$60，R:R是多少？',": {
        "questionEn": "A trade has $20 stop loss and $60 target. What is the R:R?",
        "optionsEn": ["1:1", "1:2", "1:3", "3:1"],
        "explanationEn": "R:R = Stop:Target = $20:$60 = 1:3. Excellent risk-reward — profitable long-term even at 35% win rate."
    },
    "question: '新手应该使用多少倍杠杆？',": {
        "questionEn": "How much leverage should beginners use?",
        "optionsEn": ["10x+, accumulate fast", "5-10x, balanced", "1-3x, learn first", "No leverage"],
        "explanationEn": "For beginners, learning and survival matter most. 1-3x gives ample room for error. Only increase after consistent profitability."
    },
    # ch0-3
    "question: '入场前最应该先确定什么？',": {
        "questionEn": "What should you determine first before entering a trade?",
        "optionsEn": ["Exact entry price", "How much leverage", "Market direction (bias)", "Today's price change"],
        "explanationEn": "Bias first, entry second. Determine the overall direction before finding entry points. Getting direction right matters more than precise timing."
    },
    "question: '什么情况下应该放弃一笔交易？',": {
        "questionEn": "When should you skip a trade?",
        "optionsEn": ["Stop loss too far, R:R below 1:1.5", "Someone in the group says it'll drop", "It has already gone up a lot", "Other coins are rising but this one isn't"],
        "explanationEn": "If calculated R:R is below 1:1.5 (insufficient profit room), the trade has poor expected value. Wait for a better opportunity."
    },
    "question: '新手最适合用哪种止盈方式？',": {
        "questionEn": "Which take-profit method is best for beginners?",
        "optionsEn": ["Sell by feeling", "Fixed target price", "Never sell (HODL)", "Sell when others say to"],
        "explanationEn": "Fixed target is simplest and most disciplined. Set R:R at 1:2, take profit when reached. Learn trailing stops after skills mature."
    },
    # ch0-4
    "question: '交易日志中最容易被忽略但最有价值的项目是？',": {
        "questionEn": "Which trading journal item is most commonly overlooked but most valuable?",
        "optionsEn": ["Entry price", "Emotional state", "Trading pair", "Time"],
        "explanationEn": "Emotional state is most overlooked yet most valuable. Recording emotions reveals patterns like '90% of anxious trades resulted in losses.'"
    },
    "question: '多久应该做一次交易复盘？',": {
        "questionEn": "How often should you review your trades?",
        "optionsEn": ["After every trade", "Weekly + monthly", "Once a month", "No need when profitable"],
        "explanationEn": "Weekly 30-min quick review + monthly deep review is ideal. Record after each trade, but analysis needs sufficient sample size."
    },
    # ch0-5
    "question: '$500账户用10x杠杆每天交易10次，一个月手续费大约是？',": {
        "questionEn": "$500 account, 10x leverage, 10 trades/day — monthly fees approximately?",
        "optionsEn": ["$50", "$100", "$500", "$1000"],
        "explanationEn": "Notional $5000/trade × 20 trades/day (open+close) × 0.05% × 20 days = $1000. More than the principal! The hidden killer of overtrading."
    },
    "question: '10次满仓交易（每次90%把握），全部存活的概率是？',": {
        "questionEn": "10 all-in trades (90% confidence each) — survival probability?",
        "optionsEn": ["90%", "65%", "35%", "10%"],
        "explanationEn": "0.9^10 = 0.35, or 35%. Even at 90% confidence per trade, 10 all-in trades give a 65% chance of at least one wipeout."
    },
    "question: '以下哪个学习方式最有效？',": {
        "questionEn": "Which learning approach is most effective?",
        "optionsEn": ["Learn a new indicator daily", "Pick one system and practice deeply", "Follow more KOLs", "Only practice, no theory"],
        "explanationEn": "Learning 10% of 100 strategies < 100% of one. Choose a complete system (like this course) and practice deeply until consistent."
    },
    # ch1-1
    "question: '一根K线有长下影线和小实体（锤子线），在下跌趋势底部出现，这说明什么？',": {
        "questionEn": "A candle with a long lower wick and small body (hammer) at the bottom of a downtrend indicates?",
        "optionsEn": ["Sellers are strong, more downside", "Buyers caught price at lows, potential reversal", "No significance, random", "Should short immediately"],
        "explanationEn": "The hammer's long lower wick shows price dropped but buyers pulled it back. At a downtrend bottom, it's a potential reversal signal."
    },
    "question: '看到一根看涨吞没K线，应该立刻买入吗？',": {
        "questionEn": "Should you buy immediately upon seeing a bullish engulfing candle?",
        "optionsEn": ["Yes, strong signal", "Not necessarily — check location, trend, and volume too", "No, engulfing is unreliable", "Only valid on 1-min charts"],
        "explanationEn": "A single candlestick pattern isn't a complete signal. Combine with location (at support?), trend direction, and volume confirmation."
    },
    # ch1-2
    "question: '一个价格水平被多次测试但都没有被突破，这说明什么？',": {
        "questionEn": "A price level tested multiple times without breaking indicates?",
        "optionsEn": ["Unimportant level", "Strong support/resistance", "Should be ignored", "About to break"],
        "explanationEn": "More tests = more important. Multiple tests without breaking = strong buying/selling force at that level."
    },
    "question: '$65,000是一个强支撑位，被跌破后价格反弹回$65,000附近，这时候应该？',": {
        "questionEn": "$65,000 was strong support, now broken. Price bounces back near $65,000. What now?",
        "optionsEn": ["Go long at $65,000", "Note $65,000 may now act as resistance", "Ignore this price", "Go long with high leverage"],
        "explanationEn": "Broken support becomes resistance. Former support at $65,000 may now act as a ceiling. Watch whether price can break back above."
    },
    # ch1-3
    "question: '上升趋势的定义是？',": {
        "questionEn": "What is the definition of an uptrend?",
        "optionsEn": ["Price is rising", "Continuously higher highs and higher lows", "MA golden cross", "Volume increasing"],
        "explanationEn": "Uptrend = Higher Highs + Higher Lows. Simply 'rising' isn't precise enough."
    },
    "question: '在上升趋势中，最佳买入时机是？',": {
        "questionEn": "In an uptrend, the best time to buy is?",
        "optionsEn": ["When price makes a new high", "When price pulls back to MA or support", "When it breaks below MA", "Anytime"],
        "explanationEn": "In an uptrend, buying pullbacks to MA or support is ideal — following the trend while buying relatively low. Chasing highs is riskier."
    },
    # ch1-4
    "question: '价格突破阻力位但成交量没有明显放大，最可能的情况是？',": {
        "questionEn": "Price breaks resistance but volume doesn't increase notably — most likely?",
        "optionsEn": ["Strong breakout, follow it", "Likely false breakout, stay cautious", "Volume doesn't matter", "Short immediately"],
        "explanationEn": "Valid breakouts come with increased volume. Breakout without volume is often false — price likely returns to the prior range."
    },
    "question: '在下跌趋势中出现极端放量的大阴线，这可能意味着？',": {
        "questionEn": "Extreme volume spike with a large red candle in a downtrend might mean?",
        "optionsEn": ["More downside ahead", "Panic selling, possibly near bottom", "Chase the short", "Volume data error"],
        "explanationEn": "Extreme volume crash = capitulation. Everyone wanting to sell already has — paradoxically a potential bottom signal. Confirm with other indicators."
    },
    # ch2-1
    "question: '偏向正确但入场点不好，结果通常是？',": {
        "questionEn": "Correct bias but poor entry — typical result?",
        "optionsEn": ["Guaranteed loss", "Can still profit (with patience)", "Bias doesn't matter", "Stop loss immediately"],
        "explanationEn": "If direction is right, even buying slightly expensive, patience lets the trend carry you to profit. This is why 'bias first.'"
    },
    "question: '做2天的波段交易，应该看什么时间框架来判断偏向？',": {
        "questionEn": "For 2-day swing trades, what timeframe for bias?",
        "optionsEn": ["1-hour", "4-hour", "Daily", "Monthly"],
        "explanationEn": "×12 rule: 2 days × 12 ≈ monthly. Swing trading requires the monthly timeframe for the big-picture direction."
    },
    # ch2-2
    "question: '月线偏向刚转看跌，周线偏向仍然看涨。应该怎么做？',": {
        "questionEn": "Monthly bias just turned bearish, weekly still bullish. What to do?",
        "optionsEn": ["Short immediately", "Follow weekly long, short after weekly turns bearish too", "Do nothing", "Short with high leverage"],
        "explanationEn": "Bias spillover takes time. Monthly bearish + weekly bullish = possible final rally. Follow current trading timeframe (weekly) bias."
    },
    # ch2-3
    "question: '用RSI+MACD+MA同时看涨，这等于3倍确信度吗？',": {
        "questionEn": "RSI + MACD + MA all bullish — equals 3x confidence?",
        "optionsEn": ["Yes, 3 bullish indicators are reliable", "No, they're highly correlated — effectively 1 signal", "Depends on timeframe", "RSI is most accurate, ignore others"],
        "explanationEn": "All three derive from price, highly correlated. Same signal in different packaging. Use different dimensions (volume, volatility, positioning) for true independent confirmation."
    },
    # ch3-1
    "question: '顶部分数0.5意味着什么？',": {
        "questionEn": "What does a top score of 0.5 mean?",
        "optionsEn": ["Sell immediately", "Approaching but not urgent — prepare a sell plan", "Far from top", "Top confirmed"],
        "explanationEn": "0.5-0.7 means approaching but no panic needed. Start preparing a sell plan, don't act immediately."
    },
    # ch3-2
    "question: '底部分数0.38，应该怎么做？',": {
        "questionEn": "Bottom score is 0.38 — what to do?",
        "optionsEn": ["Go all in", "Watch and wait, prepare capital", "Short", "Ignore"],
        "explanationEn": "0.38 hasn't reached the 0.4 buy threshold. Monitor and prepare capital. Wait for score to rise above 0.4 before testing with small positions."
    },
    # ch3-3
    "question: '波段交易6步系统的第一步是？',": {
        "questionEn": "What is the first step of the Swing Trading 6-Step System?",
        "optionsEn": ["Find entry points", "Determine cycle position (top/bottom score)", "Set stop loss", "Choose trading pair"],
        "explanationEn": "Step one is always determining the big picture — where in the cycle you are. This decides long or short. Entry is only step three."
    },
    # ch4-1
    "question: '情绪指标降到0.10但还在下降，应该买入吗？',": {
        "questionEn": "Sentiment drops to 0.10 but still falling. Should you buy?",
        "optionsEn": ["Yes, already extreme", "No rush — wait for it to start rising (turning green)", "Should short", "Sentiment indicators are unreliable"],
        "explanationEn": "Buy condition: <0.15 AND starting to turn green. Just reaching a low isn't enough — sentiment can stay extreme for extended periods."
    },
    # ch5-1
    "question: 'BTC突然暴涨8%，你强烈想买入。最好的做法是？',": {
        "questionEn": "BTC surges 8%, you desperately want to buy. Best action?",
        "optionsEn": ["Buy immediately", "Force wait at least 15 minutes, see if urge subsides", "Chase with leverage", "Go all in"],
        "explanationEn": "FOMO is the most common loss cause. Forced delay lets the rational brain regain control. Most FOMO urges fade during the wait."
    },
    "question: '连续亏损3笔后，你感到害怕不敢入场。一个好的信号出现了，怎么办？',": {
        "questionEn": "After 3 consecutive losses, you're scared to enter. A good signal appears. What to do?",
        "optionsEn": ["Skip it, too scared", "Execute with smaller position (reduce emotional pressure)", "Go bigger to recover", "Wait for others to confirm"],
        "explanationEn": "Post-loss fear is normal but shouldn't prevent good trades. Reduce position to 'losing won't hurt' level — follow the plan while managing emotions."
    },
    "question: '人类对亏损的痛苦感是对获利快感的几倍？',": {
        "questionEn": "The pain of loss is how many times the pleasure of gain?",
        "optionsEn": ["1x (same)", "1.5x", "2-2.5x", "5x"],
        "explanationEn": "Behavioral economics shows loss aversion coefficient is ~2-2.5x. The biological root of reluctance to take stop losses."
    },
    # ch5-2
    "question: '\"我已经亏了$200了，再亏一点也无所谓\" — 这是什么心理陷阱？',": {
        "questionEn": "'I've already lost $200, a bit more doesn't matter' — what trap is this?",
        "optionsEn": ["FOMO", "Sunk cost fallacy", "Confirmation bias", "Anchoring effect"],
        "explanationEn": "Sunk cost fallacy: irrational decisions based on already-invested costs. Only ask 'from now on, is this trade worth holding?'"
    },
    "question: '专业交易者的正常胜率大约是？',": {
        "questionEn": "What is the normal win rate for professional traders?",
        "optionsEn": ["80-90%", "60-80%", "40-60%", "Below 30%"],
        "explanationEn": "Successful traders typically have 40-60% win rates. Key isn't high win rate but 'win big, lose small' (good R:R)."
    },
    # ch5-3
    "question: '连续亏损2笔后，最好的做法是？',": {
        "questionEn": "After 2 consecutive losses, the best action is?",
        "optionsEn": ["Increase position to recover", "Stop trading for the day, come back calmer", "Reverse direction", "Try a different pair"],
        "explanationEn": "Post-loss emotional state is unsuitable for trading. Rest overnight for rational recovery. Revenge trading is a capital killer."
    },
    # ch5-4
    "question: '连亏后最应该做的第一件事是？',": {
        "questionEn": "First thing to do after a losing streak?",
        "optionsEn": ["Increase position to recover", "Pause trading 24-72 hours", "Switch strategies", "Borrow money to add more"],
        "explanationEn": "After a streak, your brain is highly stressed. Pause first, normalize stress hormones, then review calmly. Emotional trading decisions are dangerous."
    },
    "question: '连亏后恢复交易时，仓位应该？',": {
        "questionEn": "When resuming after a losing streak, position size should be?",
        "optionsEn": ["Larger (recover fast)", "Same as before", "Reduced to 1/3 of normal", "All-in"],
        "explanationEn": "Reduced position rebuilds rhythm and confidence while limiting further loss risk. Return to normal after 5 consecutive wins."
    },
    # ch5-5
    "question: '交易前发现自己情绪状态只有4/10（焦虑/烦躁），应该怎么做？',": {
        "questionEn": "Pre-trade emotional state is only 4/10 (anxious/irritable). What to do?",
        "optionsEn": ["Trade as usual", "Don't trade or significantly reduce position", "Use trading to distract yourself", "Increase positions to feel better"],
        "explanationEn": "Poor emotions (<6/10) = degraded decisions. Skip trading or cut position. Trading to 'improve mood' is the root of overtrading."
    },
    "question: '以下哪个最能帮助你保持交易纪律？',": {
        "questionEn": "Which best helps maintain trading discipline?",
        "optionsEn": ["Stronger willpower", "Turning processes into fixed rituals and habits", "Discipline comes with profits", "Find a guru"],
        "explanationEn": "Willpower is limited. Rituals/habits don't consume willpower — once formed, execution is automatic. Build a fixed trading process."
    },
    # ch6-1
    "question: 'Retest最安全的入场时机是？',": {
        "questionEn": "The safest entry timing for Retest is?",
        "optionsEn": ["Right at breakout", "After pullback to breakout level with support confirmed", "Without waiting for confirmation", "Short on breakdown"],
        "explanationEn": "Retest core: wait for confirmation — enter after price returns to breakout level and holds. Safer than chasing breakouts with clearer stop loss."
    },
    # ch6-2
    "question: '为什么要分批买入而不是一次性买入？',": {
        "questionEn": "Why buy in batches instead of all at once?",
        "optionsEn": ["Looks professional", "Can't pinpoint exact bottom; batching gets better average cost", "Lower fees", "No difference"],
        "explanationEn": "Nobody predicts exact bottoms. Batch buying smooths entry cost and reduces single-judgment risk."
    },
    # ch7-1
    "question: 'LUNA崩盘案例中，散户最大的错误是什么？',": {
        "questionEn": "In the LUNA crash, what was retail investors' biggest mistake?",
        "optionsEn": ["Bad timing", "Over-concentration in single asset + not understanding the mechanism", "Wrong timeframe", "Too much leverage"],
        "explanationEn": "Most put most savings in one project without understanding 'algorithmic stablecoin' vs 'bank deposit.' Diversification and understanding are key."
    },
    "question: 'UST脱锚初期（跌到$0.98）就退出，最多亏多少？',": {
        "questionEn": "Exiting during UST's early de-peg ($0.98) — max loss?",
        "optionsEn": ["2%", "20%", "50%", "98%"],
        "explanationEn": "Initially just 2%. But 'just wait' turned 2% into 98%+. Stop loss value: small loss vs total loss."
    },
    # ch7-2
    "question: '这个案例中，交易者最关键的错误是哪个？',": {
        "questionEn": "In this case, the trader's most critical mistake was?",
        "optionsEn": ["Wrong initial timing", "Failed to lock in profits when winning", "Wrong coin", "Wrong exchange"],
        "explanationEn": "If they withdrew 50% at $1.5M peak ($750K), even losing everything else, $750K remains. 'Profits not locked in = never earned.'"
    },
    "question: '为什么说\"牛市让每个人觉得自己是天才\"？',": {
        "questionEn": "Why 'a bull market makes everyone feel like a genius'?",
        "optionsEn": ["Bull markets are short", "In uptrends nearly all assets rise — profit needs no skill", "Lower fees in bull markets", "Higher leverage in bull markets"],
        "explanationEn": "In a bull market, going long = profit regardless of skill. True skill is preserving profits in a bear market."
    },
}

# ============================================================
# CHAPTER QUIZ TRANSLATIONS (chapterQuizzes.ts)
# ============================================================
CH_QUIZ_EN = {
    # ch1
    "question: '阳线（绿色K线）表示什么？',": {
        "questionEn": "What does a bullish (green) candle indicate?",
        "optionsEn": ["Close above open", "Close below open", "No price change", "Volume increase"],
        "explanationEn": "A bullish candle means price rose — close is higher than open."
    },
    "question: '长下影线的K线出现在下跌趋势底部，通常叫什么？',": {
        "questionEn": "A candle with a long lower wick at a downtrend bottom is called?",
        "optionsEn": ["Shooting star", "Doji", "Hammer", "Engulfing"],
        "explanationEn": "A Hammer has a small body + long lower wick. At a downtrend bottom, it's a potential reversal signal."
    },
    "question: '支撑位被跌破后，它通常会变成什么？',": {
        "questionEn": "After support is broken, it usually becomes?",
        "optionsEn": ["Stronger support", "Resistance", "Invalid level", "Buy signal"],
        "explanationEn": "Role reversal: broken support becomes resistance, broken resistance becomes support."
    },
    "question: '哪种方式画支撑阻力最正确？',": {
        "questionEn": "What's the correct way to draw support/resistance?",
        "optionsEn": ["Precise line to decimals", "A price zone (range)", "Only last day's", "Use MAs instead"],
        "explanationEn": "S/R are zones, not exact lines. Zones avoid false breakout traps."
    },
    "question: '上升趋势的严格定义是什么？',": {
        "questionEn": "Strict definition of an uptrend?",
        "optionsEn": ["Price is rising", "Continuously higher highs and higher lows", "MA golden cross", "Volume increasing"],
        "explanationEn": "Uptrend = Higher Highs + Higher Lows."
    },
    "question: 'EMA9上穿EMA21叫什么？',": {
        "questionEn": "What is EMA9 crossing above EMA21 called?",
        "optionsEn": ["Death cross", "Golden cross", "Doji", "Engulfing"],
        "explanationEn": "Short-term MA crossing above long-term MA = Golden Cross, a bullish signal."
    },
    "question: '价格突破阻力位但成交量没有放大，最可能是什么？',": {
        "questionEn": "Price breaks resistance without volume increase — most likely?",
        "optionsEn": ["Strong breakout", "False breakout", "Trend acceleration", "Bottom reversal"],
        "explanationEn": "Valid breakouts need volume confirmation. No volume = likely false."
    },
    "question: '在上升趋势中，健康的量价关系是什么？',": {
        "questionEn": "Healthy volume-price relationship in an uptrend?",
        "optionsEn": ["Rise on low vol, pullback on high vol", "Rise on high vol, pullback on low vol", "Always high volume", "Always low volume"],
        "explanationEn": "Healthy uptrend: volume up on rallies (active buyers), down on pullbacks (light selling)."
    },
    "question: '暴跌+极端放量通常意味着什么？',": {
        "questionEn": "Crash + extreme volume typically means?",
        "optionsEn": ["More downside", "Panic selling, possibly near bottom", "Trend starting", "Normal fluctuation"],
        "explanationEn": "Extreme volume crash = capitulation. All sellers exhausted — potential bottom signal."
    },
    "question: '单根K线形态构成完整交易信号吗？',": {
        "questionEn": "Does a single candle pattern constitute a complete signal?",
        "optionsEn": ["Yes, sufficient", "No — combine with location, trend, volume", "Only on daily", "Only for BTC"],
        "explanationEn": "Candle patterns need right location + trend direction + volume confirmation."
    },
    "question: '在下降趋势中，MA通常充当什么角色？',": {
        "questionEn": "In a downtrend, MA usually acts as?",
        "optionsEn": ["Support", "Dynamic resistance", "Irrelevant", "Buy signal"],
        "explanationEn": "In downtrends, price stalls at MA on rallies — MA acts as dynamic resistance."
    },
    "question: '以下哪个不属于K线的4个价格？',": {
        "questionEn": "Which is NOT one of a candle's 4 prices?",
        "optionsEn": ["Open", "Close", "Average price", "High"],
        "explanationEn": "Candles have 4 prices: Open, Close, High, Low. Average price is not part of a candlestick."
    },
    # ch2
    "question: '偏向（Bias）的三种类型是什么？',": {
        "questionEn": "What are the three types of bias?",
        "optionsEn": ["Buy, sell, hold", "Bullish, bearish, sideways", "Short/mid/long-term", "Spot, futures, options"],
        "explanationEn": "Bias: bullish, bearish, sideways. Many ignore sideways, leading to repeated stop-outs in ranges."
    },
    "question: '\"偏向第一，入场第二\"意味着什么？',": {
        "questionEn": "What does 'bias first, entry second' mean?",
        "optionsEn": ["Buy first, think later", "Determine direction before entry", "Bias doesn't matter", "Only look at entry"],
        "explanationEn": "Direction > timing. Right bias + poor entry still profits; wrong bias + perfect entry still loses."
    },
    "question: '做2天波段交易，应该看什么时间框架判断偏向？',": {
        "questionEn": "For 2-day swing trades, what timeframe for bias?",
        "optionsEn": ["1-hour", "4-hour", "Daily", "Monthly"],
        "explanationEn": "×12 rule: 2 days × 12 ≈ monthly for big-picture direction."
    },
    "question: '月线转空但周线还在涨，应该怎么做？',": {
        "questionEn": "Monthly bearish but weekly still bullish — what to do?",
        "optionsEn": ["Short immediately", "Follow weekly long, short after weekly turns too", "Don't trade", "Short with leverage"],
        "explanationEn": "Bias spillover takes time. Monthly bearish ≠ weekly immediately follows. May have one last rally."
    },
    "question: '用RSI+MACD+MA同时看涨等于3倍确信度吗？',": {
        "questionEn": "RSI + MACD + MA all bullish = 3x confidence?",
        "optionsEn": ["Yes", "No, highly correlated", "Depends on TF", "RSI most accurate"],
        "explanationEn": "All price-derived, highly correlated. Need different dimensions (volume, volatility, positioning) for independent confirmation."
    },
    "question: '低相关性信号系统的6个维度不包括哪个？',": {
        "questionEn": "Which is NOT one of the 6 dimensions in the low-correlation system?",
        "optionsEn": ["Price", "Time", "Twitter followers", "Volatility"],
        "explanationEn": "6 dimensions: price, time, volume, volatility, order flow, positioning. Social followers aren't an independent dimension."
    },
    "question: '偏向持续规则中，偏向持续到什么时候？',": {
        "questionEn": "In bias persistence, bias lasts until?",
        "optionsEn": ["Price target hit", "Candle close", "You feel enough", "Take-profit"],
        "explanationEn": "Bias persists to candle close, not to price target. Time > Price."
    },
    "question: '综合信号评分0.7意味着什么？',": {
        "questionEn": "Composite signal score of 0.7 means?",
        "optionsEn": ["Unreliable", "Very weak", "Can open positions", "Strong signal, can size up"],
        "explanationEn": "0.7-1.0 is the strong signal zone — multiple independent dimensions confirming. Larger positions can be considered."
    },
    "question: '如果你不确定市场方向，最好的做法是？',": {
        "questionEn": "If unsure about market direction, best action?",
        "optionsEn": ["Go long", "Go short", "Don't trade", "Long and short simultaneously"],
        "explanationEn": "Unsure = sideways bias. Not trading is the best trade. Wait for clarity."
    },
    "question: 'Type 1 K线和Type 2/3 K线的区别是？',": {
        "questionEn": "Difference between Type 1 and Type 2/3 candles?",
        "optionsEn": ["Different colors", "Type 1 has clear direction, tradeable; Type 2/3 choppy, unsuitable", "Different timeframes", "No difference"],
        "explanationEn": "Type 1 = trending (clear direction), Type 2/3 = ranging (ambiguous). Only trade Type 1."
    },
    "question: '关于偏向溢出，以下哪个说法正确？',": {
        "questionEn": "About bias spillover, which is correct?",
        "optionsEn": ["Higher TF bearish immediately affects lower TF", "The last wave is usually strongest", "Bias doesn't flow between TFs", "Only daily bias matters"],
        "explanationEn": "The last wave before a bias transition is often especially strong and powerful."
    },
    "question: '\"我只看下一个移动\"这个原则的意义是？',": {
        "questionEn": "Significance of 'I only look at the next move'?",
        "optionsEn": ["Don't do long-term", "Focus on present, don't predict too far", "Only 1-min trades", "Don't look at charts"],
        "explanationEn": "Focus on the next step on every timeframe. Don't predict 3 moves ahead."
    },
    # ch3
    "question: '顶部分数0.5-0.7意味着什么？',": {
        "questionEn": "Top score 0.5-0.7 means?",
        "optionsEn": ["Far from top", "Approaching risk zone — prepare sell plan", "Top confirmed", "Should go all in"],
        "explanationEn": "Approaching but not urgent. Prepare a sell plan, don't act immediately."
    },
    "question: '为什么卖出是\"阶梯式\"的？',": {
        "questionEn": "Why is selling done in 'steps'?",
        "optionsEn": ["Because of fees", "BTC long-term uptrend + taxes + selling too early costs more", "Just habit", "No reason"],
        "explanationEn": "BTC trends up long-term, selling has tax implications, selling too early > selling too late — gradual selling is more rational."
    },
    "question: '底部分数<0.4时应该怎么做？',": {
        "questionEn": "What to do when bottom score < 0.4?",
        "optionsEn": ["Go all in", "Wait, no rush", "Short", "Clear positions"],
        "explanationEn": "Below 0.4 = bottom not confirmed. Prepare capital and be patient."
    },
    "question: '\"精准出手\"vs\"DCA定投\"，本课推荐哪个？',": {
        "questionEn": "'Precision strikes' vs DCA — which does this course recommend?",
        "optionsEn": ["DCA", "Precision strikes", "Both combined", "Neither"],
        "explanationEn": "Wait for sufficient bottom score then concentrate. Better than mindless DCA in psychology and actual returns."
    },
    "question: '顶部分数的峰值和底部分数有什么关系？',": {
        "questionEn": "Relationship between top score peaks and bottom scores?",
        "optionsEn": ["None", "Top score peak determines bottom score floor", "Exact opposite", "Same"],
        "explanationEn": "Lower top peak = less extreme top = bottom won't be as deep. Mirror relationship."
    },
    "question: '波段交易6步系统的第一步是什么？',": {
        "questionEn": "First step of the Swing Trading 6-Step System?",
        "optionsEn": ["Find entry", "Set stop loss", "Determine cycle position", "Choose pair"],
        "explanationEn": "Step one: use top/bottom scores to determine cycle position. This decides long or short."
    },
    "question: '底部分数用什么来\"确认\"买入时机？',": {
        "questionEn": "What does bottom score use to 'confirm' buy timing?",
        "optionsEn": ["Score reaches target AND starts rising", "Buy at score 0", "Buy when others say", "Buy at new lows"],
        "explanationEn": "Score must reach threshold AND show improvement. Low alone isn't enough."
    },
    "question: '关于All-in/All-out策略的\"时间衰减规则\"，它的作用是？',": {
        "questionEn": "Purpose of the 'time decay rule' in All-in/All-out?",
        "optionsEn": ["Accelerate losses", "Ensure eventual buy/sell execution", "Reduce fees", "Increase leverage"],
        "explanationEn": "Adds +1 monthly to effective count, ensuring action even if scores don't reach extremes. Prevents being frozen forever."
    },
    "question: '在已确认偏向方向上，大约多少比例的月K线会顺着偏向走？',": {
        "questionEn": "In confirmed bias direction, what % of monthly candles follow?",
        "optionsEn": ["50%", "60%", "70%", "90%"],
        "explanationEn": "~70% of monthly candles follow the bias, and trend-following candles are larger than counter-trend."
    },
    "question: '6步系统中的\"部分止盈\"是在什么条件下执行？',": {
        "questionEn": "Under what conditions is 'partial take-profit' executed?",
        "optionsEn": ["At $100 profit", "Candle exhaustion / near S&R / profit ≥ 2R", "Daily at 3 PM", "When it feels right"],
        "explanationEn": "Objective triggers: weakening momentum, approaching key levels, or profit reaching 2R+."
    },
    "question: '\"Range→Trend→Range→Trend\"模型告诉我们什么？',": {
        "questionEn": "What does 'Range→Trend→Range→Trend' tell us?",
        "optionsEn": ["Market only goes up", "Market alternates between ranging and trending", "Only trade ranges", "Only trade trends"],
        "explanationEn": "Market does two things: range and trend. Use different strategies for each phase."
    },
    "question: '35%的\"偏向无效化止损\"听起来很宽，为什么这样设计？',": {
        "questionEn": "35% 'bias invalidation stop' sounds wide. Why?",
        "optionsEn": ["Encourages no stops", "Bias-level stop; actual risk controlled via small positions", "Just a suggestion", "Not important"],
        "explanationEn": "35% is bias invalidation distance; actual risk controlled through 0.5x leverage positions."
    },
    # ch4
    "question: '情绪和价格的关系是什么？',": {
        "questionEn": "What's the relationship between sentiment and price?",
        "optionsEn": ["Perfectly synced", "Not synchronized — sentiment more influenced by time", "No relationship", "Price determines all"],
        "explanationEn": "Time > price for sentiment. Fear lingers after crashes; optimism persists after tops."
    },
    "question: '情绪指标降到0.10但还在下降，应该买入吗？',": {
        "questionEn": "Sentiment at 0.10 but still falling — buy?",
        "optionsEn": ["Yes", "Wait for it to start rising", "Short", "Ignore"],
        "explanationEn": "Buy = <0.15 AND turning green. Low alone isn't enough; extremes can persist."
    },
    "question: 'Fear & Greed Index中，25%的权重来自什么？',": {
        "questionEn": "What contributes 25% weight in the Fear & Greed Index?",
        "optionsEn": ["Social media", "Volatility", "Google Trends", "BTC dominance"],
        "explanationEn": "Volatility and market momentum each = 25%, the two largest F&G components."
    },
    "question: '2026年2月的Fear & Greed值是5，这在历史上属于什么水平？',": {
        "questionEn": "Feb 2026 F&G is 5. Historical level?",
        "optionsEn": ["Normal", "Slightly fearful", "Historically extreme fear", "Greedy"],
        "explanationEn": "F&G of 5 = historically extreme fear. When F&G < 10, average 1-year return has been +200%."
    },
    "question: '情绪指标在交易系统中的角色是什么？',": {
        "questionEn": "Sentiment indicator's role in a trading system?",
        "optionsEn": ["Independent signal", "Final confirmation tool", "Only indicator needed", "Not important"],
        "explanationEn": "Sentiment isn't independent — it's the final confirmation. Bias → top/bottom scores → sentiment."
    },
    "question: '\"当你恐惧到不敢买时\"，应该问自己什么？',": {
        "questionEn": "'When too scared to buy,' what to ask yourself?",
        "optionsEn": ["What others think", "Whether fear is from deteriorating fundamentals or just price decline", "Whether to add leverage", "Whether to switch coins"],
        "explanationEn": "Distinguish: fundamentals deteriorating = rational fear; fear from price decline alone = emotional (actually a buy signal)."
    },
    "question: '情绪日志应该记录什么？',": {
        "questionEn": "What should a sentiment journal record?",
        "optionsEn": ["Only price", "First reaction, F&G value, news headlines", "Only P&L", "Nothing"],
        "explanationEn": "Daily: first reaction, F&G value, news sentiment. Over time reveals emotional patterns."
    },
    "question: '为什么说\"你的情绪经常和市场同步\"？',": {
        "questionEn": "Why 'your emotions often sync with the market'?",
        "optionsEn": ["Good thing", "You're the retail indicator — consider contrarian thinking", "Impossible", "Only in bull markets"],
        "explanationEn": "If your emotions match retail, your fear/greed is a contrarian signal."
    },
    "question: '0-1情绪量表中，0.3-0.7区间属于什么状态？',": {
        "questionEn": "In the 0-1 sentiment scale, what is the 0.3-0.7 range?",
        "optionsEn": ["Extreme fear", "Neutral", "Extreme greed", "Buy zone"],
        "explanationEn": "0.3-0.7 = neutral. Operate normally. Only extremes (<0.15 or >0.85) are significant."
    },
    "question: '情绪指标在什么位置\"开始转绿\"是买入条件？',": {
        "questionEn": "At what level does 'turning green' become a buy condition?",
        "optionsEn": ["Above 0.85", "0.50", "Below 0.15", "Any level"],
        "explanationEn": "Sentiment <0.15 AND starting to rise = buy condition. Must be in extreme fear AND improving."
    },
    "question: '以下哪个不是F&G Index的组成因素？',": {
        "questionEn": "Which is NOT a component of F&G Index?",
        "optionsEn": ["Volatility", "Social media", "AI predictions", "Google Trends"],
        "explanationEn": "F&G = volatility, momentum, social, surveys, BTC dominance, Google Trends. No AI predictions."
    },
    "question: '情绪指标最大的价值是什么？',": {
        "questionEn": "Greatest value of sentiment indicators?",
        "optionsEn": ["Exact buy/sell points", "Objective measurement to counter your own emotions", "Replace TA", "Predict prices"],
        "explanationEn": "Core value: objective number helping you stay rational during extremes, avoiding fear/greed-driven decisions."
    },
    # ch5
    "question: '人类对亏损的痛苦感是对获利快感的几倍？',": {
        "questionEn": "Pain of loss is how many times pleasure of gain?",
        "optionsEn": ["1x", "1.5x", "2-2.5x", "5x"],
        "explanationEn": "Loss aversion coefficient ~2-2.5x. Biological root of stop-loss reluctance."
    },
    "question: 'FOMO来了，最好的第一步是什么？',": {
        "questionEn": "When FOMO hits, best first step?",
        "optionsEn": ["Buy immediately", "Force 15-min wait", "Add leverage", "Ask chat groups"],
        "explanationEn": "Delayed decision lets the prefrontal cortex regain control. Most FOMO fades during the wait."
    },
    "question: '\"我已经亏了$200，再亏一点也无所谓\"是什么心理陷阱？',": {
        "questionEn": "'Lost $200, a bit more doesn't matter' — what trap?",
        "optionsEn": ["FOMO", "Sunk cost fallacy", "Confirmation bias", "Anchoring"],
        "explanationEn": "Sunk cost fallacy: deciding based on past costs. Only ask 'worth holding from now on?'"
    },
    "question: '连亏2笔后最安全的做法是？',": {
        "questionEn": "Safest action after 2 consecutive losses?",
        "optionsEn": ["Increase position", "Stop for the day", "Switch strategies", "Borrow to continue"],
        "explanationEn": "Post-loss emotions unsuitable for trading. Rest for rational recovery."
    },
    "question: '连亏后恢复交易，仓位应该怎样？',": {
        "questionEn": "Resuming after losing streak — position size?",
        "optionsEn": ["Larger", "Same", "1/3 of normal", "All-in"],
        "explanationEn": "Reduced position rebuilds rhythm/confidence. Return to normal after 5 consecutive wins."
    },
    "question: '过度交易的隐形杀手是什么？',": {
        "questionEn": "The hidden killer of overtrading?",
        "optionsEn": ["Market volatility", "Fees", "Time", "Mindset"],
        "explanationEn": "$500 account, 10x leverage, 10 trades/day = $1000+/month in fees. More than the principal!"
    },
    "question: '交易仪式的核心目的是什么？',": {
        "questionEn": "Core purpose of a trading ritual?",
        "optionsEn": ["Waste time", "Turn discipline into habit, no willpower needed", "Look professional", "For show"],
        "explanationEn": "Willpower is limited. Habits don't consume it — once formed, execution is automatic."
    },
    "question: '交易前情绪状态只有4/10分，应该怎么做？',": {
        "questionEn": "Pre-trade emotional state 4/10 — what to do?",
        "optionsEn": ["Trade normally", "Don't trade or cut position significantly", "Trade to improve mood", "Increase position"],
        "explanationEn": "Poor emotions = poor decisions. Below 6: skip or cut. Trading to 'improve mood' = overtrading root cause."
    },
    "question: '以下哪个不是恐惧在交易中的表现？',": {
        "questionEn": "Which is NOT a manifestation of trading fear?",
        "optionsEn": ["Refusing stop loss", "Afraid to enter", "Patiently waiting for good setup", "Revenge trading"],
        "explanationEn": "Patient waiting = discipline, not fear. Refusing stops, fear of entry, revenge trading are all fear manifestations."
    },
    "question: '\"确认偏误\"在交易中的表现是什么？',": {
        "questionEn": "How does 'confirmation bias' manifest in trading?",
        "optionsEn": ["Confirming orders", "Only seeking info supporting your view", "Confirming stop loss", "Confirming trend"],
        "explanationEn": "Only reading 'BTC will bounce' while ignoring all bearish evidence → not stopping out."
    },
    "question: '专业交易者的正常胜率大约是？',": {
        "questionEn": "Normal win rate for professional traders?",
        "optionsEn": ["80-90%", "60-80%", "40-60%", "<30%"],
        "explanationEn": "40-60% typical. Key isn't high win rate but 'win big, lose small' R:R."
    },
    "question: '\"每日最多3笔\"规则的意义是什么？',": {
        "questionEn": "Significance of 'max 3 trades per day' rule?",
        "optionsEn": ["Can't make money", "Controls overtrading, ensures high quality", "Limits gains", "Unnecessary"],
        "explanationEn": "Hard limits force best opportunities only. Quality >> quantity."
    },
    # ch6
    "question: 'Retest策略相比追突破的优势是什么？',": {
        "questionEn": "Retest advantage over chasing breakouts?",
        "optionsEn": ["More exciting", "Clear stop loss, clear entry logic", "Higher leverage", "100% win rate"],
        "explanationEn": "Retest: price comes to you, clear stop at breakout level, no direction prediction needed."
    },
    "question: 'Retest的4步结构按顺序是什么？',": {
        "questionEn": "Retest 4-step structure in order?",
        "optionsEn": ["Confirm→Impulse→Pullback→Continue", "Impulse→Pullback→Confirm→Continue", "Pullback→Impulse→Continue→Confirm", "Continue→Impulse→Pullback→Confirm"],
        "explanationEn": "Impulse → Pullback → Confirmation → Continuation."
    },
    "question: 'Retest策略中为什么止损设得比较宽（35%）？',": {
        "questionEn": "Why is Retest stop loss wide (35%)?",
        "optionsEn": ["Encourages risk", "Actual risk via small position; avoids false breakdown stop-outs", "Doesn't matter", "Just suggestion"],
        "explanationEn": "Wide stop + small position = breathing room. Retests often have false breakdowns triggering tight stops."
    },
    "question: '资金分类中，RC代表什么？',": {
        "questionEn": "What does RC stand for in capital classification?",
        "optionsEn": ["Total reserve", "Reserve for Crypto", "Monthly income", "Leveraged capital"],
        "explanationEn": "RC = Reserve for Crypto — portion of total reserve allocated to crypto."
    },
    "question: '底部分数=0.5时，应该投入RC的多少？',": {
        "questionEn": "When bottom score = 0.5, deploy what % of RC?",
        "optionsEn": ["0%", "30%", "50%", "100%"],
        "explanationEn": "Score = 0.5 → deploy 50% of RC and IC. Score = percentage. Simple."
    },
    "question: '为什么顶部卖出不清仓（保留30%）？',": {
        "questionEn": "Why not sell 100% at top (keep 30%)?",
        "optionsEn": ["Forgot", "Hedge 'this time is different' + BTC long-term uptrend", "High fees", "No reason"],
        "explanationEn": "30% hedges BTC's long-term upward trajectory — fully exiting risks never buying back."
    },
    "question: 'Retest交易应该在什么时候入场？',": {
        "questionEn": "When to enter a Retest trade?",
        "optionsEn": ["At breakout moment", "After H6 confirmation candle closes", "Anytime", "At deepest pullback"],
        "explanationEn": "Wait for H6 confirmation candle close. Don't enter mid-candle. Close = confirmed."
    },
    "question: '以下哪个是Retest策略的常见错误？',": {
        "questionEn": "Common Retest strategy mistake?",
        "optionsEn": ["Waiting for confirmation", "Chasing breakout without waiting for pullback", "Stop too wide", "Position too small"],
        "explanationEn": "Chasing breakouts is most common. Correct: wait for price to retest the level."
    },
    "question: '\"只在新高分数时增加仓位\"这个规则的意义是？',": {
        "questionEn": "Significance of 'only add at new high scores'?",
        "optionsEn": ["Increases risk", "Prevents reducing on dips (one-way building)", "Reduces fees", "Increases returns"],
        "explanationEn": "Don't reduce on score decline; only add at new highs. Gradual building, not disrupted by fluctuations."
    },
    "question: '\"精准出手\"比DCA好在哪里？',": {
        "questionEn": "How is 'precision striking' better than DCA?",
        "optionsEn": ["Simpler", "Better entry + lower psychological burden + fewer fees", "Risk-free", "DCA is better"],
        "explanationEn": "Concentrated entries on signals get better prices, fewer ops, less stress. DCA buys at obvious tops too."
    },
    "question: 'Retest策略推荐的执行时间框架是什么？',": {
        "questionEn": "Recommended execution timeframe for Retest?",
        "optionsEn": ["1-min", "1-hour", "H6 (6-hour)", "Monthly"],
        "explanationEn": "H6 filters noise while maintaining precision. Retest is mid-cycle, not for tiny timeframes."
    },
    "question: '分批建仓的核心逻辑是什么？',": {
        "questionEn": "Core logic of batch position building?",
        "optionsEn": ["Looks professional", "Can't pinpoint bottom; batching = better avg cost", "Fee discounts", "Just habit"],
        "explanationEn": "Nobody predicts exact bottoms. Batch buying smooths cost and reduces single-judgment risk."
    },
    # ch7
    "question: 'LUNA崩盘中，大多数受害者的核心错误是什么？',": {
        "questionEn": "Core mistake of most LUNA crash victims?",
        "optionsEn": ["Poor skills", "Over-concentrated + didn't understand mechanism", "Wrong timeframe", "Too much leverage"],
        "explanationEn": "Most put majority of savings in one project without understanding 'algo stablecoin' vs 'bank deposit.'"
    },
    "question: 'UST脱锚初期（$0.98）退出最多亏多少？',": {
        "questionEn": "Max loss exiting at UST's initial de-peg ($0.98)?",
        "optionsEn": ["2%", "20%", "50%", "98%"],
        "explanationEn": "Initially just 2%. 'Just wait' turned 2% into 98%+."
    },
    "question: '20% APY的Anchor协议，收益实际来自哪里？',": {
        "questionEn": "Where did Anchor's 20% APY actually come from?",
        "optionsEn": ["Bank deposits", "Real business profits", "Unsustainable token subsidy", "Treasury yields"],
        "explanationEn": "If you don't know where yield comes from, you ARE the yield. 20% APY far exceeded normal levels with no sustainable backing."
    },
    "question: '案例中$8K到$1.5M的交易者，最关键的错误是？',": {
        "questionEn": "$8K to $1.5M trader's most critical mistake?",
        "optionsEn": ["Wrong timing", "Failed to lock in profits", "Wrong coin", "Wrong exchange"],
        "explanationEn": "Profits not locked in = never earned. 50% at $1.5M = $750K safe even if rest goes to zero."
    },
    "question: '\"牛市让每个人觉得自己是天才\"的含义是？',": {
        "questionEn": "Meaning of 'bull market makes everyone feel like a genius'?",
        "optionsEn": ["Easy", "Making money needs no skill; real test is bear market", "Everyone is genius", "No risk"],
        "explanationEn": "Bull market: long = profit regardless of skill. True skill = preserving profits in bear markets."
    },
    "question: '案例中的交易者在$38K用什么补保证金？',": {
        "questionEn": "What did the trader use to cover margin at $38K?",
        "optionsEn": ["Savings", "Friend's loan", "Credit cards", "Salary"],
        "explanationEn": "Credit cards for margin is extremely dangerous. Losing your own money allows restart; borrowed = life crisis."
    },
    "question: '关于LUNA案例，以下哪个说法正确？',": {
        "questionEn": "About the LUNA case, which is correct?",
        "optionsEn": ["Only retail lost", "Even Galaxy Digital (institution) lost $558M", "Everyone escaped early", "Only Korea affected"],
        "explanationEn": "Not just retail — Galaxy Digital lost $558M on LUNA. Narrative traps don't discriminate."
    },
    "question: '\"心理账户效应\"在案例中如何表现？',": {
        "questionEn": "How did 'mental accounting effect' manifest?",
        "optionsEn": ["Forgot password", "Treated paper profits as real money", "Multiple accounts", "Transfer fees"],
        "explanationEn": "$1.5M to $400K felt like 'losing $1.1M,' but principal was only $8K. Paper profits ≠ actual profits."
    },
    "question: '单一资产投入应该不超过总资金的多少？',": {
        "questionEn": "Single asset allocation should not exceed what % of total?",
        "optionsEn": ["50%", "30%", "20%", "80%"],
        "explanationEn": "Max 20% per asset. Above this, one failure can cause irrecoverable damage."
    },
    "question: '从这些案例中，最重要的资金保护规则是？',": {
        "questionEn": "Most important capital protection rule from these cases?",
        "optionsEn": ["Never lose money", "Set absolute limits + lock in profits promptly", "Only long, never short", "Lower leverage always better"],
        "explanationEn": "Two cores: absolute stop limit + timely profit withdrawal (50% principal after doubling)."
    },
    "question: '案例交易者从\"谨慎\"到\"狂妄\"用了多久？',": {
        "questionEn": "How long from 'cautious' to 'arrogant' for the case trader?",
        "optionsEn": ["1 month", "6 months", "About 1 year", "3 years"],
        "explanationEn": "March 2020 to April 2021, ~1 year. Continuous positive feedback rapidly shifts mindset."
    },
    "question: '以下哪个不是从案例中学到的教训？',": {
        "questionEn": "Which is NOT a lesson from these cases?",
        "optionsEn": ["Never trade with borrowed money", "Distinguish luck from skill", "Be more aggressive in bull markets", "Lock in profits promptly"],
        "explanationEn": "Bull markets should increase vigilance, not aggression. Gradually lock in profits, don't get bolder."
    },
}

def apply_quiz_translations(content, quiz_dict):
    """For each quiz question, add En fields after the existing fields."""
    for marker, trans in quiz_dict.items():
        if marker not in content:
            continue
        if "questionEn:" in content[content.find(marker):content.find(marker)+500]:
            continue  # Already translated
            
        # Find the question block
        q_idx = content.find(marker)
        
        # Find explanation end (marks end of this quiz question object)
        exp_marker = "explanation: '"
        exp_idx = content.find(exp_marker, q_idx)
        if exp_idx == -1 or exp_idx > q_idx + 2000:
            continue
        # Find end of explanation string
        # Handle multi-line or escaped quotes
        i = exp_idx + len(exp_marker)
        while i < len(content):
            if content[i] == "'" and content[i-1] != '\\':
                break
            i += 1
        # Now i points to closing quote of explanation
        exp_end = i + 1  # past the quote
        
        # Find the end of the explanation line (looking for the space after the closing ')
        line_end = content.find('\n', exp_end)
        if line_end == -1:
            continue
        
        # Ensure there's a comma after the explanation value (it may be the last field before our insertion)
        between = content[exp_end:line_end].strip()
        if not between.startswith(',') and ',' not in content[exp_end:line_end]:
            # Add comma after the closing quote
            content = content[:exp_end] + ',' + content[exp_end:]
            line_end += 1  # account for inserted comma
            
        # Detect indentation
        # Find the line start for this question
        q_line_start = content.rfind('\n', 0, q_idx) + 1
        indent = ''
        for c in content[q_line_start:]:
            if c in ' \t':
                indent += c
            else:
                break
        if not indent:
            indent = '          '
        
        # Build insertion
        # Escape single quotes in options, then build single-quoted array
        escaped_opts = [esc(o) for o in trans["optionsEn"]]
        opts_str = "[" + ", ".join(f"'{o}'" for o in escaped_opts) + "]"
        
        insertion = (
            f"\n{indent}questionEn: '{esc(trans['questionEn'])}',"
            f"\n{indent}optionsEn: {opts_str},"
            f"\n{indent}explanationEn: '{esc(trans['explanationEn'])}'"
        )
        
        # Insert before the closing } of this quiz object
        # The explanation line is the last field, so we insert after it
        content = content[:line_end] + insertion + content[line_end:]
    
    return content

def apply_field_translations(content, field_dict, field_name):
    """Insert fieldEn after each field."""
    for marker, en_val in field_dict.items():
        if marker not in content:
            continue
        en_field = field_name
        en_check = f"{en_field}:"
        
        # Check if already translated (look nearby)
        marker_idx = content.find(marker)
        nearby = content[marker_idx:marker_idx+500]
        if en_check in nearby:
            continue
        
        # Find end of line
        eol = content.find('\n', marker_idx)
        if eol == -1:
            continue
            
        # Detect indentation
        line_start = content.rfind('\n', 0, marker_idx) + 1
        indent = ''
        for c in content[line_start:]:
            if c in ' \t':
                indent += c
            else:
                break
        if not indent:
            indent = '        '
        
        insertion = f"{indent}{en_val}\n"
        content = content[:eol+1] + insertion + content[eol+1:]
    
    return content

# ============================================================
# MAIN
# ============================================================

# Process courseData.ts
print("Processing courseData.ts...")
cd = read('lib/courseData.ts')
cd = update_interfaces(cd)

# Chapter & lesson title/description translations
all_td = {}
all_td.update(CHAPTER_EN)
all_td.update(LESSON_EN)

for marker, (field, value) in all_td.items():
    insert_line = f"    {field}: '{esc(value)}',"
    if field.startswith('description'):
        insert_line = f"    {field}: '{esc(value)}',"
    cd = apply_field_translations(cd, {marker: insert_line}, field)

# Homework translations
for marker, en_line in HOMEWORK_EN.items():
    cd = apply_field_translations(cd, {marker: f"        {en_line}"}, "homeworkEn")

# Quiz translations (inline in courseData)
cd = apply_quiz_translations(cd, QUIZ_EN)

write('lib/courseData.ts', cd)
print(f"  ✅ courseData.ts written ({len(cd)} bytes)")

# chapterQuizzes.ts is handled by translate_quizzes.py (single-line objects need different logic)
print("Skipping chapterQuizzes.ts (use translate_quizzes.py)")

print("\n✅ All translations applied!")
