import { Metadata } from 'next';
import { Radio } from 'lucide-react';
import FeatureLanding from '@/components/FeatureLanding';

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
  return (
    <FeatureLanding
      icon={<Radio className="w-8 h-8 text-cyan-400" />}
      title="Signal Aggregator"
      subtitle="Multi-source signals, one unified feed"
      description="Stop checking 10 different dashboards. Our AI aggregates signals from technical indicators, on-chain data, whale movements, and market sentiment — scoring each signal for reliability."
      color="cyan"
      ctaHref="/signals"
      benefits={[
        'Technical indicator signals (RSI, MACD, Bollinger, EMA crossovers)',
        'On-chain signals (large transfers, exchange inflows/outflows)',
        'Whale movement alerts with wallet tracking',
        'Sentiment analysis from social media and news',
        'AI confidence scoring for each signal (0-100)',
        'Historical accuracy tracking per signal source',
        'Custom alert rules and notification preferences',
        'Unified timeline view — no more tab-switching',
      ]}
      howItWorks={[
        { step: '1', title: 'AI Collects Signals', desc: 'Our system continuously monitors technical, on-chain, sentiment, and whale data sources.' },
        { step: '2', title: 'Score & Rank', desc: 'Each signal gets an AI confidence score based on historical accuracy and current market context.' },
        { step: '3', title: 'Act on High-Confidence Signals', desc: 'Focus on signals scoring 70+ for the highest probability trades.' },
      ]}
      relatedFeatures={[
        { name: 'Market Health', href: '/features/health', desc: 'Comprehensive market condition analysis' },
        { name: 'Meme Sniper', href: '/features/sniper', desc: 'Early detection of trending tokens' },
        { name: 'Whale Tracker', href: '/features/whales', desc: 'Follow smart money' },
      ]}
    />
  );
}
