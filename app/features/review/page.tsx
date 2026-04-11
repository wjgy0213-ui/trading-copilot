import { Metadata } from 'next';
import ReviewFeatureClient from './ReviewFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.features.review.title'),
    description: t('meta.features.review.description'),
    keywords: ['trading journal', 'trade review', 'AI trade analysis', 'trading psychology', 'revenge trading', 'trading performance'],
    openGraph: {
      title: t('meta.features.review.ogTitle'),
      description: t('meta.features.review.ogDescription'),
    },
  };
}

export default function ReviewFeaturePage() {
  return <ReviewFeatureClient />;
}
