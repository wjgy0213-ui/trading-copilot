import { Metadata } from 'next';
import SignalsFeatureClient from './SignalsFeatureClient';

export const metadata: Metadata = {
  title: 'Signal Aggregator — Multi-Source Crypto Trading Signals',
  description: 'Aggregate trading signals from multiple sources into one unified feed. Technical indicators, on-chain alerts, whale movements, and sentiment analysis combined with AI scoring.',
  keywords: ['crypto trading signals', 'signal aggregator', 'trading alerts', 'crypto signals', 'technical analysis signals', 'AI trading signals'],
  openGraph: {
    title: 'Signal Aggregator — Trading Copilot',
    description: 'Multi-source crypto trading signals aggregated and scored by AI.',
  },
};

export default function SignalsFeaturePage() {
  return <SignalsFeatureClient />;
}
