import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account — Subscription & Settings',
  description: 'Manage your subscription, account info, and preferences.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
