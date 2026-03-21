import { Metadata } from 'next';
import GuardianFeatureClient from './GuardianFeatureClient';

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
  return <GuardianFeatureClient />;
}
