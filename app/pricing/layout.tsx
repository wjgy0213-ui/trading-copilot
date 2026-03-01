import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '定价方案 — 免费开始，按需升级',
  description: 'Free / Pro .99 / Elite .99。24小时免费试用全功能，无需信用卡。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
