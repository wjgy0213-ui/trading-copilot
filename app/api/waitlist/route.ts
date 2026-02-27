import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  try {
    const { email, wechat, source } = await req.json()

    if (!email && !wechat) {
      return NextResponse.json({ error: '请填写联系方式' }, { status: 400 })
    }

    // Basic email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const entry = { email, wechat, source: source || 'waitlist', timestamp }

    // Notify owner via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'onboarding@resend.dev',
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
      // Non-fatal: still return success even if email fails
      console.error('Resend notify failed:', emailErr)
    }

    return NextResponse.json({ success: true, message: '已加入候补名单' })
  } catch (err) {
    console.error('Waitlist error:', err)
    return NextResponse.json({ error: '提交失败，请重试' }, { status: 500 })
  }
}
