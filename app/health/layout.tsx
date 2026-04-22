import { Metadata } from 'next';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.health.title'),
    description: t('meta.health.description'),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
