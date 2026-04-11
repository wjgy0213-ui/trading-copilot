import { cookies, headers } from 'next/headers';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';
import type { Locale } from '@/lib/i18n';

const translations: Record<Locale, Record<string, string>> = { en, zh };

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get('locale')?.value;
  if (saved === 'zh' || saved === 'en') return saved;

  const headerStore = await headers();
  const acceptLanguage = headerStore.get('accept-language') || '';
  return acceptLanguage.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export async function getServerT() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (key: string, fallback?: string) => translations[locale]?.[key] ?? fallback ?? key,
  };
}
