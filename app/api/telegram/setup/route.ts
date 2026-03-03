import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { encrypt } from '@/lib/encryption';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, botToken } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Use default bot token if not provided
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json({ 
        error: 'Telegram bot token not configured' 
      }, { status: 400 });
    }

    // Send test message
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '✅ Trading Copilot Elite 通知已连接！\n\n您将收到：\n• 持仓变化通知\n• 风控状态警报\n• 平仓确认',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Failed to send test message');
      }
    } catch (error: any) {
      return NextResponse.json({ 
        error: 'Failed to send test message. Please check your Chat ID.',
        details: error.message 
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram setup error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to setup Telegram' 
    }, { status: 500 });
  }
}
