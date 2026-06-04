'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

/**
 * Syncs the <html lang> attribute with the current locale.
 * Place inside I18nProvider (e.g. in Providers or layout).
 */
export default function HtmlLang() {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en-US';
  }, [locale]);

  return null;
}
