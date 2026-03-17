import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Health Check — One-click 5D Score',
  description: '5维度市场体检：Fear\&Greed、ITC Risk、动量、费率、波动率。红绿灯一目了然。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
