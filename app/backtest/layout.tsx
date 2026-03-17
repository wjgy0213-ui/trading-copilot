import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backtest Details — Strategy Verification Results',
  description: 'View detailed backtest results, equity curves, and key metrics.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
