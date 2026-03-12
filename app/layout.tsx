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
    default: "交易陪练 AI — 策略回测 · AI生成 · 蒙特卡洛模拟",
    template: "%s | 交易陪练 AI",
  },
  description: "11个AI交易工具：模拟陪练、市场体检、信号聚合、Meme Sniper、鲸鱼追踪、AI复盘、风控守门员、策略工坊、参数优化。从练习到实盘，科学交易。",
  keywords: ["交易策略", "回测", "AI交易", "量化交易", "交易陪练", "模拟交易", "Meme币", "鲸鱼追踪", "风控", "crypto trading", "backtest", "trading bot", "paper trading"],
  metadataBase: new URL('https://www.tradingcopilot.app'),
  alternates: {
    canonical: 'https://www.tradingcopilot.app',
  },
  openGraph: {
    title: "交易陪练 AI — 你的AI交易策略平台",
    description: "11个AI交易工具 · 模拟陪练 · 信号聚合 · 鲸鱼追踪 · 风控守门员。免费开始。",
    type: "website",
    locale: "zh_CN",
    siteName: "交易陪练 AI",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '交易陪练 AI' }],
  },
  twitter: {
    card: "summary_large_image",
    title: "交易陪练 AI",
    description: "AI驱动策略回测+蒙特卡洛模拟+自动寻参。免费开始。",
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
