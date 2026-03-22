import { getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const metadata: Metadata = {
  title: 'Blog | Trading Copilot',
  description: 'Trading insights, on-chain analysis, and crypto market strategies. Learn to trade smarter with AI-powered tools.',
  openGraph: {
    title: 'Trading Copilot Blog',
    description: 'Trading insights, on-chain analysis, and crypto market strategies.',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogPageClient posts={posts} />;
}
