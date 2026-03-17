import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trading Course — From Beginner to Advanced',
  description: 'Systematic trading course, 8 chapters, 25+ lessons. Mindset, technical analysis, risk management.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
