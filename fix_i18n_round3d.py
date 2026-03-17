#!/usr/bin/env python3
"""Round 3d - Strategy page deep fix + remaining mop-up"""
import json, re, os

BASE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE, 'locales/zh.json'), 'r') as f:
    zh = json.load(f)
with open(os.path.join(BASE, 'locales/en.json'), 'r') as f:
    en = json.load(f)

extra = {
    "strategy.annualized": ("年化收益", "Annualized"),
    "strategy.copied": ("已复制文案", "Copied"),
    "strategy.copyShare": ("复制分享文案", "Copy Share Text"),
    "strategy.saveHint": ("对卡片长按/右键另存，或截图分享", "Long press / right-click to save, or screenshot to share"),
    "strategy.backtestFail": ("回测失败", "Backtest failed"),
    "strategy.workshopTitle": ("策略工坊", "Strategy Workshop"),
    "strategy.workshopFlow": ("选择策略 → 调整参数 → 回测验证", "Select strategy → Adjust parameters → Backtest"),
    "strategy.templates": ("策略模板", "Strategy Templates"),
    "strategy.marketSettings": ("市场设置", "Market Settings"),
    "strategy.symbolLabel": ("币种", "Symbol"),
    "strategy.timeframeLabel": ("时间框架", "Timeframe"),
    "strategy.periodLabel": ("回测周期", "Backtest Period"),
    "strategy.capitalLabel": ("初始资金", "Initial Capital"),
    "strategy.riskParamsLabel": ("风控参数", "Risk Parameters"),
    "strategy.maxPositionLabel": ("最大仓位", "Max Position"),
    "strategy.feeLabel": ("手续费", "Fee"),
    "strategy.slippageLabel": ("滑点", "Slippage"),
    "strategy.logicPreview": ("策略逻辑预览", "Strategy Logic Preview"),
    "strategy.calculating": ("计算中...", "Calculating..."),
    "strategy.compareHint": ("切换策略再运行可对比（最多3个）", "Switch strategies and run to compare (max 3)"),
    "strategy.paywallOptimizer": ("参数优化器 — 自动寻找最优策略参数", "Parameter Optimizer — Auto-find best strategy parameters"),
    "strategy.searching": ("寻参中", "Searching"),
    "strategy.top5": ("🏆 Top 5 参数组合（按夏普排序）", "🏆 Top 5 Parameter Sets (by Sharpe)"),
    "strategy.paramsCol": ("参数", "Parameters"),
    "strategy.returnCol": ("收益%", "Return %"),
    "strategy.winRateCol": ("胜率", "Win Rate"),
    "strategy.sharpeCol": ("夏普", "Sharpe"),
    "strategy.drawdownCol": ("回撤", "Drawdown"),
    "strategy.apply": ("应用", "Apply"),
    "strategy.autoSearch": ("🔍 自动寻参", "🔍 Auto Search"),
    "strategy.testParams": ("测试参数组合", "Testing parameter sets"),
    "strategy.top5Best": ("🏆 Top 5 最优参数", "🏆 Top 5 Best Parameters"),
    "strategy.applyHint": ('点击"应用"将最优参数填入滑块', 'Click "Apply" to load optimal parameters into sliders'),
    "strategy.selectAndRun": ("选择策略并运行回测", "Select a strategy and run backtest"),
    "strategy.deployPaper": ("部署到纸盘", "Deploy to Paper"),
    "strategy.shareReport": ("分享成绩单", "Share Report"),
    "strategy.tradeUnit2": ("笔交易", " trades"),
    "strategy.scoreUnit": ("分", "pts"),
    "strategy.winLoss": ("胜", "W"),
    "strategy.lossLabel": ("负", "L"),
    "strategy.clearResults": ("清空结果", "Clear Results"),
    
    "dashboard.tip1": ("先看市场体检，避免在坏环境里硬做。", "Start with health check — avoid trading in bad conditions."),
    "dashboard.tip2": ("再去 Practice，把执行问题先暴露出来。", "Then Practice — expose execution issues first."),
    "dashboard.tip3": ("最后开策略工坊，把想法变成可验证方案。", "Finally, Strategy Workshop — turn ideas into testable plans."),
    "dashboard.nextStep": ("下一步推荐", "Recommended Next"),
    "dashboard.nextStepTitle": ("做完市场体检后，去 Practice 校准执行", "After health check, go to Practice to calibrate execution"),
    "dashboard.nextStepDesc": ("Dashboard 只是信息展板——真正提升交易一致性，要在 Practice 里反复练、策略工坊里结构化验证。", "Dashboard is just an info board — real consistency comes from repeated Practice and structured Strategy Workshop validation."),
    "dashboard.goToPractice": ("去 Practice 开始训练", "Go to Practice"),
    "dashboard.goToStrategy": ("去策略工坊", "Go to Strategy Workshop"),
    "dashboard.latestNews": ("最新资讯", "Latest News"),
    "dashboard.moreNews": ("查看全部资讯", "View All News"),
    "dashboard.noNews": ("暂无资讯", "No news available"),
    
    "elite.save": ("省", "Save"),
    
    "aiStrategy.slLabel": ("止损", "Stop Loss"),
    "aiStrategy.tpLabel": ("止盈", "Take Profit"),
    "aiStrategy.maxPosLabel": ("最大仓位", "Max Position"),
    "aiStrategy.suggestion": ("💡 建议", "💡 Suggestions"),
    "aiStrategy.goBacktest": ("去策略工坊回测", "Go to Strategy Workshop to Backtest"),
}

