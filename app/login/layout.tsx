import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — Trading Copilot AI',
  description: 'Log in to your Trading Copilot AI account to continue your trading journey.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
