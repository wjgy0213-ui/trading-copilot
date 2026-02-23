# 🎯 交易陪练AI — 快速试用

## 启动
```bash
cd /Users/jacky/.openclaw/workspace/projects/trading-copilot
npm run dev
```
打开 http://localhost:3000

## 功能一览

### 1. Landing Page (首页)
- 产品介绍，面向"韭菜觉醒者"
- 点击"开始练习"进入交易页

### 2. 交易页 (/trade)
- **币种切换**: BTC / ETH / SOL（顶部按钮）
- **实时价格**: CoinGecko API，10秒刷新
- **开仓**: 做多/做空，设杠杆(1-10x)，设止损/止盈
- **持仓管理**: 实时盈亏，一键平仓
- **AI教练**: 右侧聊天窗口，可问交易问题
  - 试试问"止损怎么设？""仓位该多大？""怎么控制情绪？"

### 3. 交易历史 (/history)
- 统计摘要（胜率、盈亏、AI评分）
- 每笔交易详情 + AI评分反馈

## 试用建议
1. 先开一笔做多 BTC，$50，2x杠杆，设止损
2. 看AI给的入场评分
3. 等价格变化后平仓
4. 去历史页看复盘

## 部署（需要5分钟）
```bash
gh auth login
gh repo create trading-copilot --public --source=. --push
vercel login
vercel --prod
```
