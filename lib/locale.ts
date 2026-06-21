export type Locale = 'zh' | 'en';

export const LOCALE_COOKIE_NAME = 'locale';
export const LOCALE_HEADER_NAME = 'x-trading-copilot-locale';

export function normalizeLocale(value?: string | null): Locale {
  if (value === 'zh' || value?.toLowerCase().startsWith('zh')) return 'zh';
  return 'en';
}
