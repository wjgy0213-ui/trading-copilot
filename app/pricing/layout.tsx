import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Start Free, Upgrade When Ready',
  description: 'Free / Pro $39.99 / Elite $79.99. 24-hour free trial, no credit card required.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
