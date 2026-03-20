import { Metadata } from 'next';
import ReviewFeatureClient from './ReviewFeatureClient';

export const metadata: Metadata = {
  title: 'AI Trade Review — Automated Trading Journal & Analysis',
  description: 'AI-powered trade journaling that automatically imports your trades and finds behavioral patterns. Detect revenge trading, time bias, and fee blindness. Improve your win rate systematically.',
  keywords: ['trading journal', 'trade review', 'AI trade analysis', 'trading psychology', 'revenge trading', 'trading performance'],
  openGraph: {
    title: 'AI Trade Review — Trading Copilot',
    description: 'Automatic trade import + AI behavioral analysis. Find what\'s costing you money.',
  },
};

export default function ReviewFeaturePage() {
  return <ReviewFeatureClient />;
}
