#!/usr/bin/env python3
"""Fix chapterQuizzes.ts translation — insert En fields inside objects."""
import os, json, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read(f):
    with open(os.path.join(ROOT, f), encoding='utf-8') as fh:
        return fh.read()

def write(f, content):
    with open(os.path.join(ROOT, f), 'w', encoding='utf-8') as fh:
        fh.write(content)

def esc(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")

# All chapter quiz translations
T = {
    # ch1
    "阳线（绿色K线）表示什么？": ("What does a bullish (green) candle indicate?", ["Close above open", "Close below open", "No price change", "Volume increase"], "A bullish candle means price rose — close is higher than open."),
    "长下影线的K线出现在下跌趋势底部，通常叫什么？": ("A candle with a long lower wick at a downtrend bottom is called?", ["Shooting star", "Doji", "Hammer", "Engulfing"], "A Hammer: small body + long lower wick. At a downtrend bottom, potential reversal signal."),
    "支撑位被跌破后，它通常会变成什么？": ("After support is broken, it usually becomes?", ["Stronger support", "Resistance", "Invalid level", "Buy signal"], "Role reversal: broken support becomes resistance, broken resistance becomes support."),
    "哪种方式画支撑阻力最正确？": ("Correct way to draw support/resistance?", ["Precise line to decimals", "A price zone (range)", "Only last day's", "Use MAs instead"], "S/R are zones, not exact lines. Zones avoid false breakout traps."),
    "上升趋势的严格定义是什么？": ("Strict definition of an uptrend?", ["Price is rising", "Continuously higher highs and higher lows", "MA golden cross", "Volume increasing"], "Uptrend = Higher Highs + Higher Lows."),
    "EMA9上穿EMA21叫什么？": ("EMA9 crossing above EMA21 is called?", ["Death cross", "Golden cross", "Doji", "Engulfing"], "Short-term MA crossing above long-term MA = Golden Cross, a bullish signal."),
    "价格突破阻力位但成交量没有放大，最可能是什么？": ("Price breaks resistance without volume increase — most likely?", ["Strong breakout", "False breakout", "Trend acceleration", "Bottom reversal"], "Valid breakouts need volume confirmation. No volume = likely false."),
    "在上升趋势中，健康的量价关系是什么？": ("Healthy volume-price relationship in an uptrend?", ["Rise low vol, pullback high vol", "Rise high vol, pullback low vol", "Always high vol", "Always low vol"], "Healthy: volume up on rallies, down on pullbacks."),
    "暴跌+极端放量通常意味着什么？": ("Crash + extreme volume typically means?", ["More downside", "Panic selling, possibly near bottom", "Trend starting", "Normal fluctuation"], "Extreme volume crash = capitulation. All sellers exhausted — potential bottom signal."),
    "单根K线形态构成完整交易信号吗？": ("Does a single candle pattern constitute a complete signal?", ["Yes", "No — combine with location, trend, volume", "Only on daily", "Only for BTC"], "Candle patterns need right location + trend direction + volume confirmation."),
    "在下降趋势中，MA通常充当什么角色？": ("In a downtrend, MA usually acts as?", ["Support", "Dynamic resistance", "Irrelevant", "Buy signal"], "In downtrends, price stalls at MA — acts as dynamic resistance."),
    "以下哪个不属于K线的4个价格？": ("Which is NOT one of a candle's 4 prices?", ["Open", "Close", "Average price", "High"], "Candles: Open, Close, High, Low. Average price is not a candlestick component."),
    # ch2
    "偏向（Bias）的三种类型是什么？": ("What are the three types of bias?", ["Buy, sell, hold", "Bullish, bearish, sideways", "Short/mid/long-term", "Spot, futures, options"], "Bias: bullish, bearish, sideways. Many ignore sideways, leading to repeated stop-outs."),
    "\"偏向第一，入场第二\"意味着什么？": ("What does 'bias first, entry second' mean?", ["Buy first, think later", "Determine direction before entry", "Bias doesn't matter", "Only look at entry"], "Direction > timing. Right bias + poor entry profits; wrong bias + perfect entry loses."),
    "做2天波段交易，应该看什么时间框架判断偏向？": ("For 2-day swings, what timeframe for bias?", ["1-hour", "4-hour", "Daily", "Monthly"], "×12 rule: 2 days × 12 ≈ monthly for direction."),
    "月线转空但周线还在涨，应该怎么做？": ("Monthly bearish but weekly bullish — what to do?", ["Short immediately", "Follow weekly long, short after weekly turns too", "Don't trade", "Short with leverage"], "Spillover takes time. May have one last rally."),
    "用RSI+MACD+MA同时看涨等于3倍确信度吗？": ("RSI + MACD + MA all bullish = 3x confidence?", ["Yes", "No, highly correlated", "Depends on TF", "RSI most accurate"], "All price-derived, correlated. Need different dimensions for independent confirmation."),
    "低相关性信号系统的6个维度不包括哪个？": ("Which is NOT one of the 6 low-correlation dimensions?", ["Price", "Time", "Twitter followers", "Volatility"], "6 dimensions: price, time, volume, volatility, order flow, positioning."),
    "偏向持续规则中，偏向持续到什么时候？": ("Bias persists until?", ["Price target hit", "Candle close", "You feel enough", "Take-profit"], "Bias persists to candle close, not price target. Time > Price."),
    "综合信号评分0.7意味着什么？": ("Composite signal score of 0.7 means?", ["Unreliable", "Very weak", "Can open positions", "Strong signal, can size up"], "0.7-1.0 = strong signal zone, multiple dimensions confirming."),
    "如果你不确定市场方向，最好的做法是？": ("Unsure about direction — best action?", ["Go long", "Go short", "Don't trade", "Long and short"], "Unsure = sideways. Not trading is the best trade."),
    "Type 1 K线和Type 2/3 K线的区别是？": ("Difference between Type 1 and Type 2/3 candles?", ["Colors", "Type 1 clear direction, tradeable; Type 2/3 choppy", "Timeframes", "No difference"], "Type 1 = trending, Type 2/3 = ranging. Only trade Type 1."),
    "关于偏向溢出，以下哪个说法正确？": ("About bias spillover, which is correct?", ["Higher TF bearish immediately affects lower", "Last wave is usually strongest", "Bias doesn't flow between TFs", "Only daily matters"], "The last wave before transition is often the strongest."),
    "\"我只看下一个移动\"这个原则的意义是？": ("Significance of 'I only look at the next move'?", ["Don't do long-term", "Focus on present, don't predict far", "Only 1-min trades", "Don't look at charts"], "Focus on the next step, don't predict 3 moves ahead."),
    # ch3
    "顶部分数0.5-0.7意味着什么？": ("Top score 0.5-0.7 means?", ["Far from top", "Approaching — prepare sell plan", "Top confirmed", "Go all in"], "Approaching but not urgent. Prepare sell plan."),
    "为什么卖出是\"阶梯式\"的？": ("Why is selling done in 'steps'?", ["Fees", "BTC uptrend + taxes + selling early costs more", "Habit", "No reason"], "BTC trends up, tax on sales, early selling > late selling — gradual is rational."),
    "底部分数<0.4时应该怎么做？": ("What to do when bottom score < 0.4?", ["All in", "Wait, no rush", "Short", "Clear positions"], "Below 0.4 = not confirmed. Prepare capital and wait."),
    "\"精准出手\"vs\"DCA定投\"，本课推荐哪个？": ("'Precision strikes' vs DCA — recommended?", ["DCA", "Precision strikes", "Both", "Neither"], "Wait for score then concentrate. Better than DCA in psychology and returns."),
    "顶部分数的峰值和底部分数有什么关系？": ("Relationship between top score peaks and bottom scores?", ["None", "Top peak determines bottom floor", "Opposite", "Same"], "Lower top peak = less extreme top = shallower bottom. Mirror relationship."),
    "波段交易6步系统的第一步是什么？": ("First step of Swing Trading 6-Step System?", ["Find entry", "Set stop loss", "Determine cycle position", "Choose pair"], "Step one: top/bottom scores for cycle position → long or short."),
    "底部分数用什么来\"确认\"买入时机？": ("How does bottom score 'confirm' buy timing?", ["Reaches target AND starts rising", "Buy at score 0", "Others say buy", "Buy at new lows"], "Score must reach threshold AND improve. Low alone isn't enough."),
    "关于All-in/All-out策略的\"时间衰减规则\"，它的作用是？": ("Purpose of 'time decay rule' in All-in/All-out?", ["Accelerate losses", "Ensure eventual execution", "Reduce fees", "Increase leverage"], "+1 monthly ensures action even without extreme scores. Prevents permanent freeze."),
    "在已确认偏向方向上，大约多少比例的月K线会顺着偏向走？": ("In confirmed bias, what % of monthly candles follow?", ["50%", "60%", "70%", "90%"], "~70% follow bias, and trend candles are larger than counter-trend."),
    "6步系统中的\"部分止盈\"是在什么条件下执行？": ("When is 'partial take-profit' executed?", ["At $100 profit", "Exhaustion / near S&R / profit ≥ 2R", "Daily at 3 PM", "Feels right"], "Objective: weakening momentum, near key levels, or profit ≥ 2R."),
    "\"Range→Trend→Range→Trend\"模型告诉我们什么？": ("What does 'Range→Trend→Range→Trend' tell us?", ["Only goes up", "Alternates between ranging and trending", "Only range", "Only trend"], "Market does two things: range and trend. Different strategies for each."),
    "35%的\"偏向无效化止损\"听起来很宽，为什么这样设计？": ("35% 'bias invalidation stop' sounds wide — why?", ["No stops", "Bias-level stop; risk via small positions", "Suggestion", "Not important"], "35% = bias invalidation distance; actual risk controlled via 0.5x leverage."),
    # ch4
    "情绪和价格的关系是什么？": ("Relationship between sentiment and price?", ["Perfectly synced", "Not synced — sentiment more influenced by time", "None", "Price = everything"], "Time > price for sentiment. Fear lingers after crashes; optimism persists after tops."),
    "情绪指标降到0.10但还在下降，应该买入吗？": ("Sentiment at 0.10, still falling — buy?", ["Yes", "Wait for rising", "Short", "Ignore"], "Buy = <0.15 AND turning green. Extremes can persist."),
    "Fear & Greed Index中，25%的权重来自什么？": ("What is 25% of F&G Index weight?", ["Social media", "Volatility", "Google Trends", "BTC dominance"], "Volatility and momentum each = 25%."),
    "2026年2月的Fear & Greed值是5，这在历史上属于什么水平？": ("Feb 2026 F&G = 5 — historical level?", ["Normal", "Slightly fearful", "Extreme fear", "Greedy"], "F&G 5 = extreme fear. F&G < 10 historically → avg +200% 1-year return."),
    "情绪指标在交易系统中的角色是什么？": ("Sentiment indicator's role?", ["Independent signal", "Final confirmation", "Only needed", "Not important"], "Final confirmation. Bias → scores → sentiment."),
    "\"当你恐惧到不敢买时\"，应该问自己什么？": ("'Too scared to buy' — ask yourself?", ["Others' view", "Fear from fundamentals or just price?", "Add leverage?", "Switch coins?"], "Fundamentals deteriorating = rational fear; price-decline fear = buy signal."),
    "情绪日志应该记录什么？": ("Sentiment journal records?", ["Only price", "First reaction, F&G, headlines", "Only P&L", "Nothing"], "Daily: first reaction, F&G value, news sentiment."),
    "为什么说\"你的情绪经常和市场同步\"？": ("Why 'emotions sync with market'?", ["Good", "You're the retail indicator — go contrarian", "Impossible", "Bull only"], "If your emotions match retail, your fear/greed is a contrarian signal."),
    "0-1情绪量表中，0.3-0.7区间属于什么状态？": ("0-1 sentiment scale: 0.3-0.7 range?", ["Extreme fear", "Neutral", "Extreme greed", "Buy zone"], "0.3-0.7 = neutral. Only extremes matter."),
    "情绪指标在什么位置\"开始转绿\"是买入条件？": ("At what level does 'turning green' = buy condition?", ["Above 0.85", "0.50", "Below 0.15", "Any"], "<0.15 AND rising = buy. Must be extreme fear AND improving."),
    "以下哪个不是F&G Index的组成因素？": ("Which is NOT an F&G component?", ["Volatility", "Social media", "AI predictions", "Google Trends"], "No AI predictions. F&G = volatility, momentum, social, surveys, BTC dom, Google."),
    "情绪指标最大的价值是什么？": ("Greatest value of sentiment indicators?", ["Exact points", "Objective measure to counter emotions", "Replace TA", "Predict prices"], "Objective number for rational decision-making during extremes."),
    # ch5
    "人类对亏损的痛苦感是对获利快感的几倍？": ("Pain of loss vs pleasure of gain?", ["1x", "1.5x", "2-2.5x", "5x"], "Loss aversion ~2-2.5x. Biological root of stop-loss reluctance."),
    "FOMO来了，最好的第一步是什么？": ("When FOMO hits, best first step?", ["Buy now", "Force 15-min wait", "Add leverage", "Ask groups"], "Delay lets rational brain regain control. Most FOMO fades."),
    "\"我已经亏了$200，再亏一点也无所谓\"是什么心理陷阱？": ("'Lost $200, more doesn't matter' — what trap?", ["FOMO", "Sunk cost fallacy", "Confirmation bias", "Anchoring"], "Sunk cost: decisions based on past costs. Only ask 'worth holding now?'"),
    "连亏2笔后最安全的做法是？": ("Safest action after 2 losses?", ["Increase position", "Stop for the day", "Switch strategy", "Borrow more"], "Post-loss state unsuitable for trading. Rest overnight."),
    "连亏后恢复交易，仓位应该怎样？": ("Resuming after losses — position size?", ["Larger", "Same", "1/3 of normal", "All-in"], "1/3 rebuilds rhythm/confidence. Normal after 5 consecutive wins."),
    "过度交易的隐形杀手是什么？": ("Hidden killer of overtrading?", ["Volatility", "Fees", "Time", "Mindset"], "$500 account, 10x leverage, 10 trades/day → $1000+/month fees."),
    "交易仪式的核心目的是什么？": ("Core purpose of trading ritual?", ["Waste time", "Discipline → habit, no willpower", "Look pro", "For show"], "Willpower is limited. Habits = automatic execution."),
    "交易前情绪状态只有4/10分，应该怎么做？": ("Pre-trade emotions 4/10 — what to do?", ["Normal trading", "Don't trade / cut position", "Trade to improve mood", "Increase position"], "Poor emotions = poor decisions. <6: skip or cut."),
    "以下哪个不是恐惧在交易中的表现？": ("Which is NOT trading fear?", ["Refusing stop loss", "Afraid to enter", "Patiently waiting", "Revenge trading"], "Patient waiting = discipline, not fear."),
    "\"确认偏误\"在交易中的表现是什么？": ("'Confirmation bias' in trading?", ["Confirming orders", "Only seeking supporting info", "Confirming stop", "Confirming trend"], "Only reading 'BTC will bounce' while ignoring bearish evidence."),
    "专业交易者的正常胜率大约是？": ("Professional trader win rate?", ["80-90%", "60-80%", "40-60%", "<30%"], "40-60%. Key: win big, lose small (good R:R)."),
    "\"每日最多3笔\"规则的意义是什么？": ("'Max 3 trades/day' rule significance?", ["Can't profit", "Controls overtrading, high quality", "Limits gains", "Unnecessary"], "Hard limit forces best-opportunity-only. Quality >> quantity."),
    # ch6
    "Retest策略相比追突破的优势是什么？": ("Retest advantage over chasing breakouts?", ["Exciting", "Clear stop loss, clear logic", "Higher leverage", "100% win rate"], "Price comes to you, clear stop at breakout level."),
    "Retest的4步结构按顺序是什么？": ("Retest 4-step order?", ["Confirm→Impulse→Pull→Continue", "Impulse→Pullback→Confirm→Continue", "Pull→Impulse→Continue→Confirm", "Continue→Impulse→Pull→Confirm"], "Impulse → Pullback → Confirmation → Continuation."),
    "Retest策略中为什么止损设得比较宽（35%）？": ("Why is Retest stop wide (35%)?", ["Encourages risk", "Small position controls risk; avoids false-breakdown stops", "Doesn't matter", "Suggestion"], "Wide stop + small position = breathing room for false breakdowns."),
    "资金分类中，RC代表什么？": ("What does RC stand for?", ["Total reserve", "Reserve for Crypto", "Monthly income", "Leveraged capital"], "RC = Reserve for Crypto."),
    "底部分数=0.5时，应该投入RC的多少？": ("Bottom score = 0.5 → deploy what % of RC?", ["0%", "30%", "50%", "100%"], "Score 0.5 → 50% of RC and IC."),
    "为什么顶部卖出不清仓（保留30%）？": ("Why not sell 100% at top (keep 30%)?", ["Forgot", "Hedge + BTC long-term uptrend", "High fees", "No reason"], "30% hedges BTC's upward trajectory."),
    "Retest交易应该在什么时候入场？": ("When to enter Retest trade?", ["At breakout", "After H6 confirmation close", "Anytime", "Deepest pullback"], "Wait for H6 confirmation candle close."),
    "以下哪个是Retest策略的常见错误？": ("Common Retest mistake?", ["Waiting for confirmation", "Chasing breakout without pullback", "Wide stop", "Small position"], "Chasing without waiting for pullback is most common."),
    "\"只在新高分数时增加仓位\"这个规则的意义是？": ("'Only add at new high scores' significance?", ["More risk", "Prevents reducing on dips (one-way)", "Fewer fees", "More returns"], "Don't reduce on dips; only add at new highs. Gradual building."),
    "\"精准出手\"比DCA好在哪里？": ("'Precision striking' vs DCA advantage?", ["Simpler", "Better entry + less stress + fewer fees", "Risk-free", "DCA better"], "Signal-based entries = better prices, fewer ops, less stress."),
    "Retest策略推荐的执行时间框架是什么？": ("Recommended Retest execution timeframe?", ["1-min", "1-hour", "H6 (6-hour)", "Monthly"], "H6 filters noise with sufficient precision."),
    "分批建仓的核心逻辑是什么？": ("Core logic of batch building?", ["Professional look", "Can't pinpoint bottom; batching = better avg", "Fee discounts", "Habit"], "Nobody predicts exact bottoms. Batch = smoother cost."),
    # ch7
    "LUNA崩盘中，大多数受害者的核心错误是什么？": ("Core mistake of LUNA crash victims?", ["Poor skills", "Over-concentrated + didn't understand mechanism", "Wrong TF", "Too much leverage"], "Most put savings in one project without understanding algo stablecoins."),
    "UST脱锚初期（$0.98）退出最多亏多少？": ("Max loss exiting at UST $0.98?", ["2%", "20%", "50%", "98%"], "Initially 2%. 'Just wait' → 98%+."),
    "20% APY的Anchor协议，收益实际来自哪里？": ("Where did Anchor 20% APY come from?", ["Bank deposits", "Business profits", "Unsustainable token subsidy", "Treasury yields"], "If you don't know where yield comes from, you ARE the yield."),
    "案例中$8K到$1.5M的交易者，最关键的错误是？": ("$8K→$1.5M trader's critical mistake?", ["Wrong timing", "Failed to lock profits", "Wrong coin", "Wrong exchange"], "Profits not locked = never earned. 50% at $1.5M = $750K safe."),
    "\"牛市让每个人觉得自己是天才\"的含义是？": ("'Bull market genius' meaning?", ["Easy", "Profit needs no skill; test is bear market", "All genius", "No risk"], "Long = profit regardless of skill. True skill: bear market survival."),
    "案例中的交易者在$38K用什么补保证金？": ("What covered margin at $38K?", ["Savings", "Friend's loan", "Credit cards", "Salary"], "Credit cards for margin = extremely dangerous."),
    "关于LUNA案例，以下哪个说法正确？": ("About LUNA case, which is correct?", ["Only retail lost", "Galaxy Digital lost $558M too", "Everyone escaped", "Only Korea"], "Institutions lost too. Narrative traps don't discriminate."),
    "\"心理账户效应\"在案例中如何表现？": ("'Mental accounting' manifestation?", ["Forgot password", "Treated paper profits as real", "Multiple accounts", "Transfer fees"], "$1.5M→$400K felt like 'losing $1.1M' but principal was $8K."),
    "单一资产投入应该不超过总资金的多少？": ("Single asset max % of total?", ["50%", "30%", "20%", "80%"], "Max 20%. Above = one failure causes irrecoverable damage."),
    "从这些案例中，最重要的资金保护规则是？": ("Most important capital protection rule?", ["Never lose", "Set limits + lock profits", "Only long", "Lower leverage"], "Absolute stop limit + timely profit withdrawal."),
    "案例交易者从\"谨慎\"到\"狂妄\"用了多久？": ("Cautious to arrogant — how long?", ["1 month", "6 months", "~1 year", "3 years"], "March 2020 to April 2021, ~1 year."),
    "以下哪个不是从案例中学到的教训？": ("Which is NOT a lesson from cases?", ["Never trade borrowed money", "Distinguish luck from skill", "Be more aggressive in bull markets", "Lock profits"], "Bull markets should increase vigilance, not aggression."),
}

# Read the file
content = read('lib/chapterQuizzes.ts')

# For each quiz question, find it and replace the single-line object with multi-line including En fields
for zh_q, (en_q, en_opts, en_exp) in T.items():
    # Find the Chinese question in the file
    search = f"question: '{zh_q}'"
    idx = content.find(search)
    if idx == -1:
        # Try with escaped quotes
        search2 = f'question: \'{zh_q}\''
        idx = content.find(search2)
        if idx == -1:
            print(f"  ⚠ Not found: {zh_q[:30]}...")
            continue
    
    # Check if already translated
    nearby_end = min(idx + 2000, len(content))
    if 'questionEn:' in content[idx:nearby_end]:
        continue
    
    # Find the closing }, of this quiz object
    # We need to find the matching } for the { that starts before the question
    obj_start = content.rfind('{', 0, idx)
    if obj_start == -1:
        continue
    
    # Find matching } - simple approach since these are flat objects
    # Count brackets from obj_start
    depth = 0
    obj_end = obj_start
    in_str = False
    str_char = None
    i = obj_start
    while i < len(content):
        c = content[i]
        if in_str:
            if c == str_char and content[i-1] != '\\':
                in_str = False
        else:
            if c in ("'", '"'):
                in_str = True
                str_char = c
            elif c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    obj_end = i
                    break
        i += 1
    
    if obj_end <= obj_start:
        continue
    
    # Get the object text
    obj_text = content[obj_start:obj_end+1]
    
    # Build En fields to insert before closing }
    # Escape single quotes in options, then wrap in single-quoted array
    escaped_opts = [esc(o) for o in en_opts]
    opts_str = "[" + ", ".join(f"'{o}'" for o in escaped_opts) + "]"
    
    en_fields = f", questionEn: '{esc(en_q)}', optionsEn: {opts_str}, explanationEn: '{esc(en_exp)}'"
    
    # Insert before the closing }
    new_obj = obj_text[:-1] + en_fields + ' }'
    content = content[:obj_start] + new_obj + content[obj_end+1:]

write('lib/chapterQuizzes.ts', content)
print(f"✅ chapterQuizzes.ts translated ({len(content)} bytes)")

# Verify
qe_count = content.count('questionEn:')
oe_count = content.count('optionsEn:')
print(f"  questionEn: {qe_count}, optionsEn: {oe_count}")
