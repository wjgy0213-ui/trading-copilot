'use client';

const STORAGE_KEY = 'trading-copilot-pro';

// Legacy: localStorage-based Pro activation (activation codes only)
export function isProUser(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) === 'true';
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
