import { Metadata } from 'next';
import SniperFeatureClient from './SniperFeatureClient';

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
  return <SniperFeatureClient />;
}
