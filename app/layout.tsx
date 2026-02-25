import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "交易陪练 AI — 策略回测 · AI生成 · 蒙特卡洛模拟",
    template: "%s | 交易陪练 AI",
  },
  description: "AI驱动的交易策略平台。8大策略模板、自动参数优化、蒙特卡洛1000次模拟、AI自然语言生成策略。从回测到实盘，科学交易。",
  keywords: ["交易策略", "回测", "AI交易", "量化交易", "蒙特卡洛", "策略优化", "加密货币", "crypto trading", "backtest", "trading bot"],
  metadataBase: new URL('https://trading-copilot-delta.vercel.app'),
  openGraph: {
    title: "交易陪练 AI — 你的AI交易策略平台",
    description: "8大策略模板 · 自动寻参 · 蒙特卡洛模拟 · AI策略生成。免费开始，科学交易。",
    type: "website",
    locale: "zh_CN",
    siteName: "交易陪练 AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "交易陪练 AI",
    description: "AI驱动策略回测+蒙特卡洛模拟+自动寻参。免费开始。",
    creator: "@SlowManJW",
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
      <body className="bg-gray-950 text-gray-100 antialiased font-sans">
        <Providers>
          <Navbar />
          <main className="pt-14">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
