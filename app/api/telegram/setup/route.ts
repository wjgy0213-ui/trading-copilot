import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { encrypt } from '@/lib/encryption';
import { cookies } from 'next/headers';
import { getRequestLocale, translateForLocale as tr } from '@/lib/server-i18n';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  const locale = getRequestLocale(req);

  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: tr(locale, 'api.common.unauthorized') }, { status: 401 });
    }

    const { chatId, botToken } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: tr(locale, 'api.telegram.chatIdRequired') }, { status: 400 });
    }

    // Use default bot token if not provided
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ 
        error: tr(locale, 'api.telegram.tokenMissing') 
      }, { status: 400 });
    }

    // Send test message
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: locale === 'zh'
            ? '✅ Trading Copilot Elite 通知已连接！\n\n你将收到：\n• 持仓更新\n• 风险提醒\n• 平仓确认'
            : '✅ Trading Copilot Elite notifications connected!\n\nYou will receive:\n• Position updates\n• Risk alerts\n• Close confirmations',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || tr(locale, 'api.telegram.testSendFailed'));
      }
    } catch (error: unknown) {
      return NextResponse.json({ 
        error: tr(locale, 'api.telegram.testSendCheckChatId'),
        details: getErrorMessage(error) 
      }, { status: 400 });
    }

    // Store encrypted config
    const config = JSON.stringify({ chatId, botToken: token });
    const encrypted = encrypt(config);

    const cookieStore = await cookies();
    cookieStore.set('telegram-config', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({ success: true, message: tr(locale, 'api.telegram.connected') });
  } catch (error: unknown) {
    console.error('Telegram setup error:', error);
    return NextResponse.json({ 
      error: getErrorMessage(error) || tr(locale, 'api.telegram.setupFailed') 
    }, { status: 500 });
  }
}
