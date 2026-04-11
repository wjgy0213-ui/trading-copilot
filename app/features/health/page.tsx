import { Metadata } from 'next';
import HealthFeatureClient from './HealthFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.features.health.title'),
    description: t('meta.features.health.description'),
    keywords: ['crypto market analysis', 'market health check', 'fear and greed index', 'crypto indicators', 'on-chain analysis', 'BTC analysis'],
    openGraph: {
      title: t('meta.features.health.ogTitle'),
      description: t('meta.features.health.ogDescription'),
    },
  };
}

export default function HealthFeaturePage() {
  return <HealthFeatureClient />;
}
