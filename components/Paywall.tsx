'use client';

import Link from 'next/link';
import { useSession } from '@/lib/useSession';
import { isProUser } from '@/lib/paywall';
import { Lock, Sparkles } from 'lucide-react';

export default function Paywall({ children, feature }: { children: React.ReactNode; feature?: string }) {
  const { isPro, loading } = useSession();
  const legacyPro = isProUser();

  if (loading) return <>{children}</>;
  if (isPro || legacyPro) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gray-900/95 border border-gray-700 rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="font-bold text-lg mb-2">Pro 专属功能</h3>
          <p className="text-sm text-gray-500 mb-4">
            {feature || '升级解锁全部高级功能'}
          </p>
          <Link href="/pricing"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
            <Sparkles className="w-4 h-4" /> 升级 Pro — $29/月
          </Link>
        </div>
      </div>
    </div>
  );
}
