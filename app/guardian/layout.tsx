import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '风控守门员 — 五维风险实时扫描',
  description: '五维风控：集中度、杠杆、回撤、相关性、爆仓距离。实时警报+行动建议。Elite专属。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
