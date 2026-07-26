import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { createSession, setSessionCookie } from '@/lib/auth';
import { getUser, setUser } from '@/lib/db';
import { getRequestLocale, translateForLocale as tr } from '@/lib/server-i18n';

// Sync NextAuth session → tc-session cookie
// Called after Google/email login to bridge the two auth systems
export async function GET(req: NextRequest) {
  const locale = getRequestLocale(req);

  try {
    const nextSession = await getServerSession(authOptions);
    if (!nextSession?.user?.email) {
      return NextResponse.json({ error: tr(locale, 'api.auth.syncNotAuthenticated') }, { status: 401 });
    }

    const email = nextSession.user.email;
    
    // Get or create user in KV
    let userData = await getUser(email);
    if (!userData) {
      await setUser(email, { email, plan: 'free', status: 'active' });
      userData = { email, plan: 'free', status: 'active' };
    }

    // Determine effective plan
    const isExpired = userData.expiresAt && userData.expiresAt < Math.floor(Date.now() / 1000);
    let effectivePlan = (isExpired || userData.status !== 'active') ? 'free' : (userData.plan || 'free');
    if (effectivePlan === 'free' && userData.courseEliteExpiresAt && userData.courseEliteExpiresAt > Date.now()) {
      effectivePlan = 'elite';
    }

    // Create tc-session JWT and set cookie
    const token = await createSession({
      email,
      plan: effectivePlan as 'free' | 'pro' | 'elite',
      stripeCustomerId: userData.stripeCustomerId,
      subscriptionId: userData.subscriptionId,
      expiresAt: userData.expiresAt,
    });
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, email, plan: effectivePlan });
  } catch (error) {
    console.error('Auth sync error:', error);
    return NextResponse.json({ error: tr(locale, 'api.auth.syncFailed') }, { status: 500 });
  }
}
