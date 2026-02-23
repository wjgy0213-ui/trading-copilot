# 交易陪练AI 🎯

> 从韭菜到交易者的第一步

零风险模拟交易平台，AI教练实时评分，帮你建立交易纪律，告别情绪化操作。

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 功能

- **纸盘交易** — 虚拟$500账户，接入真实BTC/ETH/SOL价格
- **AI教练** — 每笔交易即时评分，分析止损、仓位、杠杆
- **风险管理** — 支持止损止盈、1-10x杠杆
- **资金曲线** — 可视化你的资金变化和最大回撤
- **交易统计** — 胜率、盈亏比、平均AI评分
- **入门课程** — 5课完整交易基础教程
- **复盘日志** — 每笔交易都有AI反馈

## 🚀 快速开始

```bash
npm install
npm run dev
# 打开 http://localhost:3000
```

## 📱 页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | `/` | 产品介绍 |
| 交易 | `/trade` | 模拟交易面板 |
| 历史 | `/history` | 交易记录 + 资金曲线 |
| 课程 | `/learn` | 交易入门5课 |

## 🎯 目标用户

**韭菜觉醒者** — 在市场里亏过钱，想系统学习交易的人。

不是给高手用的工具，是给新手建立纪律的教练。

## 🛠 技术栈

- **Next.js 15** + TypeScript + Tailwind CSS
- **静态导出** — 无需服务器，部署到任何静态托管
- **LocalStorage** — 数据本地存储，无需登录
- **CoinGecko API** — 实时价格数据

## 📦 部署

```bash
npm run build  # 静态文件输出到 out/
```

支持: Vercel / GitHub Pages / Cloudflare Pages / 任何静态托管

详见 [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

## ⚠️ 免责声明

本工具仅用于教育目的，不构成投资建议。加密货币交易存在高风险，请谨慎操作。

---

Made with ❤️ by [SlowMan](https://x.com/SlowManJW)
