import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '候补名单 — 抢先体验新功能',
  description: '加入候补名单，第一时间获取新功能通知和专属优惠。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
