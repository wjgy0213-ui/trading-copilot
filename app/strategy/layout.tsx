import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Strategy Workshop — 8 Templates, One-click Backtest',
  description: '8 strategy templates, parameter optimizer, 1000x Monte Carlo simulation. Free backtesting, scientific trading.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
