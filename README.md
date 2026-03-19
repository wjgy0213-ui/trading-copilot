# Trading Copilot AI 🎯

> Practice crypto trading with AI coaching. Stop losing money while learning.

**[Try it free →](https://tradingcopilot.app)** | **[Blog](https://tradingcopilot.app/blog)** | **[Market Health](https://tradingcopilot.app/health)**

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## The Problem

76% of retail traders lose money (ESMA data). Most losses happen in the first 6 months — before traders develop proper risk management and emotional discipline.

**The solution:** Practice with virtual money. Get AI feedback on every trade. Build discipline before risking real capital.

## ✨ Features (11 Tools)

| Tool | Description | Access |
|------|-------------|--------|
| 🎯 **Practice Mode** | Virtual $10K portfolio with real market data | Free |
| 🤖 **AI Trading Coach** | Reviews every trade, catches emotional patterns | Free/Pro |
| ⚡ **Market Health Check** | 5-dimension analysis (F&G, momentum, volatility, funding, risk) | Free |
| 📊 **Dashboard** | 15+ ITC risk indicators with real-time data | Free |
| 🔬 **Strategy Backtester** | 12+ strategy templates with parameter tuning | 3/day free |
| 🎲 **Monte Carlo Simulation** | 1000x randomized trade sequences for robustness testing | Pro |
| 🚀 **Meme Coin Scanner** | 5-dimension scoring for new tokens | Pro |
| 🐋 **Whale Tracker** | Large transaction monitoring | Elite |
| 📡 **Signal Aggregator** | On-chain × Technical × Macro signal fusion | Elite |
| 🛡️ **Risk Guardian** | 5-dimension risk analysis + liquidation warning | Pro |
| 📝 **AI Trade Review** | Journal with AI-powered performance analysis | Pro |

## 🚀 Quick Start

```bash
git clone https://github.com/wjgy0213-ui/trading-copilot.git
cd trading-copilot
npm install
npm run dev
# Open http://localhost:3000
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_COINGECKO_API=https://api.coingecko.com/api/v3
NEXTAUTH_SECRET=your-secret

# Optional (for full features)
ITC_API_KEY=your-itc-key
STRIPE_SECRET_KEY=your-stripe-key
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## 📱 Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Product overview, pricing, FAQ |
| Dashboard | `/dashboard` | 15+ risk indicators with real-time data |
| Health Check | `/health` | 5-dimension market health score |
| Practice | `/practice` | Virtual trading with AI scoring |
| Strategy Lab | `/strategy` | Backtester + Monte Carlo + optimizer |
| Signals | `/signals` | Multi-source signal aggregation |
| Whale Tracker | `/whales` | Large transaction monitoring |
| Meme Scanner | `/sniper` | New token discovery + scoring |
| Risk Guardian | `/guardian` | Portfolio risk analysis |
| AI Review | `/review` | Trade journal with AI feedback |
| Blog | `/blog` | Trading education articles |

## 🏗️ Tech Stack

- **Framework:** Next.js 16 + TypeScript
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js (Google OAuth)
- **Payments:** Stripe
- **Data:** CoinGecko, ITC, DeFiLlama, Alternative.me APIs
- **Hosting:** Vercel

## 📝 Blog

We publish trading education articles optimized for both human readers and AI search engines:

- [Best Crypto Trading Practice App 2026](https://tradingcopilot.app/blog/best-crypto-trading-practice-app-2026)
- [How to Practice Without Losing Money](https://tradingcopilot.app/blog/how-to-practice-crypto-trading-without-losing-money)
- [7 Trading Mistakes That Cost Beginners Thousands](https://tradingcopilot.app/blog/crypto-trading-mistakes-beginners)
- [Fear & Greed Index Guide](https://tradingcopilot.app/blog/what-is-fear-and-greed-index-crypto)
- [Monte Carlo Simulation Explained](https://tradingcopilot.app/blog/monte-carlo-simulation-trading-explained)
- [Position Sizing Calculator](https://tradingcopilot.app/blog/position-sizing-calculator-crypto)
- [AI Trading Tools 2026](https://tradingcopilot.app/blog/ai-trading-tools-2026-guide)

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Health check, practice mode, 3 backtests/day |
| Pro | $39.99/mo | Optimizer, Monte Carlo, risk guardian, AI review |
| Elite | $79.99/mo | Exchange integration, signals, whales, Telegram alerts |

## 🤝 Contributing

Issues and PRs welcome. See [DEVELOPMENT.md](DEVELOPMENT.md) for setup details.

## 📄 License

MIT

---

Built by a trader who lost money learning the hard way. [Try it free →](https://tradingcopilot.app)
