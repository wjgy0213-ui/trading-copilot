'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, ArrowRight, BarChart3, Loader2, CheckCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<'choose' | 'email' | 'code'>('choose');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (options?: { resend?: boolean }) => {
    if (!email || !email.includes('@')) { setError(t('login.invalid_email')); return; }
    const resend = options?.resend === true;
    if (resend) setResending(true);
    else setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) { setMode('code'); }
      else setError(data.error || t('login.send_failed'));
    } catch { setError(t('login.network_error')); }
    if (resend) setResending(false);
    else setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) { setError(t('login.invalid_code')); return; }
    setLoading(true); setError('');
    const result = await signIn('email-code', {
      email,
      code,
      callbackUrl: '/',
      redirect: false,
    });
    if (result?.error) {
      setError(t('login.code_error'));
      setLoading(false);
    } else if (result?.ok) {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-4 focus-visible:ring-offset-gray-950">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {t('login.app_name')}
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-3">{t('login.subtitle')}</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 space-y-6">
          {mode === 'choose' && (<>
            {/* Google Login */}
            <button onClick={async () => {
              setGoogleLoading(true);
              try {
                await signIn('google', { callbackUrl: '/' });
              } finally {
                setGoogleLoading(false);
              }
            }}
              disabled={googleLoading}
              aria-busy={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 rounded-xl font-medium text-sm transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? t('login.google_loading') : t('login.google')}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-600">{t('login.or')}</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            {/* Email Login */}
            <button onClick={() => setMode('email')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-medium text-sm transition border border-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
              <Mail className="w-4 h-4" />
              {t('login.email_login')}
            </button>
          </>)}

          {mode === 'email' && (<>
            <div>
              <label htmlFor="login-email" className="text-xs text-gray-500 mb-1.5 block">{t('login.email_label')}</label>
              <input id="login-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={t('login.email_placeholder')}
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition" />
              <p className="mt-2 text-xs text-gray-500">{t('login.enterKeyHint')}</p>
            </div>
            <button onClick={() => handleSendCode()} disabled={loading}
              aria-busy={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? t('login.sending_code') : t('login.send_code')}
            </button>
            <button onClick={() => { setMode('choose'); setError(''); }} className="w-full rounded py-1 text-xs text-gray-600 hover:text-gray-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
              {t('login.back')}
            </button>
          </>)}

          {mode === 'code' && (<>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">{t('login.code_sent')}</p>
              <p className="text-sm text-emerald-400 font-medium">{email}</p>
            </div>
            <div>
              <label htmlFor="login-code" className="text-xs text-gray-500 mb-1.5 block">{t('login.code_label')}</label>
              <input id="login-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('login.code_placeholder')} maxLength={6}
                onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-2xl text-center font-mono text-white tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition" />
              <p className="mt-2 text-xs text-gray-500">{t('login.enterKeyHint')}</p>
            </div>
            <button onClick={handleVerifyCode} disabled={loading || code.length !== 6}
              aria-busy={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? t('login.verifying') : t('login.verify')}
            </button>
            <div className="flex justify-between">
              <button onClick={() => { setMode('email'); setCode(''); setError(''); }} className="rounded px-1 py-1 text-xs text-gray-600 hover:text-gray-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                {t('login.change_email')}
              </button>
              <button onClick={() => handleSendCode({ resend: true })} disabled={resending} aria-busy={resending} className="rounded px-1 py-1 text-xs text-emerald-600 hover:text-emerald-400 transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                {resending ? t('login.resending') : t('login.resend')}
              </button>
            </div>
          </>)}

          {error && (
            <div role="alert" aria-live="polite" className="text-xs text-red-400 text-center bg-red-500/5 border border-red-800/30 rounded-lg py-2 px-3">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-gray-600">
            {t('login.terms')} <Link href="/terms" className="rounded text-gray-500 hover:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">{t('login.tos')}</Link> {t('login.and')} <Link href="/privacy-apps" className="rounded text-gray-500 hover:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">{t('login.privacy')}</Link>
          </p>
          <Link href="/" className="inline-block rounded px-1 py-1 text-xs text-gray-600 hover:text-gray-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
            {t('login.back_home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
