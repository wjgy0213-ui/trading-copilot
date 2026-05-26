import { Metadata } from 'next';
import GuardianFeatureClient from './GuardianFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/features/guardian';

  return {
    title: t('meta.features.guardian.title'),
    description: t('meta.features.guardian.description'),
    keywords: t('meta.features.guardian.keywords').split('|'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.features.guardian.ogTitle'),
      description: t('meta.features.guardian.ogDescription'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.features.guardian.ogTitle'),
      description: t('meta.features.guardian.ogDescription'),
    },
  };
}

export default function GuardianFeaturePage() {
  return <GuardianFeatureClient />;
}
