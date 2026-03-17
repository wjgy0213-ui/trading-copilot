import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market News — Real-time Crypto Updates',
  description: "Binance flash news, Fear & Greed index, BTC/ETH live prices. The trader's information hub.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
