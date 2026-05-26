import { Metadata } from 'next';
import HealthFeatureClient from './HealthFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/features/health';

  return {
    title: t('meta.features.health.title'),
    description: t('meta.features.health.description'),
    keywords: t('meta.features.health.keywords').split('|'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.features.health.ogTitle'),
      description: t('meta.features.health.ogDescription'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.features.health.ogTitle'),
      description: t('meta.features.health.ogDescription'),
    },
  };
}

export default function HealthFeaturePage() {
  return <HealthFeatureClient />;
}
