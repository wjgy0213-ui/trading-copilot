import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI策略生成器 — 自然语言创建策略',
  description: '用自然语言描述你的策略想法，AI自动翻译成完整参数配置。不懂代码也能量化。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
