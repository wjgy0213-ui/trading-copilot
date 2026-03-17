#!/usr/bin/env python3
"""Round 3c - Mop up remaining Chinese strings"""
import json, re, os

BASE = os.path.dirname(os.path.abspath(__file__))

# Load locale files
with open(os.path.join(BASE, 'locales/zh.json'), 'r') as f:
    zh = json.load(f)
with open(os.path.join(BASE, 'locales/en.json'), 'r') as f:
    en = json.load(f)

# Add missing keys
extra_keys = {
    "dashboard.path.researcher.fit": ("适合每天都在看信号、做验证、调参数的人", "For those who check signals, validate, and tune parameters daily"),
    "dashboard.path.researcher.cta": ("打开策略工坊", "Open Strategy Workshop"),
    "dashboard.pathHeader": ("先按路径开始，不要在 20 个功能里乱跳", "Start with a path — don't jump between 20 features"),
    "dashboard.pathIntro": ("推荐顺序统一成一条线：先做市场体检，确认当前环境；再去 Practice 校准执行；最后把想法送进策略工坊做结构化验证。", "Follow one path: market health check to confirm environment → Practice to calibrate execution → Strategy Workshop for structured validation."),
    "dashboard.step1": ("1. 市场体检", "1. Health Check"),
    "dashboard.step2": ("2. Practice", "2. Practice"),
    "dashboard.step3": ("3. 策略工坊", "3. Strategy Workshop"),
    "dashboard.bestFor": ("适合", "Best for"),
    "dashboard.quickStart": ("快速入口", "Quick Links"),
    "dashboard.or": ("或直接点击功能模块：", "Or click a feature module:"),
    "dashboard.riskLabel.low": ("低风险", "Low Risk"),
    "dashboard.riskLabel.medium": ("中风险", "Medium Risk"),
    "dashboard.riskLabel.high": ("高风险", "High Risk"),
    
    "sniper.binanceBadge": ("币安", "Binance"),
    "sniper.phantomFail": ("Phantom 连接失败", "Phantom connection failed"),
    
    "aiStrategy.tryThese": ("试试这些", "Try these"),
    "aiStrategy.strategyId": ("策略ID", "Strategy ID"),
    "aiStrategy.aiAnalysis": ("AI 分析", "AI Analysis"),
    "aiStrategy.params": ("策略参数", "Strategy Parameters"),
    "aiStrategy.riskAdvice": ("风控建议", "Risk Advice"),
    
    "strategy.1h": ("1小时", "1 Hour"),
    "strategy.4h": ("4小时", "4 Hours"),
    "strategy.daily": ("日线", "Daily"),
    "strategy.shareText": ("我用 AI 跑了一个交易策略回测", "I ran an AI trading strategy backtest"),
    "strategy.shareHint": ("截图下方卡片，分享到小红书 / X", "Screenshot the card below, share on social media"),
    "strategy.reportCard": ("策略回测成绩单", "Strategy Backtest Report Card"),
    "strategy.score": ("综合评分", "Overall Score"),
    "strategy.grade": ("评级", "Grade"),
    "strategy.conclusion": ("结论", "Conclusion"),
    "strategy.backtestResult": ("回测结果", "Backtest Result"),
    "strategy.params": ("策略参数", "Parameters"),
    "strategy.riskControl": ("风控设置", "Risk Settings"),
    "strategy.stopLoss": ("止损", "Stop Loss"),
    "strategy.takeProfit": ("止盈", "Take Profit"),
    "strategy.maxPos": ("最大仓位", "Max Position"),
    "strategy.strategySelect": ("选择策略", "Select Strategy"),
    "strategy.run": ("运行", "Run"),
    "strategy.clear": ("清空", "Clear"),
    "strategy.deployLive": ("部署实盘", "Deploy Live"),
    "strategy.advancedOptions": ("高级选项", "Advanced Options"),
    "strategy.monteRuns": ("蒙特卡洛模拟次数", "Monte Carlo Simulation Runs"),
    "strategy.optimizeBtn": ("自动优化参数", "Auto-optimize Parameters"),
    "strategy.klineData": ("K线数据", "Candlestick Data"),
    "strategy.noData": ("暂无数据", "No data"),
    "strategy.signalOverlay": ("信号叠加", "Signal Overlay"),
    "strategy.volumeProfile": ("成交量分布", "Volume Profile"),
    "strategy.drawdownChart": ("回撤曲线", "Drawdown Curve"),
    "strategy.tradeDistribution": ("交易分布", "Trade Distribution"),
    "strategy.monthlyReturn": ("月度收益", "Monthly Return"),
    "strategy.equityChart": ("资金曲线", "Equity Curve"),
    "strategy.benchmark": ("基准", "Benchmark"),
    "strategy.vs": ("对比", "vs"),
    "strategy.selectTemplate": ("选择一个策略模板开始", "Select a strategy template to start"),
    "strategy.scrollTemplates": ("向右滑动查看更多策略", "Scroll right for more strategies"),
    "strategy.backtest": ("回测", "Backtest"),
    "strategy.optimizing": ("优化中", "Optimizing"),
    "strategy.deployed": ("已部署", "Deployed"),
    "strategy.deploy": ("部署策略", "Deploy"),
    "strategy.optimize": ("参数优化", "Optimize"),
    "strategy.monteCarloTitle": ("蒙特卡洛模拟", "Monte Carlo Simulation"),
    "strategy.monteCarloBtn": ("运行蒙特卡洛", "Run Monte Carlo"),
    "strategy.monteCarloRunning": ("模拟中...", "Simulating..."),
    "strategy.median": ("中位数", "Median"),
    "strategy.best": ("最佳", "Best"),
    "strategy.worst": ("最差", "Worst"),
    "strategy.winProb": ("盈利概率", "Win Probability"),
    "strategy.resultsDistribution": ("结果分布", "Results Distribution"),
    "strategy.percentile": ("百分位", "Percentile"),
    "strategy.return": ("收益", "Return"),
    "strategy.cumulativeReturn": ("累计收益率", "Cumulative Return"),
    "strategy.loading": ("加载中...", "Loading..."),

    "elite.telegramNotif": ("Telegram 通知", "Telegram Notifications"),
    "elite.telegramConnected": ("已连接", "Connected"),
}

