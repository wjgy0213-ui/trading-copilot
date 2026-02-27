import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createSession, setSessionCookie } from '@/lib/auth';
import { activateSubscription, isSessionActivated, getUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // Verify the checkout session with Stripe
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
    
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: '支付未完成' }, { status: 400 });
    }

    const planId = checkoutSession.metadata?.planId as 'pro' | 'elite' || 'pro';
    const email = checkoutSession.metadata?.email || checkoutSession.customer_email || '';

    if (!email) {
      return NextResponse.json({ error: '无法获取邮箱' }, { status: 400 });
    }

    // Check if already activated (prevent replay)
    const alreadyActivated = await isSessionActivated(email, sessionId);
    
    // Even if already activated via webhook, still set cookie for this browser
    if (!alreadyActivated) {
      await activateSubscription(
        email,
        planId,
        checkoutSession.customer as string,
        checkoutSession.subscription as string,
        sessionId,
      );
    }

    // Create JWT session (cookie for this browser)
    const token = await createSession({
      email,
      plan: planId,
      stripeCustomerId: checkoutSession.customer as string,
      subscriptionId: checkoutSession.subscription as string,
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true, plan: planId, email });
  } catch (error: any) {
    console.error('Activate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
