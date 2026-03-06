'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from '@/lib/useSession';
import { Lock, Sparkles, Clock, Zap } from 'lucide-react';
import { trackEvent } from '@/components/Analytics';

function TrialCountdown() {
  const { session } = useSession();
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const expiry = session?.trialExpiresAt;
      if (!expiry || expiry <= Date.now()) { setRemaining(''); return; }
      const diff = expiry - Date.now();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}小时${m}分钟`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [session?.trialExpiresAt]);

  if (!remaining) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
      <Clock className="w-3 h-3" />
      Pro 试用剩余 {remaining}
    </div>
  );
}

export function PaywallBanner() {
  return (
    <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="text-sm text-gray-300">解锁 <span className="text-emerald-400 font-semibold">Pro</span> 获得参数优化、蒙特卡洛模拟等高级功能</span>
      <Link href="/pricing" className="ml-auto text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium transition shrink-0">升级</Link>
    </div>
  );
}

export { TrialCountdown };

export default function Paywall({ children, feature }: { children: React.ReactNode; feature?: string }) {
  const { session, isPro, loading, refresh } = useSession();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [showActivate, setShowActivate] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  if (loading) return <>{children}</>;
  if (isPro) return <>{children}</>;

  const handleStartTrial = async () => {
    // Must be logged in
    if (!session?.email) {
      // Redirect to login, then come back
      window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setStarting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/trial', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        trackEvent('start_trial', 'conversion', feature || 'general');
        refresh(); // re-fetch session to get updated plan
        // Small delay for KV propagation
        setTimeout(() => window.location.reload(), 500);
      } else if (data.error === 'trial_used') {
        setError(data.message || '试用已过期，请升级 Pro');
      } else {
        setError('开启试用失败，请重试');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setStarting(false);
    }
  };

  const handleActivateCode = async () => {
    // Keep activation codes client-side for now (legacy)
    const { activatePro } = await import('@/lib/paywall');
    if (activatePro(code)) {
      window.location.reload();
    } else {
      setCodeError('激活码无效，请重试');
    }
  };

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gray-900/98 border border-gray-700 rounded-2xl p-7 text-center max-w-sm w-full shadow-2xl">

          {/* Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>

          <h3 className="font-bold text-lg mb-1">Pro 专属功能</h3>
          <p className="text-sm text-gray-500 mb-5">
            {feature || '升级解锁全部高级功能'}
          </p>

          {/* Primary CTA: Free Trial */}
          <button
            onClick={handleStartTrial}
            disabled={starting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all mb-3 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {starting ? '开启中...' : session?.email ? '免费体验 24 小时 Pro' : '登录后免费体验 24 小时'}
          </button>

          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          {/* Secondary: Upgrade */}
          <Link href="/pricing"
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-all mb-3 border border-gray-700">
            <Sparkles className="w-4 h-4 text-violet-400" />
            升级 Pro — $39.99/月
          </Link>

          {/* Tertiary: Activation code */}
          {!showActivate ? (
            <button onClick={() => setShowActivate(true)}
              className="text-xs text-gray-600 hover:text-gray-400 transition">
              已有激活码？
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                value={code}
                onChange={e => { setCode(e.target.value); setCodeError(''); }}
                placeholder="输入激活码"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-emerald-600"
              />
              <button onClick={handleActivateCode}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg text-xs transition">
                确认
              </button>
            </div>
          )}
          {codeError && <p className="text-xs text-red-400 mt-1">{codeError}</p>}

          <p className="text-[10px] text-gray-700 mt-4">
            {session?.email ? '每个账号仅限一次试用 · 到期自动恢复免费版' : '需要 Google 账号登录 · 每个账号仅限一次试用'}
          </p>
        </div>
      </div>
    </div>
  );
}
