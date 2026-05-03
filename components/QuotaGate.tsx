'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/useSession';
import { getFreeQuotaRemaining, getFreeQuotaLimit, useFreeQuota } from '@/lib/freeQuota';
import { Lock, Sparkles, Zap, Crown } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/**
 * QuotaGate: Replaces the old trial-based Paywall.
 *
 * - Pro/Elite users: always see children (unlimited)
 * - Free users: see children if they have free quota remaining.
 *   Each render of gated content consumes one quota.
 * - When quota is exhausted: shows upgrade prompt.
 *
 * Usage: <QuotaGate feature={t('health.title')}><YourComponent /></QuotaGate>
 *
 * For non-gated features (practice, learn, etc.), don't wrap them.
 */
export default function QuotaGate({
  children,
  feature,
}: {
  children: React.ReactNode;
  feature?: string;
}) {
  const { t } = useI18n();
  const { isPro, loading } = useSession();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (isPro) {
      setAllowed(true);
      return;
    }
    // Free user: check & consume quota
    const rem = getFreeQuotaRemaining();
    if (rem > 0) {
      useFreeQuota();
      setAllowed(true);
      setRemaining(rem - 1);
    } else {
      setAllowed(false);
      setRemaining(0);
    }
  }, [isPro, loading]);

  // Loading state — show children blurred
  if (loading || allowed === null) {
    return <>{children}</>;
  }

  // Pro user or allowed
  if (allowed) {
    return (
      <>
        {!isPro && (
          <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-lg px-3 py-2 mb-4 text-xs text-gray-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {t('quota.remaining')}<span className="text-white font-medium">{remaining}/{getFreeQuotaLimit()}</span>
            <Link href="/pricing" className="ml-auto text-emerald-400 hover:text-emerald-300 transition">
              {t('quota.upgrade_unlimited')}
            </Link>
          </div>
        )}
        {children}
      </>
    );
  }

  // Quota exhausted
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gray-900/98 border border-gray-700 rounded-2xl p-7 text-center max-w-sm w-full shadow-2xl">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>

          <h3 className="font-bold text-lg mb-1">{t('quota.exhausted')}</h3>
          <p className="text-sm text-gray-500 mb-2">
            {(feature || t('quota.thisFeature')) ? `${feature || t('quota.thisFeature')} · ` : ''}{t('quota.daily_limit').replace('{limit}', String(getFreeQuotaLimit()))}
          </p>
          <p className="text-xs text-gray-600 mb-5">
            {t('quota.reset_tomorrow')}
          </p>

          <Link href="/pricing"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all mb-3">
            <Crown className="w-4 h-4" />
            {t('quota.upgrade_pro')}
          </Link>

          <div className="flex items-center gap-2 justify-center text-xs text-gray-600">
            <Sparkles className="w-3 h-3" />
            {t('quota.yearly_hint')}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline quota indicator for navigation/headers
 */
export function QuotaIndicator() {
  const { isPro, loading } = useSession();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (loading || isPro) return;
    setRemaining(getFreeQuotaRemaining());
  }, [isPro, loading]);

  if (loading || isPro || remaining === null) return null;

  return (
    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
      remaining > 0
        ? 'bg-emerald-500/10 text-emerald-400'
        : 'bg-red-500/10 text-red-400'
    }`}>
      <Zap className="w-3 h-3" />
      {remaining}/{getFreeQuotaLimit()}
    </div>
  );
}
