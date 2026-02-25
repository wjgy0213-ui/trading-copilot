import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PLANS, PlanId } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { planId, email } = await req.json() as { planId: PlanId; email: string };
    
    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: '无效的计划' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '请输入有效的邮箱' }, { status: 400 });
    }

    const plan = PLANS[planId];
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: { planId, email },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || '创建支付失败' }, { status: 500 });
  }
}
