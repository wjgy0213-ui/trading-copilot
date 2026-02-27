import { NextRequest, NextResponse } from 'next/server';
import { createSession, setSessionCookie } from '@/lib/auth';
import { getUser } from '@/lib/db';

// Recover session from KV by email (for users who cleared cookies or switched devices)
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: '请输入邮箱' }, { status: 400 });
    }

    const user = await getUser(email);
    if (!user || user.status === 'free' || user.plan === 'free') {
      return NextResponse.json({ error: '未找到有效订阅' }, { status: 404 });
    }

    const token = await createSession({
      email: user.email,
      plan: user.plan,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
    });

    await setSessionCookie(token);

    return NextResponse.json({ success: true, plan: user.plan, email: user.email });
  } catch (error: any) {
    console.error('Recover error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
