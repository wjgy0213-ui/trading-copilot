import { Metadata } from 'next';
import PracticeFeatureClient from './PracticeFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/features/practice';

  return {
    title: t('meta.features.practice.title'),
    description: t('meta.features.practice.description'),
    keywords: t('meta.features.practice.keywords').split('|'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.features.practice.ogTitle'),
      description: t('meta.features.practice.ogDescription'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.features.practice.ogTitle'),
      description: t('meta.features.practice.ogDescription'),
    },
  };
}

export default function PracticeFeaturePage() {
  return <PracticeFeatureClient />;
}
