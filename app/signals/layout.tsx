import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signal Aggregator — On-chain × Technical × Macro Fusion',
  description: 'On-chain 35% × Technical 35% × Macro 30% signal fusion with confidence scoring. 12 real-time data sources.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
