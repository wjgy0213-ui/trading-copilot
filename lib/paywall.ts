'use client';

const STORAGE_KEY = 'trading-copilot-pro';

export function isProUser(): boolean {
  if (typeof window === 'undefined') return false;
  // Check localStorage (legacy activation codes)
  if (localStorage.getItem(STORAGE_KEY) === 'true') return true;
  // Cookie-based auth is checked via useSession hook
  return false;
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
}
