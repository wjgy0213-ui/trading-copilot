import type { Metadata } from 'next';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('news.meta.title'),
    description: t('news.meta.description'),
    openGraph: {
      title: t('news.meta.ogTitle'),
      description: t('news.meta.ogDescription'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('news.meta.ogTitle'),
      description: t('news.meta.ogDescription'),
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
