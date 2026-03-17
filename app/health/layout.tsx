import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Health Check — One-click 5D Score',
  description: '5-dimensional market health: Fear & Greed, ITC Risk, Momentum, Funding Rate, Volatility. Traffic-light view.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
