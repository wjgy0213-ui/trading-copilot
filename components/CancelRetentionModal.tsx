'use client';

import { useState } from 'react';
import { X, Gift, ArrowRight, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface CancelRetentionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'pro' | 'elite';
  email: string;
}

export default function CancelRetentionModal({ isOpen, onClose, currentPlan, email }: CancelRetentionModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const yearlyPrice = currentPlan === 'pro' ? 239.88 : 479.88;
  const discountedPrice = +(yearlyPrice * 0.7).toFixed(2);
  const monthlyEquiv = +(discountedPrice / 12).toFixed(2);

  const handleSwitchToYearly = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: currentPlan, email, interval: 'yearly' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert(t('cancel_modal.network_error'));
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-500/30">
            <Gift className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-xl font-bold mb-2">{t('cancel_modal.title')}</h2>
          <p className="text-gray-400 text-sm mb-6">
            {t('cancel_modal.desc').replace('{discount}', '30%')}
          </p>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-6">
            <div className="text-3xl font-bold text-white mb-1">
              ${monthlyEquiv}<span className="text-base text-gray-400 font-normal">{t('cancel_modal.per_month')}</span>
            </div>
            <div className="text-sm text-gray-500">
              {t('cancel_modal.yearly_billed')} ${discountedPrice}
            </div>
            <div className="mt-2 inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-medium px-2.5 py-1 rounded-full">
              {t('cancel_modal.save_per_year').replace('{amount}', `$${(yearlyPrice - discountedPrice).toFixed(2)}`)}
            </div>
          </div>

          <button
            onClick={handleSwitchToYearly}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-5 py-3.5 rounded-xl text-sm font-semibold transition-all mb-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>{t('cancel_modal.switch_yearly').replace('{pct}', String(Math.round((1 - 0.7) * 100)))} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition"
          >
            {t('cancel_modal.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
