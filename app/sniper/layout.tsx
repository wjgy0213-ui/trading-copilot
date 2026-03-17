import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meme Sniper — Auto Discovery + Scoring + Risk Control',
  description: 'Auto-scan DEX new tokens with 5D scoring (security/liquidity/momentum/community/timing). Paper trading validation.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
