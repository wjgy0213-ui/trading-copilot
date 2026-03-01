import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '策略工坊 — 8大策略模板一键回测',
  description: '8种交易策略模板，参数优化器，蒙特卡洛模拟1000次。免费回测，科学交易。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
