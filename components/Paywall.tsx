'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession } from '@/lib/useSession';
import { useI18n } from '@/lib/i18n';
import { Lock, Sparkles, Crown } from 'lucide-react';
import QuotaGate, { QuotaIndicator } from '@/components/QuotaGate';

export function PaywallBanner() {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="text-sm text-gray-300">{t('paywall.subtitle')}</span>
      <Link href="/pricing" className="ml-auto text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium transition shrink-0">{t('pricing.cta.pro')}</Link>
    </div>
  );
}

// Re-export QuotaIndicator for backward compatibility
export { QuotaIndicator };

/**
 * Paywall component — now delegates to QuotaGate (free daily quota system).
 * The old 24h trial logic has been removed.
 */
export default function Paywall({ children, feature }: { children: React.ReactNode; feature?: string }) {
  const { isPro, loading } = useSession();
  const { t } = useI18n();
  const [showActivate, setShowActivate] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  if (loading) return <>{children}</>;
  if (isPro) return <>{children}</>;

  // For activation code support, wrap QuotaGate with code input
  const handleActivateCode = async () => {
    const { activatePro } = await import('@/lib/paywall');
    if (activatePro(code)) {
      window.location.reload();
    } else {
      setCodeError(t('paywall.codeInvalid'));
    }
  };

  return (
    <QuotaGate feature={feature}>
      {children}
    </QuotaGate>
  );
}
