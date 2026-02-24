import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "交易陪练AI - 从韭菜到交易者 | AI Trading Coach",
  description: "零风险模拟交易，AI教练实时评分。17个币种+美股Mag7，完整交易课程（8章25课），帮你建立交易纪律，告别亏损。",
  keywords: ["交易", "模拟交易", "AI教练", "加密货币", "比特币", "交易课程", "trading simulator", "crypto trading"],
  openGraph: {
    title: "交易陪练AI - 从韭菜到交易者",
    description: "零风险模拟交易 + AI实时评分 + 25节完整课程。你的第一步，从这里开始。",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "交易陪练AI",
    description: "零风险模拟交易，AI教练实时评分，17个币种+美股Mag7",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="bg-gray-950 text-white antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
