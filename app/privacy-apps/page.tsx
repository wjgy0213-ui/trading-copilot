import { Metadata } from 'next';
import PrivacyAppsClient from './PrivacyAppsClient';
import { getServerT } from '@/lib/server-i18n';

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const canonical = 'https://www.tradingcopilot.app/privacy-apps';

  return {
    title: `${t('privacy.title')} - ${t('privacy.appsSuffix')}`,
    description: t('privacy.subtitle'),
    keywords: t('privacy.keywords').split('|'),
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'zh-CN': `${canonical}?lang=zh`,
      },
    },
    openGraph: {
      title: `${t('privacy.title')} - ${t('privacy.appsSuffix')}`,
      description: t('privacy.subtitle'),
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('privacy.title')} - ${t('privacy.appsSuffix')}`,
      description: t('privacy.subtitle'),
    },
  };
}

export default function PrivacyAppsPage() {
  return <PrivacyAppsClient />;
}
