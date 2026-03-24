import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.tradingcopilot.app';
  const now = new Date();

  // Blog post URLs (guard against invalid dates)
  const blogUrls: MetadataRoute.Sitemap = getAllPosts()
    .filter(post => !isNaN(new Date(post.date).getTime()))
    .map(post => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  // Feature landing pages
  const featurePages = ['health', 'sniper', 'practice', 'signals', 'review', 'guardian', 'whales'];
  const featureUrls: MetadataRoute.Sitemap = featurePages.map(f => ({
    url: `${base}/features/${f}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [
    ...blogUrls,
    ...featureUrls,
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/practice`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${base}/health`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/signals`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/trade`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/strategy`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/ai-strategy`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/sniper`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/whales`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/dashboard`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/review`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/guardian`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/learn`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/course`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/backtest`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/elite`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/waitlist`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
