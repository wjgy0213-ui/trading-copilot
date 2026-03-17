import { Metadata } from 'next';
import { Activity } from 'lucide-react';
import FeatureLanding from '@/components/FeatureLanding';

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
  return (
    <FeatureLanding
      icon={<Activity className="w-8 h-8 text-blue-400" />}
      title="AI Market Health Check"
      subtitle="Know the market conditions before you trade"
      description="Our AI analyzes 15+ real-time indicators — Fear & Greed Index, funding rates, whale movements, on-chain metrics, and more — to give you a clear picture of market conditions in seconds."
      color="blue"
      ctaHref="/health"
      benefits={[
        '15+ real-time market indicators in one dashboard',
        'Fear & Greed Index with historical context',
        'Funding rate analysis across major exchanges',
        'Whale movement detection and alerts',
        'On-chain metrics (MVRV, Puell Multiple, SOPR)',
        'AI-generated market summary in plain language',
        'Risk level assessment: Safe / Caution / Danger',
        'Updated every 5 minutes with live data',
      ]}
      howItWorks={[
        { step: '1', title: 'Open Market Health', desc: 'Navigate to the Health Check page — no setup required.' },
        { step: '2', title: 'AI Analyzes 15+ Indicators', desc: 'Our AI pulls real-time data from exchanges, on-chain sources, and sentiment feeds.' },
        { step: '3', title: 'Get Your Market Report', desc: 'Receive a clear risk assessment with actionable insights — should you trade now, wait, or reduce exposure?' },
      ]}
      relatedFeatures={[
        { name: 'Signal Aggregator', href: '/features/signals', desc: 'Multi-source trading signals in one feed' },
        { name: 'Meme Sniper', href: '/features/sniper', desc: 'Detect trending meme coins early' },
        { name: 'Whale Tracker', href: '/features/whales', desc: 'Follow smart money movements' },
      ]}
    />
  );
}
