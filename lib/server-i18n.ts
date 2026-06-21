import { cookies, headers } from 'next/headers';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import { Locale, LOCALE_COOKIE_NAME, LOCALE_HEADER_NAME, normalizeLocale } from '@/lib/locale';

const translations: Record<Locale, Record<string, string>> = { en, zh };

export function translateForLocale(locale: Locale, key: string, fallback?: string) {
  return translations[locale]?.[key] ?? fallback ?? key;
}

export function fillTemplate(template: string, values: Record<string, string | number> = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export async function getServerLocale(): Promise<Locale> {
  const headerStore = await headers();
  const forced = headerStore.get(LOCALE_HEADER_NAME);
  if (forced === 'zh' || forced === 'en') return forced;

  const cookieStore = await cookies();
  const saved = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (saved === 'zh' || saved === 'en') return saved;

  const acceptLanguage = headerStore.get('accept-language') || '';
  return normalizeLocale(acceptLanguage);
}

export function getRequestLocale(req: { cookies: { get(name: string): { value: string } | undefined }, headers: Headers }): Locale {
  const forced = req.headers.get(LOCALE_HEADER_NAME);
  if (forced === 'zh' || forced === 'en') return forced;

  const saved = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (saved === 'zh' || saved === 'en') return saved;
  return normalizeLocale(req.headers.get('accept-language'));
}

export async function getServerT() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: string, fallback?: string) => translateForLocale(locale, key, fallback),
  };
}
