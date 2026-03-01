import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录 — 交易陪练 AI',
  description: '登录你的交易陪练AI账户，继续你的交易练习之旅。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
