import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Waitlist — Early Access to New Features',
  description: 'Join the waitlist to be first in line for new features and exclusive offers.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
