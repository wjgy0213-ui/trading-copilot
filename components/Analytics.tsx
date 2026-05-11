'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useI18n } from '@/lib/i18n';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function Analytics() {
  const { locale } = useI18n();

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).gtag || !GA_ID) return;

    (window as any).gtag('set', 'user_properties', { locale });
    (window as any).gtag('config', GA_ID, {
      page_path: window.location.pathname,
      language: locale,
    });
  }, [locale]);

  if (!GA_ID) return null;
  
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            language: document.documentElement.lang || 'en',
          });
        `}
      </Script>
    </>
  );
}

// Helper to track custom events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}
