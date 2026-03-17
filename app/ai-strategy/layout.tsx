import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Strategy Generator — Natural Language to Strategy',
  description: 'Describe your strategy idea in natural language. AI converts it into full parameter config. No coding required.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
