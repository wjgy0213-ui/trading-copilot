import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { activateSubscription, cancelByEmail, getUser, setUser } from '@/lib/db';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const planId = session.metadata?.planId as 'pro' | 'elite' || 'pro';
      const email = session.metadata?.email || session.customer_email || '';
      
      if (email) {
        await activateSubscription(
          email,
          planId,
          session.customer as string,
          session.subscription as string,
          session.id,
        );
        console.log(`✅ KV: Subscription activated: ${email} → ${planId}`);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const email = sub.metadata?.email || '';
      if (email) {
        const user = await getUser(email);
        if (user) {
          await setUser(email, {
            ...user,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            status: sub.status === 'active' ? 'active' : 'past_due',
          });
          console.log(`🔄 KV: Subscription updated: ${email} cancel_at_period_end=${sub.cancel_at_period_end}`);
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const email = sub.metadata?.email || '';
      if (email) {
        await cancelByEmail(email);
        console.log(`❌ KV: Subscription canceled: ${email}`);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const email = invoice.customer_email || '';
      if (email) {
        const user = await getUser(email);
        if (user) {
          await setUser(email, { ...user, status: 'past_due' });
          console.log(`⚠️ KV: Payment failed: ${email}`);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
