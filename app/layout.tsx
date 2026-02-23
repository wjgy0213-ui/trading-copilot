import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "交易陪练AI | 从韭菜到交易者的第一步",
  description: "零风险模拟交易，AI教练实时评分。在真实价格环境下练习做多做空，学习止损止盈，告别情绪化操作。支持BTC、ETH、SOL。",
  keywords: "交易练习,模拟交易,AI教练,比特币,加密货币,交易纪律,纸盘交易",
  openGraph: {
    title: "交易陪练AI | 零风险练习，AI实时评分",
    description: "从韭菜到交易者的第一步。虚拟$500账户，真实价格，AI教练陪你每一笔交易。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
