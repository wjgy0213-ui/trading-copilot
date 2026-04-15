import { Metadata } from 'next';
import HealthFeatureClient from './HealthFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.features.health.title'),
    description: t('meta.features.health.description'),
    keywords: t('meta.features.health.keywords').split('|'),
    openGraph: {
      title: t('meta.features.health.ogTitle'),
      description: t('meta.features.health.ogDescription'),
    },
  };
}

export default function HealthFeaturePage() {
  return <HealthFeatureClient />;
}
