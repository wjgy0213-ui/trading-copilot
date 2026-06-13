import { getAllPosts } from '@/lib/blog';
import { getRequestLocale, translateForLocale } from '@/lib/server-i18n';

export async function GET(request: Request) {
  const posts = getAllPosts();
  const siteUrl = 'https://www.tradingcopilot.app';
  const url = new URL(request.url);
  const forcedLocale = url.searchParams.get('lang');
  const locale = forcedLocale === 'zh' || forcedLocale === 'en'
    ? forcedLocale
    : getRequestLocale({
        cookies: {
          get: (name: string) => {
            const cookie = request.headers.get('cookie') || '';
            const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
            return match ? { value: decodeURIComponent(match[1]) } : undefined;
          },
        },
        headers: request.headers,
      });
  const title = translateForLocale(locale, 'layout.rssTitle');
  const description = translateForLocale(locale, 'blog.pageSubtitle');
  const appName = translateForLocale(locale, 'app.name');
  const feedPath = `${siteUrl}/feed?lang=${locale}`;
  const blogPath = `${siteUrl}/blog?lang=${locale}`;
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <description>${escapeXml(description)}</description>
    <link>${blogPath}</link>
    <atom:link href="${feedPath}" rel="self" type="application/rss+xml"/>
    <language>${locale === 'zh' ? 'zh-CN' : 'en-US'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>${escapeXml(appName)}</generator>
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>${escapeXml(title)}</title>
      <link>${blogPath}</link>
    </image>
${posts.map(post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.description)}</description>
      <link>${siteUrl}/blog/${post.slug}?lang=${locale}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}?lang=${locale}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>team@tradingcopilot.app (${escapeXml(appName)})</author>
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
