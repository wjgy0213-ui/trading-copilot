import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { upsertLead } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      wechat,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      landing_page,
    } = await req.json()

    if (!email && !wechat) {
      return NextResponse.json({ error: 'Please provide contact information' }, { status: 400 })
    }

    // Basic email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const entry = { email, wechat, source: source || 'waitlist', timestamp }

    await upsertLead({
      email,
      wechat,
      source: source || 'waitlist-page',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      landing_page,
      status: 'new',
    })

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Notify owner
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Trading Copilot <noreply@tradingcopilot.app>',
        to: 'a6723372291@gmail.com',
        subject: `🎉 Trading Copilot 新候补用户`,
        html: `
          <h2>有新用户加入候补名单</h2>
          <p><strong>时间：</strong>${timestamp}</p>
          <p><strong>邮箱：</strong>${email || '未填写'}</p>
          <p><strong>微信：</strong>${wechat || '未填写'}</p>
          <p><strong>来源：</strong>${source || 'waitlist'}</p>
        `,
      })
    } catch (emailErr) {
      console.error('Resend owner notify failed:', emailErr)
    }

    // Send welcome email to user (only if email provided)
    if (email) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'Trading Copilot <noreply@tradingcopilot.app>',
          to: email,
          subject: `✅ 你已成功加入 Trading Copilot 候补名单`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: #1e293b; border-radius: 12px; padding: 32px; border: 1px solid #334155;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 40px;">🚀</span>
                  <h1 style="color: #10b981; font-size: 22px; margin: 12px 0 4px;">你在候补名单上了</h1>
                  <p style="color: #94a3b8; font-size: 14px; margin: 0;">Trading Copilot · AI 交易策略平台</p>
                </div>

                <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 16px;">感谢加入！我们正在为第一批用户做最后的打磨。</p>

                <div style="background: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 3px solid #10b981;">
                  <p style="color: #10b981; font-weight: 600; margin: 0 0 10px; font-size: 14px;">🎁 早鸟权益</p>
                  <ul style="color: #94a3b8; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 16px;">
                    <li>优先内测资格（前50名）</li>
                    <li>首月 Pro 会员 5折</li>
                    <li>专属交流群 + 创始人直连</li>
                  </ul>
                </div>

                <div style="background: #0f172a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px; font-weight: 600;">平台核心功能：</p>
                  <ul style="color: #94a3b8; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 16px;">
                    <li>📊 策略工坊 — 8种策略模板 + 参数优化器</li>
                    <li>🎯 纸盘模拟 — 实盘价格，零风险练习</li>
                    <li>🤖 AI策略师 — 自然语言生成交易策略</li>
                    <li>📱 AI陪练 — 实时监督，帮你守住规则</li>
                  </ul>
                </div>

                <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
                  内测开放时我们会第一时间通知你<br>
                  <a href="https://trading-copilot-delta.vercel.app" style="color: #10b981;">trading-copilot-delta.vercel.app</a>
                </p>
              </div>
            </body>
            </html>
          `,
        })
      } catch (welcomeErr) {
        // Non-fatal
        console.error('Resend welcome email failed:', welcomeErr)
      }
    }

    return NextResponse.json({ success: true, message: '已加入候补名单' })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: 'Submission failed, please try again' }, { status: 500 })
  }
}
