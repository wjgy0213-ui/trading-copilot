import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI复盘日记 — 交易评分+情绪检测',
  description: 'AI分析交易模式：胜率、盈亏比、情绪化交易检测、最佳时段热力图。Elite专属。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
