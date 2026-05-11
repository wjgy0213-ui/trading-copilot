'use client';

import { SessionProvider } from 'next-auth/react';
import { I18nProvider, useI18n } from '@/lib/i18n';
import HtmlLang from './HtmlLang';

function ProviderLocaleBridge() {
  useI18n();
  return <HtmlLang />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <ProviderLocaleBridge />
        {children}
      </I18nProvider>
    </SessionProvider>
  );
}
