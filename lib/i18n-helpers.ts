import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import type { Locale } from './i18n';

const enTranslations = en as Record<string, string>;
const zhTranslations = zh as Record<string, string>;
const translations: Record<Locale, Record<string, string>> = { en: enTranslations, zh: zhTranslations };

export function i18nText(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let text = translations[locale]?.[key] ?? zhTranslations[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
