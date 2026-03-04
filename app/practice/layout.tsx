import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '交易陪练 — 虚拟$10K+AI教练评分',
  description: '虚拟$10K账户，真实价格，AI教练每笔评分，Bronze→Platinum分级解锁。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
