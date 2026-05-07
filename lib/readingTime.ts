import type { Locale } from '@/lib/i18n';

const CJK_RE = /[\u3400-\u9FFF\uF900-\uFAFF\u3040-\u30FF\uAC00-\uD7AF]/g;
const WORD_RE = /[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*/g;

export function estimateReadingMinutes(content: string, locale: Locale): number {
  const normalized = content.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]+`/g, ' ').trim();
  if (!normalized) return 1;

  if (locale === 'zh') {
    const cjkChars = (normalized.match(CJK_RE) || []).length;
    const latinWords = (normalized.match(WORD_RE) || []).length;
    const units = cjkChars + latinWords * 2;
    return Math.max(1, Math.ceil(units / 450));
  }

  const words = (normalized.match(WORD_RE) || []).length;
  return Math.max(1, Math.ceil(words / 200));
}
