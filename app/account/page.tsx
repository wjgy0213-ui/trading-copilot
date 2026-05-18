'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/useSession';
import { User, CreditCard, LogOut, Shield, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { formatLocaleDate } from '@/lib/i18n-helpers';

export default function AccountPage() {
  const { t, locale } = useI18n();
  const formatDate = (ts: number) =>
    formatLocaleDate(ts * 1000, locale, { year: 'numeric', month: 'long', day: 'numeric' });
  const { session, loading: sessionLoading, logout } = useSession();
  const [subData, setSubData] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    if (session?.plan && session.plan !== 'free') {
      setLoadingSub(true);
      fetch('/api/subscription')
        .then(r => r.json())
        .then(d => { setSubData(d); setLoadingSub(false); })
        .catch(() => setLoadingSub(false));
    }
  }, [session]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch('/api/subscription', { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setSubData({ ...subData, cancel_at_period_end: true });
        setShowCancel(false);
      }
    } catch {}
    setCancelling(false);
  };

  if (sessionLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-700 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <User className="w-16 h-16 text-gray-700 mx-auto" />
        <h1 className="text-xl font-bold text-gray-300">{t('account.login_required')}</h1>
        <p className="text-sm text-gray-500">{t('account.login_desc')}</p>
        <Link href="/pricing" className="inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition">
          {t('account.view_plans')}
        </Link>
      </div>
    </div>
  );

  const planName = session.plan === 'elite' ? t('account.plan_elite') : session.plan === 'pro' ? t('account.plan_pro') : t('account.free_plan');
  const planColor = session.plan === 'elite' ? 'text-violet-400' : session.plan === 'pro' ? 'text-emerald-400' : 'text-gray-400';
  const planBg = session.plan === 'elite' ? 'bg-violet-500/10 border-violet-800/50' : session.plan === 'pro' ? 'bg-emerald-500/10 border-emerald-800/50' : 'bg-gray-800/30 border-gray-700/50';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {t('account.app_name')}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/strategy" className="text-gray-400 hover:text-white transition">{t('account.strategy_lab')}</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition">{t('account.pricing')}</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold">{t('account.heading')}</h1>

        {/* Plan Card */}
        <div className={`border rounded-2xl p-6 ${planBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${session.plan === 'elite' ? 'bg-violet-500/20' : session.plan === 'pro' ? 'bg-emerald-500/20' : 'bg-gray-700/30'}`}>
                {session.plan === 'elite' ? '💎' : session.plan === 'pro' ? '🚀' : '🆓'}
              </div>
              <div>
                <div className={`text-xl font-bold ${planColor}`}>{planName}</div>
                <div className="text-sm text-gray-500">
                  {session.plan === 'free' ? t('account.basic_features') : session.plan === 'pro' ? t('account.plan_price_pro') : t('account.plan_price_elite')}
                </div>
              </div>
            </div>
            {session.plan === 'free' && (
              <Link href="/pricing" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition">
                {t('account.upgrade_pro')}
              </Link>
            )}
          </div>

          {/* Subscription details */}
          {loadingSub && (
            <div className="mt-6 pt-4 border-t border-gray-800/50">
              <div className="text-xs text-gray-500">{t('account.loading_subscription')}</div>
            </div>
          )}

          {subData && !subData.error && (
            <div className="mt-6 pt-4 border-t border-gray-800/50 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">{t('account.sub_status')}</div>
                  <div className={`font-medium ${subData.cancel_at_period_end ? 'text-yellow-400' : 'text-green-400'}`}>
                    {subData.cancel_at_period_end ? t('account.sub_cancel_pending') : t('account.sub_active')}
                  </div>
                </div>
                {subData.current_period_end && (
                  <div>
                    <div className="text-gray-500 text-xs mb-1">{t('account.next_billing')}</div>
                    <div className="font-medium text-gray-300">{formatDate(subData.current_period_end)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" /> {t('account.your_benefits')}
          </h2>
          <div className="space-y-3">
            {[
              { name: t('account.feat_backtest'), free: true, pro: true, elite: true },
              { name: t('account.feat_templates'), free: true, pro: true, elite: true },
              { name: t('account.feat_ai_gen'), free: t('account.feat_ai_gen_free'), pro: t('account.feat_ai_gen_unlimited'), elite: t('account.feat_ai_gen_unlimited') },
              { name: t('account.feat_optimizer'), free: false, pro: true, elite: true },
              { name: t('account.feat_monte_carlo'), free: false, pro: true, elite: true },
              { name: t('account.feat_signals'), free: false, pro: false, elite: true },
              { name: t('account.feat_api'), free: false, pro: false, elite: true },
            ].map(f => {
              const current = session.plan || 'free';
              const hasIt = current === 'elite' ? f.elite : current === 'pro' ? f.pro : f.free;
              return (
                <div key={f.name} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-300">{f.name}</span>
                  <span className={`text-sm font-mono ${hasIt ? 'text-green-400' : 'text-gray-600'}`}>
                    {typeof hasIt === 'string' ? hasIt : hasIt ? t('account.value_included') : t('account.value_unavailable')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="border border-gray-800 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-medium text-gray-400 mb-2">{t('account.actions')}</h2>

          {session.plan !== 'free' && !subData?.cancel_at_period_end && (
            <>
              {!showCancel ? (
                <button onClick={() => setShowCancel(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 transition text-sm">
                  <span className="flex items-center gap-3 text-gray-400">
                    <CreditCard className="w-4 h-4" /> {t('account.cancel_sub')}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-800/50 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-red-400">{t('account.confirm_cancel')}</div>
                      <div className="text-xs text-gray-500 mt-1">{t('account.cancel_note')}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleCancel} disabled={cancelling}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition">
                      {cancelling ? t('account.processing') : t('account.confirm')}
                    </button>
                    <button onClick={() => setShowCancel(false)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition">
                      {t('account.back')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {session.plan === 'free' && (
            <Link href="/pricing"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-800/50 transition text-sm">
              <span className="flex items-center gap-3 text-emerald-400">
                <CreditCard className="w-4 h-4" /> {t('account.upgrade_to_pro')}
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </Link>
          )}

          <button onClick={logout}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 transition text-sm">
            <span className="flex items-center gap-3 text-gray-400">
              <LogOut className="w-4 h-4" /> {t('account.logout')}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Usage Stats placeholder */}
        <div className="border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> {t('account.usage_stats')}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-400">—</div>
              <div className="text-xs text-gray-500 mt-1">{t('account.backtest_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-violet-400">—</div>
              <div className="text-xs text-gray-500 mt-1">{t('account.ai_gen_count')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-cyan-400">—</div>
              <div className="text-xs text-gray-500 mt-1">{t('account.optimize_count')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
