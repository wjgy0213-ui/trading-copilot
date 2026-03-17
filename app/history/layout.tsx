import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade History — Review Every Trade',
  description: 'View AI scores, P&L stats, and timeline for all closed trades. Learn from history.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
