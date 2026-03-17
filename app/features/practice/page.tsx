import { Metadata } from 'next';
import { Gamepad2 } from 'lucide-react';
import FeatureLanding from '@/components/FeatureLanding';

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
  return (
    <FeatureLanding
      icon={<Gamepad2 className="w-8 h-8 text-emerald-400" />}
      title="Paper Trading Simulator"
      subtitle="Practice trading risk-free with real market data"
      description="Build your trading skills without risking real money. Our simulator uses live market data so every trade feels real — but your wallet stays safe. AI coaches you on every decision."
      color="emerald"
      ctaHref="/practice"
      ctaText="Start Practicing Free"
      benefits={[
        'Real-time market data — trades execute at live prices',
        'AI coaching on every trade decision',
        'Performance tracking with win rate, P&L, and Sharpe ratio',
        'Trade journal with automatic pattern detection',
        'Skill progression system with ranks and achievements',
        'Multiple strategies to practice and compare',
        'No risk, no registration required to start',
        'Transition to real trading when you\'re ready',
      ]}
      howItWorks={[
        { step: '1', title: 'Pick a Market', desc: 'Choose from BTC, ETH, SOL, and 50+ crypto pairs with live prices.' },
        { step: '2', title: 'Place Paper Trades', desc: 'Set entries, stop losses, and take profits just like real trading. AI suggests improvements.' },
        { step: '3', title: 'Review & Improve', desc: 'Track your performance over time. AI identifies your strengths and weaknesses.' },
      ]}
      relatedFeatures={[
        { name: 'AI Trade Review', href: '/features/review', desc: 'AI analyzes your trading patterns' },
        { name: 'Market Health', href: '/features/health', desc: 'Check conditions before you trade' },
        { name: 'Risk Guardian', href: '/features/guardian', desc: 'Automated risk management' },
      ]}
    />
  );
}
