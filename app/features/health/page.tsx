import { Metadata } from 'next';
import HealthFeatureClient from './HealthFeatureClient';

export const metadata: Metadata = {
  title: 'AI Market Health Check — Real-Time Crypto Market Analysis',
  description: 'Get a comprehensive health check of the crypto market in seconds. 15+ indicators including Fear & Greed Index, funding rates, whale movements, and on-chain metrics. Free 3 uses/day.',
  keywords: ['crypto market analysis', 'market health check', 'fear and greed index', 'crypto indicators', 'on-chain analysis', 'BTC analysis'],
  openGraph: {
    title: 'AI Market Health Check — Trading Copilot',
    description: 'Real-time crypto market health analysis with 15+ indicators. Know before you trade.',
  },
};

export default function HealthFeaturePage() {
  return <HealthFeatureClient />;
}
