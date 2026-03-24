'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nProvider } from '@/lib/i18n';
import HtmlLang from './HtmlLang';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <HtmlLang />
        {children}
      </I18nProvider>
    </SessionProvider>
  );
}
