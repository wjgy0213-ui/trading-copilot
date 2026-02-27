import { kv } from '@vercel/kv';

export interface UserRecord {
  email: string;
  plan: 'free' | 'pro' | 'elite';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscribedAt?: number;
  expiresAt?: number;
  cancelAtPeriodEnd?: boolean;
  status: 'active' | 'canceled' | 'past_due' | 'free';
  activatedSessionIds?: string[]; // prevent replay
}

const userKey = (email: string) => `user:${email.toLowerCase()}`;

export async function getUser(email: string): Promise<UserRecord | null> {
  if (!email) return null;
  try {
    return await kv.get<UserRecord>(userKey(email));
  } catch {
    return null;
  }
}

export async function setUser(email: string, data: UserRecord): Promise<void> {
  await kv.set(userKey(email), data);
}

export async function activateSubscription(
  email: string,
  plan: 'pro' | 'elite',
  stripeCustomerId: string,
  subscriptionId: string,
  checkoutSessionId?: string,
): Promise<UserRecord> {
  const existing = await getUser(email);
  const record: UserRecord = {
    email: email.toLowerCase(),
    plan,
    stripeCustomerId,
    subscriptionId,
    subscribedAt: Date.now(),
    status: 'active',
    activatedSessionIds: [
      ...(existing?.activatedSessionIds || []),
      ...(checkoutSessionId ? [checkoutSessionId] : []),
    ],
  };
  await setUser(email, record);
  return record;
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  // Find user by subscription ID (scan approach for KV)
  // For MVP, we update via email from webhook metadata
}

export async function cancelByEmail(email: string): Promise<void> {
  const user = await getUser(email);
  if (!user) return;
  await setUser(email, {
    ...user,
    plan: 'free',
    status: 'canceled',
  });
}

export async function isSessionActivated(email: string, sessionId: string): Promise<boolean> {
  const user = await getUser(email);
  return user?.activatedSessionIds?.includes(sessionId) ?? false;
}

export async function updateUserSubscription(
  email: string,
  updates: Partial<Pick<UserRecord, 'status' | 'plan' | 'cancelAtPeriodEnd' | 'expiresAt'>>,
): Promise<void> {
  const user = await getUser(email);
  if (!user) return;
  await setUser(email, { ...user, ...updates });
}
