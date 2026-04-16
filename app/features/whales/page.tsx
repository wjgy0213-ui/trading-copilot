import { Metadata } from 'next';
import WhalesFeatureClient from './WhalesFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.features.whales.title'),
    description: t('meta.features.whales.description'),
    keywords: t('meta.features.whales.keywords').split('|'),
    openGraph: {
      title: t('meta.features.whales.ogTitle'),
      description: t('meta.features.whales.ogDescription'),
    },
  };
}

export default function WhalesFeaturePage() {
  return <WhalesFeatureClient />;
}
