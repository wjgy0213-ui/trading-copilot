import { Metadata } from 'next';
import SniperFeatureClient from './SniperFeatureClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerT();

  return {
    title: t('meta.features.sniper.title'),
    description: t('meta.features.sniper.description'),
    keywords: ['meme coin sniper', 'crypto token scanner', 'new token alert', 'dex screener', 'meme coin trading', 'solana meme coins'],
    openGraph: {
      title: t('meta.features.sniper.ogTitle'),
      description: t('meta.features.sniper.ogDescription'),
    },
  };
}

export default function SniperFeaturePage() {
  return <SniperFeatureClient />;
}
