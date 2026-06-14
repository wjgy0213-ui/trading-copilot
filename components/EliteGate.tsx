'use client';

import { ReactNode } from 'react';
import { Shield } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import { useI18n } from '@/lib/i18n';

interface EliteGateProps {
  children: ReactNode;
  label?: string;
}

export default function EliteGate({ children, label }: EliteGateProps) {
  const { t } = useI18n();
  const { isElite, loading } = useSession();

  if (loading) {
    return (
      <div className="relative">
        {children}
        <div
          className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center rounded-lg"
          role="status"
          aria-live="polite"
          aria-label={t('elite_gate.loading')}
        >
          <div className="flex flex-col items-center gap-3 text-violet-200">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-300">{t('elite_gate.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isElite) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 backdrop-blur-md flex flex-col items-center justify-center rounded-lg border border-violet-500/30">
          <Shield className="w-16 h-16 text-violet-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{label || t('elite_gate.title')}</h3>
          <p className="text-gray-300 mb-6 text-center max-w-xs">
            {t('elite_gate.desc')}
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40"
          >
            {t('elite_gate.upgrade')}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