for key, (zh_val, en_val) in extra_keys.items():
    zh[key] = zh_val
    en[key] = en_val

with open(os.path.join(BASE, 'locales/zh.json'), 'w') as f:
    json.dump(zh, f, ensure_ascii=False, indent=2)
with open(os.path.join(BASE, 'locales/en.json'), 'w') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)
print(f"✅ Locale files: {len(zh)} keys")

def fix(filepath, reps):
    fp = os.path.join(BASE, filepath)
    with open(fp, 'r') as f:
        c = f.read()
    cnt = 0
    for old, new in reps:
        if old in c:
            c = c.replace(old, new, 1)
            cnt += 1
    with open(fp, 'w') as f:
        f.write(c)
    print(f"  {filepath}: {cnt}/{len(reps)}")

# Dashboard remaining
fix('app/dashboard/page.tsx', [
    ("fit: '适合每天都在看信号、做验证、调参数的人'", "fit: t('dashboard.path.researcher.fit')"),
    ("ctaLabel: '打开策略工坊',", "ctaLabel: t('dashboard.path.researcher.cta'),"),
    (">先按路径开始，不要在 20 个功能里乱跳<", ">{t('dashboard.pathHeader')}<"),
    ("推荐顺序统一成一条线：先做市场体检，确认当前环境；再去 Practice 校准执行；最后把想法送进策略工坊做结构化验证。", "{t('dashboard.pathIntro')}"),
    (">1. 市场体检<", ">{t('dashboard.step1')}<"),
    (">2. Practice<", ">{t('dashboard.step2')}<"),
    (">3. 策略工坊<", ">{t('dashboard.step3')}<"),
])

