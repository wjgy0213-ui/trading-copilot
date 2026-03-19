import { getAllPosts } from '@/lib/blog';

export async function GET() {
  const posts = getAllPosts();
  const siteUrl = 'https://www.tradingcopilot.app';
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Trading Copilot Blog</title>
    <description>Trading education, crypto market analysis, and AI-powered trading tools. Learn to trade smarter.</description>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/feed" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Trading Copilot</generator>
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>Trading Copilot Blog</title>
      <link>${siteUrl}/blog</link>
    </image>
${posts.map(post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.description)}</description>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>team@tradingcopilot.app (Trading Copilot)</author>
${post.tags.map(tag => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`).join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
