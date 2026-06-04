import { Metadata } from 'next';
import SniperFeatureClient from './SniperFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/features/sniper';

  return {
    title: t('meta.features.sniper.title'),
    description: t('meta.features.sniper.description'),
    keywords: t('meta.features.sniper.keywords').split('|'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.features.sniper.ogTitle'),
      description: t('meta.features.sniper.ogDescription'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.features.sniper.ogTitle'),
      description: t('meta.features.sniper.ogDescription'),
    },
  };
}

export default function SniperFeaturePage() {
  return <SniperFeatureClient />;
}