# Sniper remaining
fix('app/sniper/page.tsx', [
    (">币安</span>", ">{t('sniper.binanceBadge')}</span>"),
    ("e.message || 'Phantom 连接失败'", "e.message || t('sniper.phantomFail')"),
    ("💡 建议只开启「现货读取+交易」权限，关闭提币权限。<br/>", "{t('sniper.securityTip').split('\\n')[0]}<br/>"),
    ("API Key 使用 AES-256 加密存储，不以明文保存。", "{t('sniper.securityTip').split('\\n')[1]}"),
    (">下载 Phantom 钱包 →\n", ">{t('sniper.downloadPhantom')}\n"),
])

# AI-strategy remaining
fix('app/ai-strategy/page.tsx', [
    ("> 试试这些<", "> {t('aiStrategy.tryThese')}<"),
    (">策略ID:", ">{t('aiStrategy.strategyId')}:"),
    (">AI 分析<", ">{t('aiStrategy.aiAnalysis')}<"),
    (">策略参数<", ">{t('aiStrategy.params')}<"),
    (">风控建议<", ">{t('aiStrategy.riskAdvice')}<"),
])

# Elite remaining
fix('app/elite/page.tsx', [
    # Second occurrence of "断开连接"
    (">\n                断开连接\n", ">\n                {t('elite.disconnect')}\n"),
    (">\n              Telegram 通知\n", ">\n              {t('elite.telegramNotif')}\n"),
    (">已连接</span>\n", ">{t('elite.telegramConnected')}</span>\n"),
    (">\n                断开连接\n", ">\n                {t('elite.disconnect')}\n"),
])

# Course page — the features arrays are kept as Chinese (used as zh data), but rendering should use locale
# The features are in PLANS constant — they will be used alongside featuresEn in rendering  
# We need to update the rendering to pick the right features based on locale
course_path = os.path.join(BASE, 'app/course/page.tsx')
with open(course_path, 'r') as f:
    cc = f.read()

# Fix remaining course page Chinese that's in JSX
cc = cc.replace(
    "<Star className=\"w-4 h-4\" /> 早鸟优惠 · 限前100名",
    "<Star className=\"w-4 h-4\" /> {t('course.earlyBird')}"
)
cc = cc.replace(">最受欢迎\n", ">{t('course.mostPopular')}\n")

# The remaining are the features arrays that are kept as zh data alongside featuresEn
# These are data constants — we need the rendering to pick by locale
# Find where features are rendered: {plan.features.map(f => ...
# Change to {(locale === 'en' ? plan.featuresEn : plan.features).map(f => ...
cc = cc.replace(
    "{plan.features.map(f =>",
    "{((locale === 'en' && plan.featuresEn) ? plan.featuresEn : plan.features).map(f =>"
)

# Also need locale from useI18n - update const
cc = cc.replace("const { t } = useI18n();", "const { t, locale } = useI18n();")

# Fix plan.name and plan.eliteLabel to use locale
cc = cc.replace("{plan.name}", "{locale === 'en' && plan.nameEn ? plan.nameEn : plan.name}")
cc = cc.replace("{plan.eliteLabel}", "{locale === 'en' && plan.eliteLabelEn ? plan.eliteLabelEn : plan.eliteLabel}")

with open(course_path, 'w') as f:
    f.write(cc)
print(f"  app/course/page.tsx: locale-aware rendering")

# Strategy page - lots of remaining Chinese. Let me check what's left
strat_path = os.path.join(BASE, 'app/strategy/page.tsx')
with open(strat_path, 'r') as f:
    spc = f.read()

# Fix strategy page remaining items
strat_fixes = [
    ("const tfLabel: Record<string,string> = { '1h': '1小时', '4h': '4小时', '1d': '日线' };",
     "const tfLabel: Record<string,string> = { '1h': tr('strategy.1h'), '4h': tr('strategy.4h'), '1d': tr('strategy.daily') };"),
    ("const shareText = `我用 AI 跑了一个交易策略回测", "const shareText = `${tr('strategy.shareText')}"),
    (">截图下方卡片，分享到小红书 / X<", ">{tr('strategy.shareHint')}<"),
    (">策略回测成绩单<", ">{tr('strategy.reportCard')}<"),
]

