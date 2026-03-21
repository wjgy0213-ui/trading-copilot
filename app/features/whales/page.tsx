import { Metadata } from 'next';
import WhalesFeatureClient from './WhalesFeatureClient';

export const metadata: Metadata = {
  title: 'Whale Tracker — Follow Smart Money in Crypto',
  description: 'Track whale wallet movements in real-time. See large transfers, exchange deposits/withdrawals, and smart money positioning. Follow the whales, not the crowd.',
  keywords: ['whale tracker', 'crypto whale movements', 'smart money', 'whale alert', 'large transactions', 'on-chain tracking'],
  openGraph: {
    title: 'Whale Tracker — Trading Copilot',
    description: 'Real-time whale movement tracking. Follow smart money, not the crowd.',
  },
};

export default function WhalesFeaturePage() {
  return <WhalesFeatureClient />;
}
