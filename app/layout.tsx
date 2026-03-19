import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import PageViewTracker from "@/components/PageViewTracker";

export const viewport = {
  themeColor: '#030712',
};

export const metadata: Metadata = {
  verification: {
    google: '7BwDIMV3DNn8jAtcwY4ZfWBTeCRDiUsOQ4hO7HpUkqc',
  },
  title: {
    default: "Trading Copilot AI — Strategy Backtest · AI Generation · Monte Carlo Simulation",
    template: "%s | Trading Copilot AI",
  },
  description: "11 AI trading tools: practice mode, market health check, signal aggregator, Meme Sniper, whale tracker, AI review, risk guardian, strategy workshop, parameter optimizer. From practice to live trading.",
  keywords: ["trading strategy", "backtest", "AI trading", "quant trading", "trading copilot", "paper trading", "meme coins", "whale tracking", "risk control", "crypto trading", "trading bot", "practice trading", "crypto trading simulator", "trading practice app", "AI trading coach", "learn crypto trading", "trading journal AI", "Monte Carlo trading", "fear and greed index", "crypto risk management"],
  metadataBase: new URL('https://www.tradingcopilot.app'),
  alternates: {
    canonical: 'https://www.tradingcopilot.app',
  },
  openGraph: {
    title: "Trading Copilot AI — Your AI Trading Strategy Platform",
    description: "11 AI trading tools · Practice mode · Signal aggregator · Whale tracker · Risk guardian. Start free.",
    type: "website",
    locale: "zh_CN",
    siteName: "Trading Copilot AI",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Trading Copilot AI' }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Copilot AI",
    description: "AI-powered strategy backtest + Monte Carlo simulation + auto-optimization. Start free.",
    creator: "@SlowManJW",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <head>
        <JsonLd />
      </head>
      <body className="bg-gray-950 text-gray-100 antialiased font-sans">
        <Analytics />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <Providers>
          <Navbar />
          <main className="pt-14">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
