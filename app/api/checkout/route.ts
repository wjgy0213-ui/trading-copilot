import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PLANS, PlanId, BillingInterval } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { planId, email, interval = 'monthly' } = await req.json() as {
      planId: PlanId;
      email: string;
      interval?: BillingInterval;
    };
    
    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
    }

    const plan = PLANS[planId];
    const priceId = interval === 'yearly' ? plan.yearlyPriceId : plan.priceId;
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: { planId, email, interval },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout' }, { status: 500 });
  }
}
