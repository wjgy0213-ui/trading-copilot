import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://trading-copilot-delta.vercel.app';
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/strategy`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/ai-strategy`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/trade`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/learn`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
