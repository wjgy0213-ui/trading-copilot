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
      .then(data => {
        if (data) {
          setSession(data);
          setLoading(false);
        } else {
          // tc-session missing — try syncing from NextAuth (Google/email login)
          fetch('/api/auth/sync')
            .then(r => r.ok ? r.json() : null)
            .then(syncData => {
              if (syncData?.ok) {
                // Sync succeeded, re-fetch session
                fetch('/api/auth/me')
                  .then(r => r.ok ? r.json() : null)
                  .then(d => { setSession(d); setLoading(false); });
              } else {
                setLoading(false);
              }
            })
            .catch(() => setLoading(false));
        }
      })
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
