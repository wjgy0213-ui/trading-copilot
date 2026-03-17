import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Dashboard — ITC Risk + Market Sentiment',
  description: 'ITC Risk indicators, Fear & Greed index, market news — all on one page. Everything you need before making decisions.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
