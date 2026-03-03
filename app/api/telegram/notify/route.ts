import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/encryption';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { message, email } = await req.json();

    if (!message || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get telegram config from cookie
    const cookieStore = await cookies();
    const encryptedConfig = cookieStore.get('telegram-config')?.value;

    if (!encryptedConfig) {
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 400 });
    }

    const config = JSON.parse(decrypt(encryptedConfig));
    const { chatId, botToken } = config;

    // Send notification
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.description || 'Failed to send notification');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telegram notify error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
}
