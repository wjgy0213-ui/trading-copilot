import { Metadata } from 'next';
import PracticeFeatureClient from './PracticeFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.features.practice.title'),
    description: t('meta.features.practice.description'),
    keywords: ['paper trading', 'crypto simulator', 'trading practice', 'virtual trading', 'demo trading', 'learn crypto trading'],
    openGraph: {
      title: t('meta.features.practice.ogTitle'),
      description: t('meta.features.practice.ogDescription'),
    },
  };
}

export default function PracticeFeaturePage() {
  return <PracticeFeatureClient />;
}
