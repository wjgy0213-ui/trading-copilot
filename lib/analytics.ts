'use client';

export type AnalyticsEventName =
  | 'page_view'
  | 'cta_click'
  | 'waitlist_submit'
  | 'trial_start'
  | 'checkout_click'
  | 'checkout_success'
  | 'activation_success';

export interface AnalyticsPayload {
  event: AnalyticsEventName;
  page?: string;
  props?: Record<string, string | number | boolean | null | undefined>;
  url?: string;
  referrer?: string;
  timestamp?: number;
  screen?: string;
}

function send(payload: AnalyticsPayload) {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify({
    ...payload,
    page: payload.page || window.location.pathname,
    url: payload.url || window.location.pathname + window.location.search,
    referrer: payload.referrer ?? document.referrer ?? '',
    timestamp: payload.timestamp || Date.now(),
    screen: payload.screen || `${window.screen.width}x${window.screen.height}`,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body);
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch {
    // silent fail
  }
}

export function track(event: AnalyticsEventName, props?: Record<string, string | number | boolean | null | undefined>) {
  send({ event, props });
}

export const analytics = {
  pageView(page?: string, props?: Record<string, string | number | boolean | null | undefined>) {
    send({ event: 'page_view', page, props });
  },
  ctaClick(props: {
    cta_id: string;
    cta_text?: string;
    target?: string;
    plan?: string;
    feature?: string;
    page?: string;
    location?: string;
  }) {
    send({ event: 'cta_click', page: props.page, props });
  },
  waitlistSubmit(props: {
    method: 'email' | 'wechat' | 'both';
    source?: string;
    page?: string;
  }) {
    send({ event: 'waitlist_submit', page: props.page, props });
  },
  trialStart(props: {
    feature?: string;
    page?: string;
    user_state?: string;
    trial_expires_at?: number;
  }) {
    send({ event: 'trial_start', page: props.page, props });
  },
  checkoutClick(props: {
    plan: string;
    page?: string;
    email_present?: boolean;
  }) {
    send({ event: 'checkout_click', page: props.page, props });
  },
  checkoutSuccess(props: {
    plan?: string;
    email?: string;
    session_id?: string;
    page?: string;
  }) {
    send({ event: 'checkout_success', page: props.page, props });
  },
  activationSuccess(props: {
    plan?: string;
    email?: string;
    session_id?: string;
    page?: string;
  }) {
    send({ event: 'activation_success', page: props.page, props });
  },
};
