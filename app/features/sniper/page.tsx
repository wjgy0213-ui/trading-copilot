import { Metadata } from 'next';
import { Crosshair } from 'lucide-react';
import FeatureLanding from '@/components/FeatureLanding';

export const metadata: Metadata = {
  title: 'Meme Coin Sniper — Detect Trending Tokens Early',
  description: 'AI-powered meme coin scanner that detects trending tokens before they pump. Real-time scoring based on liquidity, momentum, community hype, and security analysis.',
  keywords: ['meme coin sniper', 'crypto token scanner', 'new token alert', 'dex screener', 'meme coin trading', 'solana meme coins'],
  openGraph: {
    title: 'Meme Coin Sniper — Trading Copilot',
    description: 'Detect trending meme coins early with AI-powered scanning and 5-dimension scoring.',
  },
};

export default function SniperFeaturePage() {
  return (
    <FeatureLanding
      icon={<Crosshair className="w-8 h-8 text-amber-400" />}
      title="Meme Coin Sniper"
      subtitle="Detect trending tokens before they pump"
      description="Our AI scans DEXs in real-time, scoring new tokens on 5 dimensions — security, liquidity, momentum, community, and timing — so you can find opportunities early without getting rugged."
      color="amber"
      ctaHref="/sniper"
      benefits={[
        '5-dimension token scoring (Security/Liquidity/Momentum/Community/Timing)',
        'Real-time DEX scanning across Solana, Base, and Ethereum',
        'Honeypot and rug-pull detection via contract analysis',
        'Liquidity depth and holder distribution analysis',
        'Social momentum tracking (Twitter, Telegram mentions)',
        'Early-stage detection — find tokens under $1M market cap',
        'Risk-adjusted scoring to filter noise from signal',
        'One-click deep-dive into any token',
      ]}
      howItWorks={[
        { step: '1', title: 'AI Scans DEXs Continuously', desc: 'Our scanner monitors new token launches and price movements across major DEXs.' },
        { step: '2', title: '5-Dimension Scoring', desc: 'Each token gets scored on security, liquidity, momentum, community hype, and timing factors.' },
        { step: '3', title: 'Curated Results', desc: 'Only tokens passing safety thresholds are shown — ranked by opportunity score.' },
      ]}
      relatedFeatures={[
        { name: 'Whale Tracker', href: '/features/whales', desc: 'Follow smart money movements' },
        { name: 'Market Health', href: '/features/health', desc: 'Check overall market conditions' },
        { name: 'Signal Aggregator', href: '/features/signals', desc: 'Multi-source trading signals' },
      ]}
    />
  );
}
