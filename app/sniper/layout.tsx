import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meme Sniper — 自动发现+评分+风控',
  description: '自动扫描DEX新币，5维评分（安全/流动性/动量/社区/时机），模拟盘验证。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
