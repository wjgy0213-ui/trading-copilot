import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '交易课程 — 从入门到进阶',
  description: '系统化交易课程，8章25+课时。心态管理、技术分析、风险控制。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
