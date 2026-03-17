import { Metadata } from 'next';
import { Fish } from 'lucide-react';
import FeatureLanding from '@/components/FeatureLanding';

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
  return (
    <FeatureLanding
      icon={<Fish className="w-8 h-8 text-violet-400" />}
      title="Whale Tracker"
      subtitle="Follow smart money, not the crowd"
      description="When whales move, markets follow. Our tracker monitors large wallet movements in real-time — exchange deposits, withdrawals, wallet-to-wallet transfers — so you can position before the crowd reacts."
      color="violet"
      ctaHref="/whales"
      benefits={[
        'Real-time large transaction monitoring ($100K+)',
        'Exchange inflow/outflow tracking (selling pressure indicator)',
        'Known whale wallet labeling and tracking',
        'Smart money portfolio composition analysis',
        'Historical whale activity patterns',
        'AI interpretation — what does this whale move mean?',
        'Cross-chain tracking (BTC, ETH, SOL, major L2s)',
        'Alert system for unusual whale activity',
      ]}
      howItWorks={[
        { step: '1', title: 'Monitor Whale Wallets', desc: 'Our system tracks known whale wallets and large transaction patterns across chains.' },
        { step: '2', title: 'AI Interprets Movements', desc: 'Not all whale moves are equal. AI classifies them: accumulation, distribution, or rebalancing.' },
        { step: '3', title: 'Get Actionable Alerts', desc: 'Receive alerts for significant movements with AI-generated context and suggested actions.' },
      ]}
      relatedFeatures={[
        { name: 'Market Health', href: '/features/health', desc: 'Overall market condition check' },
        { name: 'Signal Aggregator', href: '/features/signals', desc: 'Multi-source trading signals' },
        { name: 'Meme Sniper', href: '/features/sniper', desc: 'Detect trending tokens early' },
      ]}
    />
  );
}
