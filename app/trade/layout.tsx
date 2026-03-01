import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '纸盘交易练习 — AI实时评分',
  description: '真实BTC价格环境下练习交易，AI实时评分仓位管理、止损设置、情绪化程度。零风险建立交易纪律。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
