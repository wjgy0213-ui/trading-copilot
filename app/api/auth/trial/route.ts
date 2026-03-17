import { NextResponse } from 'next/server';

// DEPRECATED: Trial system replaced by daily free quota (3 uses/day).
// Kept for backward compatibility — returns deprecation message.

export async function POST() {
  return NextResponse.json(
    {
      error: 'trial_deprecated',
      message: '试用系统已升级：注册用户每天免费3次市场分析，无需激活试用。升级 Pro 解锁无限使用。',
    },
    { status: 410 }
  );
}
