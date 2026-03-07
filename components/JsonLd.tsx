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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
