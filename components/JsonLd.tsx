export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Trading Copilot",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "url": "https://www.tradingcopilot.app",
    "description": "AI-powered trading practice system with strategy backtesting, Monte Carlo simulation, market health check, whale tracking, and risk management tools.",
    "offers": [
      {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "name": "Free",
        "description": "Market health check, practice mode, basic strategies"
      },
      {
        "@type": "Offer",
        "price": "39.99",
        "priceCurrency": "USD",
        "name": "Pro",
        "description": "Strategy optimizer, Monte Carlo, risk guardian, AI review"
      },
      {
        "@type": "Offer",
        "price": "79.99",
        "priceCurrency": "USD",
        "name": "Elite",
        "description": "Exchange integration, signal aggregator, whale tracker, Telegram alerts"
      }
    ],
    "featureList": [
      "AI Trading Practice with Real-time Scoring",
      "Strategy Backtesting with 12+ Templates",
      "Monte Carlo Simulation (1000x)",
      "Market Health Check (5 Dimensions)",
      "Risk Guardian with Liquidation Calculator",
      "Whale Tracker",
      "Signal Aggregator (On-chain × Technical × Macro)",
      "AI Trade Review Journal"
    ],
    "author": {
      "@type": "Person",
      "name": "SlowManJW",
      "url": "https://x.com/SlowManJW"
    }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is this real money trading?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Trading Copilot uses virtual funds for practice. You can trade with $10,000 virtual money using real market data, with AI coaching that reviews every trade. No real money is at risk."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AI trading coach work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The AI coach analyzes every trade you make — entry timing, position sizing, risk management, and exit decisions. It identifies patterns like overtrading, revenge trading, and emotional entries, then provides personalized feedback to help you improve."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to register?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No registration required for basic features. You get 3 free strategy backtests per day, access to the Market Health Dashboard, and the Practice Trading mode. Pro and Elite tiers require a subscription for advanced features."
        }
      },
      {
        "@type": "Question",
        "name": "What makes Trading Copilot different from TradingView or other platforms?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Trading Copilot is purpose-built for learning and practice. While TradingView excels at charting, Trading Copilot focuses on the practice-to-profit journey with AI coaching, progressive skill levels (Bronze to Platinum), risk management tools, and 11 integrated trading tools in one platform."
        }
      },
      {
        "@type": "Question",
        "name": "How long should I practice before trading with real money?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We recommend 2-3 months of consistent virtual trading with profitability before transitioning to real money. With AI coaching, this timeline can be shortened to 1-2 months. The key is proving consistency, not just having a few good trades."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
