import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUser, setUser } from '@/lib/db';

const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST() {
  const session = await getSession();
  if (!session?.email) {
    return NextResponse.json({ error: 'login_required' }, { status: 401 });
  }

  const email = session.email.toLowerCase();
  const user = await getUser(email);

  // Check if already used trial
  if (user?.trialExpiresAt) {
    if (user.trialExpiresAt > Date.now()) {
      return NextResponse.json({ ok: true, expiresAt: user.trialExpiresAt, message: 'trial_active' });
    }
    // Trial already expired — no second trial
    return NextResponse.json({ error: 'trial_used', message: '试用已过期，请升级 Pro' }, { status: 403 });
  }

  // Check if already a paying user
  if (user?.plan === 'pro' || user?.plan === 'elite') {
    return NextResponse.json({ ok: true, message: 'already_pro' });
  }

  // Start trial
  const expiresAt = Date.now() + TRIAL_DURATION_MS;
  const updated = {
    ...(user || { email, plan: 'free' as const, status: 'free' as const }),
    trialExpiresAt: expiresAt,
  };
  await setUser(email, updated);

  return NextResponse.json({ ok: true, expiresAt });
}
