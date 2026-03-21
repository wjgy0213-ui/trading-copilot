import { Metadata } from 'next';
import PracticeFeatureClient from './PracticeFeatureClient';

export const metadata: Metadata = {
  title: 'Paper Trading Simulator — Practice Crypto Trading Risk-Free',
  description: 'Practice crypto trading with real market data and zero risk. AI-powered paper trading simulator with performance tracking, trade journaling, and skill progression system.',
  keywords: ['paper trading', 'crypto simulator', 'trading practice', 'virtual trading', 'demo trading', 'learn crypto trading'],
  openGraph: {
    title: 'Paper Trading Simulator — Trading Copilot',
    description: 'Practice crypto trading risk-free with real market data. Track performance, build skills.',
  },
};

export default function PracticeFeaturePage() {
  return <PracticeFeatureClient />;
}