for k, (z, e) in extra.items():
    zh[k] = z
    en[k] = e

with open(os.path.join(BASE, 'locales/zh.json'), 'w') as f:
    json.dump(zh, f, ensure_ascii=False, indent=2)
with open(os.path.join(BASE, 'locales/en.json'), 'w') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)
print(f"Locale files: {len(zh)} keys")

def fix(fp, reps):
    path = os.path.join(BASE, fp)
    with open(path) as f:
        c = f.read()
    cnt = 0
    for old, new in reps:
        if old in c:
            c = c.replace(old, new, 1)
            cnt += 1
    with open(path, 'w') as f:
        f.write(c)
    print(f"  {fp}: {cnt}/{len(reps)}")

# ---- Strategy page ----
sp = os.path.join(BASE, 'app/strategy/page.tsx')
with open(sp) as f:
    c = f.read()

reps = [
    ("笔交易</div>", "{tr('strategy.tradeUnit2')}</div>"),
    ("{score}分</div>", "{score}{tr('strategy.scoreUnit')}</div>"),
    ("label: '年化收益'", "label: tr('strategy.annualized')"),
    ("已复制文案</>", "{tr('strategy.copied')}</>"),
    ("复制分享文案</>", "{tr('strategy.copyShare')}</>"),
    (">对卡片长按/右键另存，或截图分享<", ">{tr('strategy.saveHint')}<"),
    ("e.message || '回测失败'", "e.message || tr('strategy.backtestFail')"),
    (">策略工坊<", ">{tr('strategy.workshopTitle')}<"),
    (">选择策略 → 调整参数 → 回测验证<", ">{tr('strategy.workshopFlow')}<"),
    (">策略模板<", ">{tr('strategy.templates')}<"),
    (">市场设置<", ">{tr('strategy.marketSettings')}<"),
    (">币种</label>", ">{tr('strategy.symbolLabel')}</label>"),
    (">时间框架</label>", ">{tr('strategy.timeframeLabel')}</label>"),
    (">回测周期</label>", ">{tr('strategy.periodLabel')}</label>"),
    (">初始资金</label>", ">{tr('strategy.capitalLabel')}</label>"),
    (">风控参数<", ">{tr('strategy.riskParamsLabel')}<"),
    ("l:'最大仓位'", "l:tr('strategy.maxPositionLabel')"),
    ("l:'手续费'", "l:tr('strategy.feeLabel')"),
    ("l:'滑点'", "l:tr('strategy.slippageLabel')"),
    ("> 策略逻辑预览", "> {tr('strategy.logicPreview')}"),
    ("/> 计算中...</>", "/> {tr('strategy.calculating')}</>"),
    ("切换策略再运行可对比（最多3个）", "{tr('strategy.compareHint')}"),
    ("feature=\"参数优化器 — 自动寻找最优策略参数\"", "feature={tr('strategy.paywallOptimizer')}"),
    ("寻参中 {optProgress.cur", "{tr('strategy.searching')} {optProgress.cur"),
    (">🏆 Top 5 参数组合（按夏普排序）<", ">{tr('strategy.top5')}<"),
    (">参数</th>", ">{tr('strategy.paramsCol')}</th>"),
    (">收益%</th>", ">{tr('strategy.returnCol')}</th>"),
    # Multiple occurrences of 胜率/夏普/回撤 in table headers
    (">应用</button>", ">{tr('strategy.apply')}</button>"),
    ("/> 🔍 自动寻参</>", "/> {tr('strategy.autoSearch')}</>"),
    (">测试参数组合</span>", ">{tr('strategy.testParams')}</span>"),
    (">🏆 Top 5 最优参数<", ">{tr('strategy.top5Best')}<"),
    ('>点击\u201c应用\u201d将最优参数填入滑块<', ">{tr('strategy.applyHint')}<"),
    ("选择策略并运行回测", "{tr('strategy.selectAndRun')}"),
    ("/> 部署到纸盘", "/> {tr('strategy.deployPaper')}"),
    ("/> 分享成绩单", "/> {tr('strategy.shareReport')}"),
    # StatCard labels
    ("label=\"总收益\"", "label={tr('strategy.totalReturn')}"),
    ("label=\"胜率\"", "label={tr('strategy.winRateLabel')}"),
    ("label=\"盈亏比\"", "label={tr('strategy.profitFactor')}"),
    ("label=\"最大回撤\"", "label={tr('strategy.maxDrawdown')}"),
    ("label=\"夏普比率\"", "label={tr('strategy.sharpeRatio')}"),
    ("label=\"总交易\"", "label={tr('strategy.totalTrades')}"),
    # Win/loss units
    # win/loss handled separately below
    # 清空结果
    ("清空结果", "{tr('strategy.clearResults')}"),
    # 寻参中…
    ("寻参中…</>", "{tr('strategy.searching')}…</>"),
]

