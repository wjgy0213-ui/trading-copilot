import { getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/blog';

  return {
    title: `${t('blog.pageTitle')} | ${t('app.name')}`,
    description: t('blog.pageSubtitle'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('blog.ogTitle'),
      description: t('blog.pageSubtitle'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
  };
}

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogPageClient posts={posts} />;
}
