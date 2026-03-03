'use client';

import { useState, useEffect } from 'react';

export interface ClientSession {
  email: string;
  plan: 'free' | 'pro' | 'elite';
  courseAccess?: boolean;
}

export function useSession() {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { setSession(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const isPro = session?.plan === 'pro' || session?.plan === 'elite';
  const isElite = session?.plan === 'elite';
  const hasCourse = session?.courseAccess === true;

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
      setSession(null);
      window.location.href = '/';
    });
  };

  return { session, loading, isPro, isElite, hasCourse, logout, refresh: () => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(setSession);
  }};
}
