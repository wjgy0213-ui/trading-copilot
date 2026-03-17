'use client';

const QUOTA_KEY = 'tc-free-quota';
const MAX_FREE_DAILY = 3;

interface QuotaData {
  date: string; // YYYY-MM-DD
  count: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getQuotaData(): QuotaData {
  if (typeof window === 'undefined') return { date: getToday(), count: 0 };
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    if (!raw) return { date: getToday(), count: 0 };
    const data: QuotaData = JSON.parse(raw);
    // Reset if new day
    if (data.date !== getToday()) {
      return { date: getToday(), count: 0 };
    }
    return data;
  } catch {
    return { date: getToday(), count: 0 };
  }
}

function saveQuotaData(data: QuotaData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(QUOTA_KEY, JSON.stringify(data));
}

/** Check remaining free uses today */
export function getFreeQuotaRemaining(): number {
  const data = getQuotaData();
  return Math.max(0, MAX_FREE_DAILY - data.count);
}

/** Get total daily limit */
export function getFreeQuotaLimit(): number {
  return MAX_FREE_DAILY;
}

/** Get today's usage count */
export function getFreeQuotaUsed(): number {
  return getQuotaData().count;
}

/** Use one free credit. Returns true if allowed, false if exhausted. */
export function useFreeQuota(): boolean {
  const data = getQuotaData();
  if (data.count >= MAX_FREE_DAILY) return false;
  data.count += 1;
  data.date = getToday();
  saveQuotaData(data);
  return true;
}

/** Check if user has free uses remaining */
export function hasFreeQuota(): boolean {
  return getFreeQuotaRemaining() > 0;
}
