import { Metadata } from 'next';
import { Brain } from 'lucide-react';
import FeatureLanding from '@/components/FeatureLanding';

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
  return (
    <FeatureLanding
      icon={<Brain className="w-8 h-8 text-rose-400" />}
      title="AI Trade Review"
      subtitle="Find what's really costing you money"
      description="Most traders lose not because of bad strategies, but bad execution. Our AI imports your trades automatically and detects behavioral patterns — revenge trading, time bias, overtrading, and more."
      color="rose"
      ctaHref="/review"
      benefits={[
        'Automatic trade import from Binance, OKX, Bybit, Hyperliquid',
        'Revenge trading detection — trades after consecutive losses',
        'Time-of-day analysis — when are you most/least profitable?',
        'Position sizing analysis — are you over-leveraging after wins?',
        'Fee impact calculation — how much are fees eating your profits?',
        'Trading session scoring (0-100) with trend tracking',
        'Behavioral pattern reports with actionable recommendations',
        'Export reports for personal record-keeping',
      ]}
      howItWorks={[
        { step: '1', title: 'Connect Your Exchange', desc: 'Link your Binance, OKX, Bybit, or Hyperliquid account (read-only API key).' },
        { step: '2', title: 'AI Analyzes Your History', desc: 'Our AI processes your trading history to find behavioral patterns and execution errors.' },
        { step: '3', title: 'Get Actionable Insights', desc: 'Receive specific recommendations: "Stop trading after 10 PM — your win rate drops 40%."' },
      ]}
      relatedFeatures={[
        { name: 'Paper Trading', href: '/features/practice', desc: 'Practice before risking real money' },
        { name: 'Risk Guardian', href: '/features/guardian', desc: 'Automated risk limits' },
        { name: 'Market Health', href: '/features/health', desc: 'Check market conditions first' },
      ]}
    />
  );
}
