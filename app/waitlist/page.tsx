'use client'

import { useState } from 'react'
import { trackEvent } from '@/components/Analytics'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [wechat, setWechat] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [count] = useState(47) // Social proof counter (seed number)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email && !wechat) {
      setErrorMsg('请至少填写一种联系方式')
      return
    }
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wechat, source: 'waitlist-page' }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        trackEvent('waitlist_signup', 'conversion', email ? 'email' : 'wechat')
      } else {
        setErrorMsg(data.error || '提交失败')
        setStatus('error')
      }
    } catch {
      setErrorMsg('网络错误，请重试')
      setStatus('error')
    }
  }

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
            内测即将开放
          </div>

          <h1 className="text-3xl font-black text-white mb-3 leading-tight">
            Trading Copilot
          </h1>
          <p className="text-gray-400 text-base leading-relaxed">
            AI 交易陪练系统 — 从靠感觉交易<br />变成有系统的交易者
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: '🔬', title: '策略验证', desc: '历史回测 + 参数优化' },
            { icon: '🤖', title: 'AI策略师', desc: '描述想法生成策略' },
            { icon: '👁️', title: '执行监督', desc: 'AI盯仓防止乱操作' },
            { icon: '📚', title: '系统课程', desc: '从零建立交易框架' },
          ].map((f) => (
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
            已有 <span className="text-white font-semibold">{count}+</span> 人加入候补
          </span>
        </div>

        {/* Form */}
        {status === 'success' ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-white font-bold text-lg mb-2">已加入候补名单！</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              内测开放时会第一时间联系你<br />
              感谢支持，一起慢交易 🙏
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 ml-1">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-xs">或</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 ml-1">
                微信 ID
              </label>
              <input
                type="text"
                value={wechat}
                onChange={(e) => setWechat(e.target.value)}
                placeholder="微信号（方便内测邀请）"
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
              {status === 'loading' ? '提交中...' : '加入候补名单 →'}
            </button>

            <p className="text-center text-gray-600 text-xs">
              不发垃圾信息 · 随时可退出
            </p>
          </form>
        )}

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs">
            已有账号？{' '}
            <a href="/strategy" className="text-emerald-500 hover:text-emerald-400">
              立即体验 24h 免费试用 →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
