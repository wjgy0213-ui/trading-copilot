import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { updateUserSubscription } from '@/lib/db';
import { getRequestLocale, translateForLocale as tr } from '@/lib/server-i18n';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

type StripeSubscriptionLike = {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start: number;
  current_period_end: number;
  items?: { data?: Array<{ price?: { id?: string | null } }> };
  created: number;
};

export async function GET(req: NextRequest) {
  const locale = getRequestLocale(req);

  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: tr(locale, 'api.subscription.notAuthenticated') }, { status: 401 });
    if (!session.subscriptionId) return NextResponse.json({ error: tr(locale, 'api.subscription.noSubscription') }, { status: 404 });

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: tr(locale, 'api.subscription.stripeMissing') }, { status: 500 });

    const sub = await stripe.subscriptions.retrieve(session.subscriptionId) as unknown as StripeSubscriptionLike;
    
    return NextResponse.json({
      id: sub.id,
      status: sub.status,
      cancel_at_period_end: sub.cancel_at_period_end,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      plan: sub.items?.data?.[0]?.price?.id,
      created: sub.created,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: getErrorMessage(e) || tr(locale, 'api.subscription.fetchFailed') }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const locale = getRequestLocale(req);

  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: tr(locale, 'api.subscription.notAuthenticated') }, { status: 401 });
    if (!session.subscriptionId) return NextResponse.json({ error: tr(locale, 'api.subscription.noSubscription') }, { status: 404 });

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: tr(locale, 'api.subscription.stripeMissing') }, { status: 500 });

    // Cancel at period end in Stripe
    const sub = await stripe.subscriptions.update(session.subscriptionId, {
      cancel_at_period_end: true,
    }) as unknown as StripeSubscriptionLike;

    // Update KV to reflect cancellation
    await updateUserSubscription(session.email, {
      status: 'canceled',
      expiresAt: sub.current_period_end,
    });

    console.log(`🗓️ Subscription set to cancel: ${session.email} (expires: ${new Date(sub.current_period_end * 1000).toISOString()})`);

    return NextResponse.json({ ok: true, message: tr(locale, 'api.subscription.cancelScheduled') });
  } catch (e: unknown) {
    console.error('Subscription cancellation error:', e);
    return NextResponse.json({ error: getErrorMessage(e) || tr(locale, 'api.subscription.cancelFailed') }, { status: 500 });
  }
}
