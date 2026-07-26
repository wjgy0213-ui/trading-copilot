import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createSession, setSessionCookie } from '@/lib/auth';
import { activateSubscription, isSessionActivated, getUser } from '@/lib/db';
import { trackServerEvent } from '@/lib/analytics-server';
import { getRequestLocale, translateForLocale as tr } from '@/lib/server-i18n';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  const locale = getRequestLocale(req);

  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: tr(locale, 'api.activate.missingSessionId') }, { status: 400 });
    }

    // Verify the checkout session with Stripe
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);
    
    const subscription = checkoutSession.subscription
      ? await getStripe().subscriptions.retrieve(checkoutSession.subscription as string)
      : null;

    const isPaid = checkoutSession.payment_status === 'paid';
    const isTrialing = subscription?.status === 'trialing';

    if (!isPaid && !isTrialing) {
      return NextResponse.json({ error: tr(locale, 'api.activate.notCompleted') }, { status: 400 });
    }

    const planId = checkoutSession.metadata?.planId as 'pro' | 'elite' || 'pro';
    const email = checkoutSession.metadata?.email || checkoutSession.customer_email || '';

    if (!email) {
      return NextResponse.json({ error: tr(locale, 'api.activate.emailMissing') }, { status: 400 });
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

    await trackServerEvent('activation_success', {
      props: {
        plan: planId,
        email,
        session_id: sessionId,
      },
    });

    return NextResponse.json({ success: true, plan: planId, email });
  } catch (error: unknown) {
    console.error('Activate error:', error);
    return NextResponse.json({ error: getErrorMessage(error) || tr(locale, 'api.activate.failed') }, { status: 500 });
  }
}
