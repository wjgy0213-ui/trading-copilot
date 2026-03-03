import { NextRequest, NextResponse } from 'next/server';
import { getStripe, COURSE_PLANS, CoursePlanId } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { planId, email } = await req.json() as { planId: CoursePlanId; email: string };
    
    if (!planId || !COURSE_PLANS[planId]) {
      return NextResponse.json({ error: '无效的课程套餐' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '请输入有效的邮箱' }, { status: 400 });
    }

    const plan = COURSE_PLANS[planId];
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment', // one-time, not subscription
      customer_email: email,
      line_items: [{ 
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Trading Copilot ${plan.name}`,
            description: plan.features.join(' · '),
          },
          unit_amount: plan.price * 100,
        },
        quantity: 1,
      }],
      success_url: `${origin}/course/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/course?canceled=true`,
      metadata: { 
        type: 'course',
        planId, 
        email,
        eliteMonths: plan.eliteMonths.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '创建支付失败';
    console.error('Course checkout error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
