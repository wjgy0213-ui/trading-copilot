import { Metadata } from 'next';
import SignalsFeatureClient from './SignalsFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.features.signals.title'),
    description: t('meta.features.signals.description'),
    keywords: ['crypto trading signals', 'signal aggregator', 'trading alerts', 'crypto signals', 'technical analysis signals', 'AI trading signals'],
    openGraph: {
      title: t('meta.features.signals.ogTitle'),
      description: t('meta.features.signals.ogDescription'),
    },
  };
}

export default function SignalsFeaturePage() {
  return <SignalsFeatureClient />;
}
