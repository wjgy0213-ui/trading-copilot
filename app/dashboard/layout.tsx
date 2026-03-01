import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '实时数据面板 — ITC Risk + 市场情绪',
  description: 'ITC Risk指标、恐贪指数、市场新闻一页看完。做决策前该看的数据都在这。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
