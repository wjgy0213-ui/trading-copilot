import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Risk Guardian — 5D Real-time Risk Scan',
  description: '5D risk control: concentration, leverage, drawdown, correlation, liquidation distance. Real-time alerts + action suggestions. Elite exclusive.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
