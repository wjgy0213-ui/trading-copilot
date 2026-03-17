import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paper Trading Practice — AI Real-time Scoring',
  description: 'Practice trading with real BTC prices. AI scores position management, stop-loss setup, and emotional discipline. Zero-risk trading discipline.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
