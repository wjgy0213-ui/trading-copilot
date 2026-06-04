import { Metadata } from 'next';
import WhalesFeatureClient from './WhalesFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/features/whales';

  return {
    title: t('meta.features.whales.title'),
    description: t('meta.features.whales.description'),
    keywords: t('meta.features.whales.keywords').split('|'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.features.whales.ogTitle'),
      description: t('meta.features.whales.ogDescription'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.features.whales.ogTitle'),
      description: t('meta.features.whales.ogDescription'),
    },
  };
}

export default function WhalesFeaturePage() {
  return <WhalesFeatureClient />;
}
