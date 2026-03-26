import json

with open('locales/en.json') as f: en = json.load(f)
with open('locales/zh.json') as f: zh = json.load(f)

new_en = {
    "strategy.clearButton": "Clear",
    "strategy.runBacktest": "Run Backtest",
    "strategy.applyHintText": 'Click "Apply" to load optimal parameters into sliders',
    "strategy.resultsPlaceholder": "Results will appear here",
    "strategy.overallScore": "Overall Score",
    "strategy.gradeS": "S",
    "strategy.gradeA": "A",
    "strategy.gradeB": "B",
    "strategy.gradeC": "C",
    "strategy.avgHoldBars": "Avg {bars} bars",
    "strategy.shareOverallScore": "Overall Score",
    "strategy.shareGradeSuffix": "",
    "strategy.shareTotalReturn": "Total Return",
    "strategy.shareWinRate": "Win Rate",
    "strategy.shareMaxDD": "Max DD",
    "strategy.shareFreeTrialCTA": "Free trial",
    "strategy.interpWinRateTitle": "Win Rate {pct}%",
    "strategy.interpWinRateHigh": "Over half of trades are profitable. But high win rate doesn't equal profits \u2014 the key is whether the risk-reward ratio matches.",
    "strategy.interpWinRateLow": "Less than half of trades are profitable. That's okay \u2014 as long as winners are bigger than losers, low win rate can still be consistently profitable. Trend strategies typically have 35-45% win rate.",
    "strategy.interpMaxDDTitle": "Max Drawdown {pct}%",
    "strategy.interpMaxDDLow": "Excellent drawdown control. Under 15% indicates a robust strategy.",
    "strategy.interpMaxDDMid": "Moderate level. Can you stomach this much decline in live trading? Psychological endurance is key.",
    "strategy.interpMaxDDHigh": "Drawdown is too large. It will be hard to stay disciplined in live trading. Consider reducing position size or tightening stops.",
    "strategy.interpTotalTradesTitle": "Total Trades: {count}",
    "strategy.interpTotalTradesHigh": "Sufficient sample size. Results are statistically meaningful.",
    "strategy.interpTotalTradesLow": "Too few trades. Results may be heavily influenced by individual trades. Consider extending the backtest period.",
    "strategy.interpTotalReturnTitle": "Total Return {pct}%",
    "strategy.interpTotalReturnPositive": "Strategy is profitable overall. But remember: past profits don't guarantee the future \u2014 use Monte Carlo to see performance under different luck scenarios.",
    "strategy.interpTotalReturnNegative": "Strategy is losing overall. First check if stop-loss is too tight, if entry signals are effective, then consider parameter optimization.",
    "strategy.practiceTrainCTA": "Go to Practice \u2192"
}

