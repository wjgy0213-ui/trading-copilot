import { Metadata } from 'next';
import GuardianFeatureClient from './GuardianFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.features.guardian.title'),
    description: t('meta.features.guardian.description'),
    keywords: t('meta.features.guardian.keywords').split('|'),
    openGraph: {
      title: t('meta.features.guardian.ogTitle'),
      description: t('meta.features.guardian.ogDescription'),
    },
  };
}

export default function GuardianFeaturePage() {
  return <GuardianFeatureClient />;
}
