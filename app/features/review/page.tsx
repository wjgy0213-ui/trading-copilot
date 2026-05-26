import { Metadata } from 'next';
import ReviewFeatureClient from './ReviewFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/features/review';

  return {
    title: t('meta.features.review.title'),
    description: t('meta.features.review.description'),
    keywords: t('meta.features.review.keywords').split('|'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: t('meta.features.review.ogTitle'),
      description: t('meta.features.review.ogDescription'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.features.review.ogTitle'),
      description: t('meta.features.review.ogDescription'),
    },
  };
}

export default function ReviewFeaturePage() {
  return <ReviewFeatureClient />;
}
