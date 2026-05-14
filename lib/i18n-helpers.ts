import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import type { Locale } from './i18n';

const enTranslations = en as Record<string, string>;
const zhTranslations = zh as Record<string, string>;
const translations: Record<Locale, Record<string, string>> = { en: enTranslations, zh: zhTranslations };

export function getIntlLocale(locale: Locale): string {
  return locale === 'zh' ? 'zh-CN' : 'en-US';
}

export function i18nText(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let text = translations[locale]?.[key] ?? zhTranslations[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function formatLocaleNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), options).format(value);
}

export function formatLocaleCurrency(
  value: number,
  locale: Locale,
  currency = 'USD',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}

export function formatCompactLocaleCurrency(
  value: number,
  locale: Locale,
  currency = 'USD',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
}

export function formatLocalePercent(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: 'percent',
    maximumFractionDigits: 1,
    ...options,
  }).format(value);
}
