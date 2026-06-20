import { getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/blog';
  const pageTitle = `${t('blog.pageTitle')} | ${t('app.name')}`;
  const pageDescription = t('blog.pageSubtitle');

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('blog.ogTitle'),
      description: pageDescription,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: t('seo.twitter.summaryLargeImage'),
      title: pageTitle,
      description: pageDescription,
      creator: t('seo.twitter.creator'),
    },
  };
}

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogPageClient posts={posts} />;
}