for old, new in strat_fixes:
    if old in spc:
        spc = spc.replace(old, new, 1)

# Replace all remaining Chinese that's in the strategy page
# These are mostly in the detail modal and other UI elements
# Let's do broad pattern replacements for common labels
remaining_strat = [
    (">综合评分<", ">{tr('strategy.score')}<"),
    (">评级<", ">{tr('strategy.grade')}<"),
    (">结论<", ">{tr('strategy.conclusion')}<"),
    (">回测结果<", ">{tr('strategy.backtestResult')}<"),
    (">策略参数<", ">{tr('strategy.params')}<"),
    (">风控设置<", ">{tr('strategy.riskControl')}<"),
    (">止损<", ">{tr('strategy.stopLoss')}<"),
    (">止盈<", ">{tr('strategy.takeProfit')}<"),
    (">最大仓位<", ">{tr('strategy.maxPos')}<"),
    (">选择策略<", ">{tr('strategy.strategySelect')}<"),
    (">运行<", ">{tr('strategy.run')}<"),
    (">清空<", ">{tr('strategy.clear')}<"),
    (">部署实盘<", ">{tr('strategy.deployLive')}<"),
    (">高级选项<", ">{tr('strategy.advancedOptions')}<"),
    (">自动优化参数<", ">{tr('strategy.optimizeBtn')}<"),
    (">K线数据<", ">{tr('strategy.klineData')}<"),
    (">暂无数据<", ">{tr('strategy.noData')}<"),
    (">信号叠加<", ">{tr('strategy.signalOverlay')}<"),
    (">成交量分布<", ">{tr('strategy.volumeProfile')}<"),
    (">回撤曲线<", ">{tr('strategy.drawdownChart')}<"),
    (">交易分布<", ">{tr('strategy.tradeDistribution')}<"),
    (">月度收益<", ">{tr('strategy.monthlyReturn')}<"),
    (">资金曲线<", ">{tr('strategy.equityChart')}<"),
    (">基准<", ">{tr('strategy.benchmark')}<"),
    (">对比<", ">{tr('strategy.vs')}<"),
    (">蒙特卡洛模拟<", ">{tr('strategy.monteCarloTitle')}<"),
    (">运行蒙特卡洛<", ">{tr('strategy.monteCarloBtn')}<"),
    (">模拟中...<", ">{tr('strategy.monteCarloRunning')}<"),
    (">中位数<", ">{tr('strategy.median')}<"),
    (">盈利概率<", ">{tr('strategy.winProb')}<"),
    (">结果分布<", ">{tr('strategy.resultsDistribution')}<"),
    (">百分位<", ">{tr('strategy.percentile')}<"),
    (">累计收益率<", ">{tr('strategy.cumulativeReturn')}<"),
    (">加载中...<", ">{tr('strategy.loading')}<"),
    ("'选择一个策略模板开始'", "tr('strategy.selectTemplate')"),
    ("'向右滑动查看更多策略'", "tr('strategy.scrollTemplates')"),
]

cnt = 0
for old, new in remaining_strat:
    while old in spc:
        spc = spc.replace(old, new, 1)
        cnt += 1

# Handle strategy names/descriptions: locale === 'en' ? s.nameEn : s.name
# Find patterns where strategy name/description is used in JSX
spc = spc.replace("{s.name}", "{locale === 'en' ? s.nameEn || s.name : s.name}")
spc = spc.replace("{s.description}", "{locale === 'en' ? s.descriptionEn || s.description : s.description}")

# Handle param labels
spc = spc.replace("{p.label}", "{locale === 'en' ? p.labelEn || p.label : p.label}")

with open(strat_path, 'w') as f:
    f.write(spc)
print(f"  app/strategy/page.tsx: {cnt} additional replacements + locale-aware rendering")

print(f"\n✅ Round 3c complete! Total keys: {len(zh)}")
