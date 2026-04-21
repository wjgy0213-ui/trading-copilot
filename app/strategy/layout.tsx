import type { Metadata } from 'next';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.strategy.title'),
    description: t('meta.strategy.description'),
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
