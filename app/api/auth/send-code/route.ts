import { NextRequest, NextResponse } from 'next/server';
import { generateVerifyCode } from '@/lib/authOptions';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: '请输入有效邮箱' }, { status: 400 });
    }

    const code = generateVerifyCode(email);

    // In production: send via Resend/SendGrid/SES
    // For MVP: log to console (user sees it in network tab or we add a toast)
    console.log(`[AUTH] Verification code for ${email}: ${code}`);

    // Try to send via Resend if configured
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Trading Copilot <onboarding@resend.dev>',
          to: email,
          subject: `验证码: ${code} — 交易陪练 AI`,
          html: `
            <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0d1117;color:#e6edf3;border-radius:12px;">
              <h2 style="color:#10b981;margin:0 0 16px;">交易陪练 AI</h2>
              <p style="color:#8b949e;font-size:14px;">你的验证码是：</p>
              <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#fff;background:#161b22;padding:16px 24px;border-radius:8px;text-align:center;margin:16px 0;">
                ${code}
              </div>
              <p style="color:#484f58;font-size:12px;">10分钟内有效。如果不是你本人操作，请忽略。</p>
            </div>
          `,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        console.error('[AUTH] Resend error:', resData);
        return NextResponse.json({ error: `邮件发送失败: ${resData.message || JSON.stringify(resData)}` }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'RESEND_API_KEY未配置' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: '验证码已发送' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
