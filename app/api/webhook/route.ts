import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createSession, setSessionCookie } from '@/lib/auth';
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
      
      console.log(`✅ Subscription activated: ${email} → ${planId}`);
      
      // Note: In production, store this in a database
      // For MVP, the success page will set the cookie via /api/auth/activate
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`❌ Subscription canceled: ${sub.id}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
