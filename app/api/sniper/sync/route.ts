import { NextResponse } from 'next/server';
import { syncToSupabase } from '@/scripts/sync-sniper-to-supabase';

// POST /api/sniper/sync — Trigger sync from local state to Supabase
// Usage: curl -X POST http://localhost:3000/api/sniper/sync
export async function POST() {
  try {
    await syncToSupabase();
    return NextResponse.json({
      success: true,
      message: 'Sniper state synced to Supabase',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Sniper Sync] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// GET — Check sync status
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/sniper/sync',
    method: 'POST',
    description: 'Sync local Sniper state to Supabase',
    usage: 'curl -X POST http://localhost:3000/api/sniper/sync',
  });
}
