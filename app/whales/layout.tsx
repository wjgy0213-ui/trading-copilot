import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '鲸鱼追踪 — 顶级交易员实时持仓',
  description: '追踪Hyperliquid顶级交易员实时持仓，多空共识分析。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
