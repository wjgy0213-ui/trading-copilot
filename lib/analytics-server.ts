import { kv } from '@vercel/kv';

const COUNTER_FIELDS: Record<string, string> = {
  page_view: 'pageviews',
  waitlist_submit: 'waitlists',
  trial_start: 'trials',
  checkout_click: 'checkout_clicks',
  checkout_success: 'checkout_successes',
  activation_success: 'activation_successes',
};

export async function trackServerEvent(
  event: keyof typeof COUNTER_FIELDS,
  options?: {
    page?: string;
    props?: Record<string, string | number | boolean | null | undefined>;
  }
) {
  try {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const counterKey = `stats:${dateKey}`;

    await kv.hincrby(counterKey, COUNTER_FIELDS[event], 1);
    await kv.hincrby(counterKey, `event:${event}`, 1);

    if (event === 'page_view' && options?.page) {
      await kv.hincrby(counterKey, `page:${options.page}`, 1);
    }

    if (options?.props?.plan) {
      await kv.hincrby(counterKey, `plan:${options.props.plan}:${event}`, 1);
    }

    if (options?.props?.source) {
      await kv.hincrby(counterKey, `source:${options.props.source}:${event}`, 1);
    }

    const ttl = await kv.ttl(counterKey);
    if (ttl < 0) await kv.expire(counterKey, 90 * 86400);
  } catch (error) {
    console.error('[analytics-server] failed:', error);
  }
}
