'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Locale, LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';

function readLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find(part => part.startsWith(`${LOCALE_COOKIE_NAME}=`));
  return match ? normalizeLocale(match.split('=')[1]) : null;
}

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'en';

  const cookieLocale = readLocaleCookie();
  if (cookieLocale) return cookieLocale;

  const htmlLang = document.documentElement.lang;
  if (htmlLang) return normalizeLocale(htmlLang);

  return normalizeLocale(navigator.language || 'en');
}

function persistLocale(locale: Locale) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  localStorage.setItem(LOCALE_COOKIE_NAME, locale);
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;

  const url = new URL(window.location.href);
  url.searchParams.set('lang', locale);
  window.history.replaceState({}, '', url.toString());
}

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
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    persistLocale(locale);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    persistLocale(l);
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