cnt = 0
for old, new in reps:
    if old in c:
        c = c.replace(old, new, 1)
        cnt += 1

# Handle repeated th headers (胜率, 夏普, 回撤 appear twice)
c = c.replace(">胜率</th>", ">{tr('strategy.winRateCol')}</th>")
c = c.replace(">夏普</th>", ">{tr('strategy.sharpeCol')}</th>")
c = c.replace(">回撤</th>", ">{tr('strategy.drawdownCol')}</th>")

# Handle second 应用 button
c = c.replace(">应用<", ">{tr('strategy.apply')}<")

# Fix the t.direction conflict (variable `t` clashes with trade object)
# In the trades map, `t` is used as trade variable. Since we renamed to `tr`, fix references
# Actually line 96 uses t.direction where t is the trade map variable, not translation
# That's fine - it's the trade object iteration variable
# But our tr('strategy.long') and tr('strategy.short') replacement may have broken it
# Let's check the line 96 context
# It already uses `.map((t,` where t=trade item, and we renamed translation to tr()
# So t.direction is correct (trade direction), and '做多'/'做空' should be tr('strategy.long')/tr('strategy.short')

# Fix the exitReason line (line 99ish) - it uses t.exitReason where t is trade variable
# The '止损' '止盈' '信号' replacements may have been too broad
# Let's see what happened
# Looking back at round3b: we did replace '止损' with tr('strategy.exitStopLoss') - but that's inside
# a ternary where t.exitReason is the trade variable, not the translation function
# Actually the pattern was: t.exitReason === 'stopLoss' ? '止损' : ...
# Our replacement should have correctly replaced '止损' (the string) with tr('strategy.exitStopLoss')