new_zh = {
    "strategy.clearButton": "\u6e05\u7a7a",
    "strategy.runBacktest": "\u8fd0\u884c\u56de\u6d4b",
    "strategy.applyHintText": "\u70b9\u51fb\u201c\u5e94\u7528\u201d\u5c06\u6700\u4f18\u53c2\u6570\u586b\u5165\u6ed1\u5757",
    "strategy.resultsPlaceholder": "\u7ed3\u679c\u5c06\u663e\u793a\u5728\u8fd9\u91cc",
    "strategy.overallScore": "\u7efc\u5408\u8bc4\u5206",
    "strategy.gradeS": "S\u7ea7",
    "strategy.gradeA": "A\u7ea7",
    "strategy.gradeB": "B\u7ea7",
    "strategy.gradeC": "C\u7ea7",
    "strategy.avgHoldBars": "\u5e73\u5747{bars}\u6839K\u7ebf",
    "strategy.shareOverallScore": "\u7efc\u5408\u8bc4\u5206",
    "strategy.shareGradeSuffix": "\u7ea7",
    "strategy.shareTotalReturn": "\u603b\u6536\u76ca",
    "strategy.shareWinRate": "\u80dc\u7387",
    "strategy.shareMaxDD": "\u6700\u5927\u56de\u64a4",
    "strategy.shareFreeTrialCTA": "\u514d\u8d39\u8bd5\u7528",
    "strategy.interpWinRateTitle": "\u80dc\u7387 {pct}%",
    "strategy.interpWinRateHigh": "\u8d85\u8fc7\u534a\u6570\u4ea4\u6613\u76c8\u5229\u3002\u4f46\u80dc\u7387\u9ad8\u4e0d\u7b49\u4e8e\u8d5a\u94b1\u2014\u2014\u5173\u952e\u770b\u76c8\u4e8f\u6bd4\u662f\u5426\u5339\u914d\u3002",
    "strategy.interpWinRateLow": "\u4e0d\u5230\u4e00\u534a\u4ea4\u6613\u76c8\u5229\u3002\u8fd9\u6ca1\u95ee\u9898\u2014\u2014\u53ea\u8981\u6bcf\u6b21\u8d62\u7684\u6bd4\u8f93\u7684\u591a\uff0c\u4f4e\u80dc\u7387\u4e5f\u80fd\u7a33\u5b9a\u8d5a\u94b1\u3002\u8d8b\u52bf\u7b56\u7565\u901a\u5e38 35-45% \u80dc\u7387\u3002",
    "strategy.interpMaxDDTitle": "\u6700\u5927\u56de\u64a4 {pct}%",
    "strategy.interpMaxDDLow": "\u56de\u64a4\u63a7\u5236\u51fa\u8272\uff0c15% \u4ee5\u4e0b\u8bf4\u660e\u7b56\u7565\u7a33\u5065\u3002",
    "strategy.interpMaxDDMid": "\u4e2d\u7b49\u6c34\u5e73\u3002\u5b9e\u76d8\u4e2d\u4f60\u80fd\u627f\u53d7\u8d26\u6237\u7f29\u6c34\u8fd9\u4e48\u591a\u5417\uff1f\u5fc3\u7406\u627f\u53d7\u529b\u662f\u5173\u952e\u3002",
    "strategy.interpMaxDDHigh": "\u56de\u64a4\u504f\u5927\uff0c\u5b9e\u76d8\u53ef\u80fd\u5f88\u96be\u575a\u6301\u3002\u5efa\u8bae\u964d\u4f4e\u4ed3\u4f4d\u6216\u52a0\u7d27\u6b62\u635f\u6765\u538b\u7f29\u56de\u64a4\u3002",
    "strategy.interpTotalTradesTitle": "\u603b\u4ea4\u6613 {count} \u7b14",
    "strategy.interpTotalTradesHigh": "\u6837\u672c\u91cf\u8db3\u591f\uff0c\u7ed3\u679c\u6709\u7edf\u8ba1\u610f\u4e49\u3002",
    "strategy.interpTotalTradesLow": "\u4ea4\u6613\u7b14\u6570\u504f\u5c11\uff0c\u7ed3\u679c\u53ef\u80fd\u53d7\u4e2a\u522b\u4ea4\u6613\u5f71\u54cd\u8f83\u5927\u3002\u5efa\u8bae\u62c9\u957f\u56de\u6d4b\u5468\u671f\u589e\u52a0\u6837\u672c\u3002",
    "strategy.interpTotalReturnTitle": "\u603b\u6536\u76ca {pct}%",
    "strategy.interpTotalReturnPositive": "\u7b56\u7565\u6574\u4f53\u76c8\u5229\u3002\u4f46\u522b\u5fd8\u4e86\uff1a\u8fc7\u53bb\u76c8\u5229\u4e0d\u4fdd\u8bc1\u672a\u6765\u2014\u2014\u7528\u8499\u7279\u5361\u6d1b\u770b\u770b\u5728\u4e0d\u540c\u8fd0\u6c14\u4e0b\u8868\u73b0\u5982\u4f55\u3002",
    "strategy.interpTotalReturnNegative": "\u7b56\u7565\u6574\u4f53\u4e8f\u635f\u3002\u5148\u68c0\u67e5\u6b62\u635f\u662f\u5426\u592a\u7d27\u3001\u5165\u573a\u4fe1\u53f7\u662f\u5426\u6709\u6548\uff0c\u518d\u8003\u8651\u53c2\u6570\u4f18\u5316\u3002",
    "strategy.practiceTrainCTA": "\u53bb Practice \u8bad\u7ec3 \u2192"
}

en.update(new_en)
zh.update(new_zh)

with open('locales/en.json', 'w') as f: json.dump(en, f, ensure_ascii=False, indent=2)
with open('locales/zh.json', 'w') as f: json.dump(zh, f, ensure_ascii=False, indent=2)

print(f"EN keys: {len(en)}, ZH keys: {len(zh)}")
print(f"Added {len(new_en)} new keys")
