'use client';

const STORAGE_KEY = 'trading-copilot-pro';
const TRIAL_KEY = 'trading-copilot-trial';
const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function isProUser(): boolean {
  if (typeof window === 'undefined') return false;
  // Check localStorage (legacy activation codes)
  if (localStorage.getItem(STORAGE_KEY) === 'true') return true;
  // Check active free trial
  if (isOnFreeTrial()) return true;
  // Cookie-based auth is checked via useSession hook
  return false;
}

export function isOnFreeTrial(): boolean {
  if (typeof window === 'undefined') return false;
  const expiry = localStorage.getItem(TRIAL_KEY);
  if (!expiry) return false;
  return Date.now() < parseInt(expiry, 10);
}

export function getTrialExpiryMs(): number | null {
  if (typeof window === 'undefined') return null;
  const expiry = localStorage.getItem(TRIAL_KEY);
  if (!expiry) return null;
  const ms = parseInt(expiry, 10);
  return ms > Date.now() ? ms : null;
}

export function startFreeTrial(): void {
  const expiry = Date.now() + TRIAL_DURATION_MS;
  localStorage.setItem(TRIAL_KEY, expiry.toString());
}

export function activatePro(code: string): boolean {
  const validCodes = ['SLOWMAN2026', 'EARLYBIRD', 'COPILOT888'];
  if (validCodes.includes(code.toUpperCase().trim())) {
    localStorage.setItem(STORAGE_KEY, 'true');
    return true;
  }
  return false;
}

export function deactivatePro(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TRIAL_KEY);
}
