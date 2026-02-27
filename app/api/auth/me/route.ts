import { NextResponse } from 'next/server';
import { getSession, createSession, setSessionCookie } from '@/lib/auth';
import { getUser } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  // Verify against KV store (source of truth)
  const userData = await getUser(session.email);
  
  if (!userData) {
    // User not found in KV, treat as free tier
    return NextResponse.json({ email: session.email, plan: 'free' });
  }

  // Check if subscription is still valid
  const isExpired = userData.expiresAt && userData.expiresAt < Math.floor(Date.now() / 1000);
  const effectivePlan = (isExpired || userData.status !== 'active') ? 'free' : userData.plan;

  // If JWT is outdated, refresh it
  if (session.plan !== effectivePlan) {
    const token = await createSession({
      email: userData.email,
      plan: effectivePlan,
      stripeCustomerId: userData.stripeCustomerId,
      subscriptionId: userData.subscriptionId,
      expiresAt: userData.expiresAt,
    });
    await setSessionCookie(token);
  }

  return NextResponse.json({ 
    email: userData.email, 
    plan: effectivePlan,
    status: userData.status,
    expiresAt: userData.expiresAt,
  });
}
