import { cookies, headers } from 'next/headers';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import type { Locale } from '@/lib/i18n';

const translations: Record<Locale, Record<string, string>> = { en, zh };

function normalizeLocale(value?: string | null): Locale {
  if (value === 'zh' || value?.toLowerCase().startsWith('zh')) return 'zh';
  return 'en';
}

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
  const cookieStore = await cookies();
  const saved = cookieStore.get('locale')?.value;
  if (saved === 'zh' || saved === 'en') return saved;

  const headerStore = await headers();
  const acceptLanguage = headerStore.get('accept-language') || '';
  return normalizeLocale(acceptLanguage);
}

export function getRequestLocale(req: { cookies: { get(name: string): { value: string } | undefined }, headers: Headers }): Locale {
  const saved = req.cookies.get('locale')?.value;
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
