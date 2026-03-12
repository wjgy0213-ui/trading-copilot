import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COUNTER_FIELDS: Record<string, string> = {
  page_view: 'pageviews',
  waitlist_submit: 'waitlists',
  trial_start: 'trials',
  checkout_click: 'checkout_clicks',
  checkout_success: 'checkout_successes',
  activation_success: 'activation_successes',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const hourKey = `${dateKey}:${now.getUTCHours().toString().padStart(2, '0')}`;

    const entry = {
      ...body,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      ua: req.headers.get('user-agent')?.slice(0, 150) || '',
      ts: now.toISOString(),
    };

    const listKey = `analytics:${dateKey}`;
    const len = await kv.llen(listKey);
    if (len < 1000) {
      await kv.rpush(listKey, JSON.stringify(entry));
      if (len === 0) await kv.expire(listKey, 30 * 86400);
    }

    const counterKey = `stats:${dateKey}`;
    const event = String(body.event || 'unknown');

    if (COUNTER_FIELDS[event]) {
      await kv.hincrby(counterKey, COUNTER_FIELDS[event], 1);
    }

    if (body.page && event === 'page_view') {
      await kv.hincrby(counterKey, `page:${body.page}`, 1);
    }

    await kv.hincrby(counterKey, `event:${event}`, 1);

    if (body.props?.plan) {
      await kv.hincrby(counterKey, `plan:${body.props.plan}:${event}`, 1);
    }

    if (body.props?.cta_id) {
      await kv.hincrby(counterKey, `cta:${body.props.cta_id}`, 1);
    }

    if (body.props?.source) {
      await kv.hincrby(counterKey, `source:${body.props.source}:${event}`, 1);
    }

    const ttl = await kv.ttl(counterKey);
    if (ttl < 0) await kv.expire(counterKey, 90 * 86400);

    const hourlyKey = `stats:hourly:${hourKey}`;
    await kv.incr(hourlyKey);
    const hTtl = await kv.ttl(hourlyKey);
    if (hTtl < 0) await kv.expire(hourlyKey, 7 * 86400);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('key');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const days = parseInt(req.nextUrl.searchParams.get('days') || '7');
  const stats: Record<string, unknown>[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const data = await kv.hgetall(`stats:${d}`);
    if (data) stats.push({ date: d, ...data });
  }

  return NextResponse.json({ stats });
}
