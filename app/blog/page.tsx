import { getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: `${t('blog.pageTitle')} | Trading Copilot`,
    description: t('blog.pageSubtitle'),
    openGraph: {
      title: t('blog.ogTitle'),
      description: t('blog.pageSubtitle'),
    },
  };
}

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogPageClient posts={posts} />;
}
