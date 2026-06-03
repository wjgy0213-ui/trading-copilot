import { Metadata } from 'next';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/guardian';

  return {
    title: t('meta.guardian.title'),
    description: t('meta.guardian.description'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.guardian.title'),
      description: t('meta.guardian.description'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.guardian.title'),
      description: t('meta.guardian.description'),
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
