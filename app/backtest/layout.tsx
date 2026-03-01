import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '回测详情 — 策略验证结果',
  description: '查看策略回测的详细结果、资金曲线和关键指标。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
