'use client'

import { useEffect, useState } from 'react'
import { analytics } from '@/lib/analytics'
import { useI18n } from '@/lib/i18n'

export default function WaitlistPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [wechat, setWechat] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [count] = useState(47)

  useEffect(() => {
    analytics.ctaClick({
      cta_id: 'waitlist_view',
      cta_text: 'waitlist_landing',
      target: '/waitlist',
      page: '/waitlist',
      location: 'page_load',
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email && !wechat) {
      setErrorMsg(t('waitlist.error_contact'))
      return
    }
    setStatus('loading')
    setErrorMsg('')

    try {
      const method = email && wechat ? 'both' : email ? 'email' : 'wechat'
      const utm = typeof window !== 'undefined'
        ? Object.fromEntries(new URLSearchParams(window.location.search).entries())
        : {}

      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          wechat,
          source: (utm.utm_source as string) || 'waitlist-page',
          utm_source: utm.utm_source,
          utm_medium: utm.utm_medium,
          utm_campaign: utm.utm_campaign,
          utm_content: utm.utm_content,
          utm_term: utm.utm_term,
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          landing_page: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/waitlist',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        analytics.waitlistSubmit({ method, source: ((utm.utm_source as string) || 'waitlist-page'), page: '/waitlist' })
      } else {
        setErrorMsg(data.error || t('waitlist.submit_failed'))
        setStatus('error')
      }
    } catch {
      setErrorMsg(t('waitlist.network_error'))
      setStatus('error')
    }
  }

  const features = [
    { icon: '🔬', title: t('waitlist.feat_verify'), desc: t('waitlist.feat_verify_desc') },
    { icon: '🤖', title: t('waitlist.feat_ai'), desc: t('waitlist.feat_ai_desc') },
    { icon: '👁️', title: t('waitlist.feat_monitor'), desc: t('waitlist.feat_monitor_desc') },
    { icon: '📚', title: t('waitlist.feat_course'), desc: t('waitlist.feat_course_desc') },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {t('waitlist.badge')}
          </div>

          <h1 className="text-3xl font-black text-white mb-3 leading-tight">
            {t('waitlist.heading')}
          </h1>
          <p className="text-gray-400 text-base leading-relaxed whitespace-pre-line">
            {t('waitlist.desc')}
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map((f) => (
            <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-3.5">
              <div className="text-xl mb-1">{f.icon}</div>
              <div className="text-white text-sm font-semibold">{f.title}</div>
              <div className="text-gray-500 text-xs mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex -space-x-2">
            {['🧑', '👩', '🧑‍💻', '👨'].map((emoji, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-gray-800 border-2 border-gray-950 flex items-center justify-center text-sm">
                {emoji}
              </div>
            ))}
          </div>
          <span className="text-gray-400 text-sm">
            {t('waitlist.social_proof').replace('{count}', String(count))}
          </span>
        </div>

        {/* Form */}
        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-white font-bold text-lg mb-2">{t('waitlist.success_title')}</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {t('waitlist.success_desc')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 ml-1">
                {t('waitlist.email_label')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('waitlist.emailPlaceholder')}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-xs">{t('waitlist.or')}</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 ml-1">
                {t('waitlist.wechat_label')}
              </label>
              <input
                type="text"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder={t('waitlist.wechat_placeholder')}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition text-sm"
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 text-xs text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 text-white font-bold py-3.5 rounded-xl transition text-base mt-1"
            >
              {status === 'loading' ? t('waitlist.submitting') : t('waitlist.submit_btn')}
            </button>

            <p className="text-center text-gray-600 text-xs">
              {t('waitlist.no_spam')}
            </p>
          </form>
        )}

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs">
            {t('waitlist.has_account')}{' '}
            <a href="/strategy" className="text-emerald-500 hover:text-emerald-400">
              {t('waitlist.try_free')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