with open(sp, 'w') as f:
    f.write(c)
print(f"  strategy: {cnt} direct + th headers")

# ---- Dashboard remaining ----
fix('app/dashboard/page.tsx', [
    ("先看市场体检，避免在坏环境里硬做。", "{t('dashboard.tip1')}"),
    ("再去 Practice，把执行问题先暴露出来。", "{t('dashboard.tip2')}"),
    ("最后开策略工坊，把想法变成可验证方案。", "{t('dashboard.tip3')}"),
    (">下一步推荐<", ">{t('dashboard.nextStep')}<"),
    (">做完市场体检后，去 Practice 校准执行<", ">{t('dashboard.nextStepTitle')}<"),
    ("Dashboard 只是信息展板——真正提升交易一致性，要在 Practice 里反复练、策略工坊里结构化验证。", "{t('dashboard.nextStepDesc')}"),
    ("去 Practice 开始训练", "{t('dashboard.goToPractice')}"),
    ("去策略工坊", "{t('dashboard.goToStrategy')}"),
    (">最新资讯<", ">{t('dashboard.latestNews')}<"),
    (">查看全部资讯<", ">{t('dashboard.moreNews')}<"),
    (">暂无资讯<", ">{t('dashboard.noNews')}<"),
])

# ---- Sniper remaining ----
sniper_path = os.path.join(BASE, 'app/sniper/page.tsx')
with open(sniper_path) as f:
    sc = f.read()

# Fix remaining
sc = sc.replace(">下载 Phantom 钱包 →\n", ">{t('sniper.downloadPhantom')}\n")
sc = sc.replace(">5维评分</div>", ">{t('sniper.fiveDim')}</div>")
sc = sc.replace(">自动</div>", ">{t('sniper.autoExec')}</div>")
sc = sc.replace(">🚀 启动模拟盘\n", ">{t('sniper.launchPaper')}\n")
sc = sc.replace(">← 返回</button>", ">{t('sniper.back')}</button>")
# Fix duplicate label props that still have Chinese
sc = sc.replace('label="余额"', "label={t('sniper.balance')}")
sc = sc.replace('label="持仓数"', "label={t('sniper.posCount')}")
sc = sc.replace('label="胜率"', "label={t('sniper.winRate')}")
sc = sc.replace('label="最大回撤"', "label={t('sniper.maxDrawdown')}")

with open(sniper_path, 'w') as f:
    f.write(sc)
print("  sniper: remaining fixed")

# ---- AI strategy remaining ----
fix('app/ai-strategy/page.tsx', [
    (">止损</span>", ">{t('aiStrategy.slLabel')}</span>"),
    (">止盈</span>", ">{t('aiStrategy.tpLabel')}</span>"),
    (">最大仓位</span>", ">{t('aiStrategy.maxPosLabel')}</span>"),
    (">💡 建议<", ">{t('aiStrategy.suggestion')}<"),
    ("> 去策略工坊回测 <", "> {t('aiStrategy.goBacktest')} <"),
])

# ---- Elite remaining ----
elite_path = os.path.join(BASE, 'app/elite/page.tsx')
with open(elite_path) as f:
    ec = f.read()

# Fix remaining 断开连接 (both occurrences)
ec = ec.replace(">\n                断开连接\n", ">\n                {t('elite.disconnect')}\n")
ec = ec.replace(">\n                断开连接\n", ">\n                {t('elite.disconnect')}\n")

with open(elite_path, 'w') as f:
    f.write(ec)
print("  elite: disconnect buttons fixed")

# ---- Course remaining ----
fix('app/course/page.tsx', [
    # The features arrays remain as Chinese data (alongside featuresEn) - that's OK
    # Fix remaining JSX Chinese
    ("\n                  最受欢迎\n", "\n                  {t('course.mostPopular')}\n"),
    (">省${plan.originalPrice - plan.price}<", ">{t('elite.save')}${plan.originalPrice - plan.price}<"),
])

print(f"\n✅ Round 3d complete! Total keys: {len(zh)}")
