import { Metadata } from 'next';
import PrivacyAppsClient from './PrivacyAppsClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: `${t('privacy.title')} - SlowMan Studios Apps`,
    description: t('privacy.subtitle'),
  };
}

export default function PrivacyAppsPage() {
  return <PrivacyAppsClient />;
}
