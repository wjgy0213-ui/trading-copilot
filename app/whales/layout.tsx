import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Whale Tracker — Top Trader Live Positions',
  description: 'Track top Hyperliquid traders live positions with long/short consensus analysis.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
