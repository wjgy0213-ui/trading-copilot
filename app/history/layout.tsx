import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '交易历史 — 复盘每一笔交易',
  description: '查看所有已平仓交易的AI评分、盈亏统计、时间线。从历史中学习。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
