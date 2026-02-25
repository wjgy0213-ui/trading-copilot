'use client';

// Simple analytics - tracks events to /api/analytics
// No external dependencies, privacy-friendly

export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      event: name,
      props: props || {},
      url: window.location.pathname,
      referrer: document.referrer || '',
      timestamp: Date.now(),
      screen: `${window.screen.width}x${window.screen.height}`,
    };
    // Use sendBeacon for reliability (doesn't block navigation)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
    } else {
      fetch('/api/analytics', { method: 'POST', body: JSON.stringify(payload), keepalive: true });
    }
  } catch { /* silent fail */ }
}

// Auto-track page views
export function trackPageView() {
  trackEvent('pageview');
}

// Common events
export const events = {
  strategyRun: (strategyId: string) => trackEvent('strategy_run', { strategyId }),
  aiGenerate: (prompt: string) => trackEvent('ai_generate', { prompt: prompt.slice(0, 100) }),
  optimizerRun: (strategyId: string) => trackEvent('optimizer_run', { strategyId }),
  checkoutClick: (plan: string) => trackEvent('checkout_click', { plan }),
  tradeOpen: (symbol: string, side: string) => trackEvent('trade_open', { symbol, side }),
};
