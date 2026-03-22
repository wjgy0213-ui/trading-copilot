'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

export default function BacktestPage() {
  const router = useRouter();
  const { t } = useI18n();
  useEffect(() => { router.replace('/strategy'); }, [router]);
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">
      <p>{t('backtest.redirecting')}</p>
    </div>
  );
}
