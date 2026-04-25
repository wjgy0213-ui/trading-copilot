import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import type { Locale } from './i18n';

const translations: Record<Locale, Record<string, string>> = { en, zh };

export function i18nText(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let text = translations[locale]?.[key] ?? zh[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
