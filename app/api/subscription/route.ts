import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSession } from '@/lib/auth';
import { updateUserSubscription } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
    if (!session.subscriptionId) return NextResponse.json({ error: 'no subscription' }, { status: 404 });

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: 'stripe not configured' }, { status: 500 });

    const sub = await stripe.subscriptions.retrieve(session.subscriptionId) as any;
    
    return NextResponse.json({
      id: sub.id,
      status: sub.status,
      cancel_at_period_end: sub.cancel_at_period_end,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      plan: sub.items?.data?.[0]?.price?.id,
      created: sub.created,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
    if (!session.subscriptionId) return NextResponse.json({ error: 'no subscription' }, { status: 404 });

    const stripe = getStripe();
    if (!stripe) return NextResponse.json({ error: 'stripe not configured' }, { status: 500 });

    // Cancel at period end in Stripe
    const sub = await stripe.subscriptions.update(session.subscriptionId, {
      cancel_at_period_end: true,
    }) as any;

    // Update KV to reflect cancellation
    await updateUserSubscription(session.email, {
      status: 'canceled',
      expiresAt: sub.current_period_end,
    });

    console.log(`🗓️ Subscription set to cancel: ${session.email} (expires: ${new Date(sub.current_period_end * 1000).toISOString()})`);

    return NextResponse.json({ ok: true, message: '订阅将在当前周期结束后取消' });
  } catch (e: any) {
    console.error('Subscription cancellation error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
