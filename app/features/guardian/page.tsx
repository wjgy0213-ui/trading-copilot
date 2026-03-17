import { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';
import FeatureLanding from '@/components/FeatureLanding';

export const metadata: Metadata = {
  title: 'Risk Guardian — Automated Crypto Risk Management',
  description: 'AI-powered risk management system that monitors your positions in real-time. Automatic stop-losses, daily loss limits, leverage controls, and emergency kill switch. Protect your capital 24/7.',
  keywords: ['crypto risk management', 'trading risk control', 'stop loss automation', 'position sizing', 'risk guardian', 'leverage limit'],
  openGraph: {
    title: 'Risk Guardian — Trading Copilot',
    description: 'Automated risk management for crypto traders. Protect your capital 24/7.',
  },
};

export default function GuardianFeaturePage() {
  return (
    <FeatureLanding
      icon={<ShieldAlert className="w-8 h-8 text-orange-400" />}
      title="Risk Guardian"
      subtitle="Your 24/7 risk management copilot"
      description="Set your risk rules once, and our AI enforces them — even when you're sleeping. Daily loss limits, per-trade risk caps, leverage controls, and an emergency kill switch to close all positions instantly."
      color="orange"
      ctaHref="/guardian"
      benefits={[
        'Per-trade risk limits (e.g., max 2% of capital per trade)',
        'Daily loss limit — auto-stops trading after reaching threshold',
        'Maximum leverage control across all positions',
        'Real-time risk traffic light (Green / Yellow / Red)',
        'Emergency kill switch — close all positions in one click',
        'Telegram alerts for risk threshold breaches',
        'Portfolio-level drawdown monitoring',
        'Works across Binance, OKX, Bybit, and Hyperliquid',
      ]}
      howItWorks={[
        { step: '1', title: 'Set Your Risk Rules', desc: 'Define per-trade risk %, daily loss limit, max leverage, and drawdown thresholds.' },
        { step: '2', title: 'AI Monitors 24/7', desc: 'Our system watches your positions in real-time and enforces your risk rules automatically.' },
        { step: '3', title: 'Get Alerts & Auto-Actions', desc: 'Receive Telegram alerts when approaching limits. Auto-close positions if rules are violated.' },
      ]}
      relatedFeatures={[
        { name: 'AI Trade Review', href: '/features/review', desc: 'Analyze your trading patterns' },
        { name: 'Paper Trading', href: '/features/practice', desc: 'Test strategies risk-free' },
        { name: 'Signal Aggregator', href: '/features/signals', desc: 'AI-scored trading signals' },
      ]}
    />
  );
}
