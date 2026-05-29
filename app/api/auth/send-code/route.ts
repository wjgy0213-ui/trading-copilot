import { NextRequest, NextResponse } from 'next/server';
import { generateVerifyCode } from '@/lib/authOptions';
import { getRequestLocale, translateForLocale as tr } from '@/lib/server-i18n';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  const locale = getRequestLocale(req);

  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: tr(locale, 'api.auth.validEmail') }, { status: 400 });
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
          from: process.env.EMAIL_FROM || 'Trading Copilot <noreply@tradingcopilot.app>',
          to: email,
          subject: locale === 'zh' ? `验证码：${code} · Trading Copilot` : `Verification Code: ${code} · Trading Copilot`,
          html: locale === 'zh'
            ? `
            <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0d1117;color:#e6edf3;border-radius:12px;">
              <h2 style="color:#10b981;margin:0 0 16px;">Trading Copilot</h2>
              <p style="color:#8b949e;font-size:14px;">你的验证码是：</p>
              <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#fff;background:#161b22;padding:16px 24px;border-radius:8px;text-align:center;margin:16px 0;">
                ${code}
              </div>
              <p style="color:#484f58;font-size:12px;">10分钟内有效。如果不是你本人操作，请忽略。</p>
            </div>
          `
            : `
            <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0d1117;color:#e6edf3;border-radius:12px;">
              <h2 style="color:#10b981;margin:0 0 16px;">Trading Copilot</h2>
              <p style="color:#8b949e;font-size:14px;">Your verification code is:</p>
              <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#fff;background:#161b22;padding:16px 24px;border-radius:8px;text-align:center;margin:16px 0;">
                ${code}
              </div>
              <p style="color:#484f58;font-size:12px;">It expires in 10 minutes. If this wasn't you, you can ignore this email.</p>
            </div>
          `,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        console.error('[AUTH] Resend error:', resData);
        const detail = String(resData?.message || JSON.stringify(resData));
        const friendly = /testing emails|verify a domain|only to your own email/i.test(detail)
          ? tr(locale, 'api.auth.emailNotLive')
          : `${tr(locale, 'api.auth.sendFailedPrefix')}: ${detail}`;
        return NextResponse.json({ error: friendly }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: tr(locale, 'api.auth.resendMissing') }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: tr(locale, 'api.auth.codeSent') });
  } catch (e: unknown) {
    return NextResponse.json({ error: getErrorMessage(e) || tr(locale, 'api.auth.sendFailedGeneric') }, { status: 500 });
  }
}
