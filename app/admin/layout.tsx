import type { Metadata } from 'next';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/admin';

  return {
    title: t('meta.admin.title'),
    description: t('meta.admin.description'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.admin.title'),
      description: t('meta.admin.description'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.admin.title'),
      description: t('meta.admin.description'),
      creator: t('seo.twitter.creator'),
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
