import { Metadata } from 'next';
import SignalsFeatureClient from './SignalsFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/features/signals';

  return {
    title: t('meta.features.signals.title'),
    description: t('meta.features.signals.description'),
    keywords: t('meta.features.signals.keywords').split('|'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.features.signals.ogTitle'),
      description: t('meta.features.signals.ogDescription'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.features.signals.ogTitle'),
      description: t('meta.features.signals.ogDescription'),
    },
  };
}

export default function SignalsFeaturePage() {
  return <SignalsFeatureClient />;
}
