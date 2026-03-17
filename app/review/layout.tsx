import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Trade Review — Score + Emotion Detection',
  description: 'AI analyzes trading patterns: win rate, profit factor, emotional trading detection, optimal period heatmap. Elite exclusive.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
