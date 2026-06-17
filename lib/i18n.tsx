'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Locale = 'zh' | 'en';

// Flat key-value translations
import zh from '@/locales/zh.json';
import en from '@/locales/en.json';

const translations: Record<Locale, Record<string, string>> = { zh, en };

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && (saved === 'zh' || saved === 'en')) {
      setLocaleState(saved);
      document.cookie = `locale=${saved}; path=/; max-age=31536000; samesite=lax`;
    } else {
      // Auto-detect: default to English unless browser is Chinese
      const browserLang = navigator.language || '';
      const isZh = browserLang.startsWith('zh');
      const detected = isZh ? 'zh' : 'en';
      setLocaleState(detected);
      localStorage.setItem('locale', detected);
      document.cookie = `locale=${detected}; path=/; max-age=31536000; samesite=lax`;
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
    document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[locale]?.[key] ?? fallback ?? key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// Language switcher component
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const nextLocale = locale === 'zh' ? 'en' : 'zh';
  const switchTitle = nextLocale === 'en' ? t('i18n.switchToEnglish') : t('i18n.switchToChinese');
  const switchLabel = nextLocale === 'en' ? t('i18n.labelEnglishShort') : t('i18n.labelChineseShort');

  return (
    <button
      onClick={() => setLocale(nextLocale)}
      className={`text-xs text-gray-400 hover:text-gray-200 transition px-2 py-1 rounded border border-gray-700 hover:border-gray-600 ${className}`}
      title={switchTitle}
      aria-label={switchTitle}
    >
      {switchLabel}
    </button>
  );
}
