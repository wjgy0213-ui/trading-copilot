import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '市场新闻 — 实时加密货币资讯',
  description: 'Binance快讯、Fear & Greed指数、BTC/ETH实时价格。交易者的信息中心。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
