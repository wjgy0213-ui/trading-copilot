import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import PageViewTracker from "@/components/PageViewTracker";
import { getServerT } from "@/lib/server-i18n";

export const viewport = {
  themeColor: '#030712',
};

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getServerT();
  const baseUrl = 'https://www.tradingcopilot.app';

  return {
    verification: {
      google: '7BwDIMV3DNn8jAtcwY4ZfWBTeCRDiUsOQ4hO7HpUkqc',
    },
    title: {
      default: t('layout.meta.defaultTitle'),
      template: t('layout.meta.template'),
    },
    description: t('layout.meta.description'),
    keywords: t('layout.meta.keywords').split('|'),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
      languages: {
        'en-US': `${baseUrl}?lang=en`,
        'zh-CN': `${baseUrl}?lang=zh`,
      },
    },
    openGraph: {
      title: t('layout.meta.ogTitle'),
      description: t('layout.meta.ogDescription'),
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: locale === 'zh' ? ['en_US'] : ['zh_CN'],
      siteName: t('layout.meta.siteName'),
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: t('layout.meta.siteName') }],
    },
    twitter: {
      card: t('seo.twitter.summaryLargeImage'),
      title: t('layout.meta.twitterTitle'),
      description: t('layout.meta.twitterDescription'),
      creator: t('seo.twitter.creator'),
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { t, locale } = await getServerT();
  const htmlLang = locale === 'zh' ? 'zh-CN' : 'en-US';

  return (
    <html lang={htmlLang}>
      <head>
        <JsonLd />
        <link rel="alternate" type="application/rss+xml" title={t('layout.rssTitle')} href="/feed" />
      </head>
      <body className="bg-gray-950 text-gray-100 antialiased font-sans">
        <Analytics />
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <Providers>
          <Navbar />
          <main className="pt-24">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
