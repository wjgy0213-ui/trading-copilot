import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '信号聚合器 — 链上×技术×宏观三层融合',
  description: '链上35%×技术35%×宏观30%三层信号融合，生成置信度评分。12个数据源实时聚合。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
