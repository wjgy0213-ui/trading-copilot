import { Metadata } from 'next';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.signals.title'),
    description: t('meta.signals.description'),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
