import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getReviews,
  getReviewByDate,
  saveReview as saveReviewDB,
} from '@/lib/supabase';
import { decrypt } from '@/lib/encryption';
import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

// AI Trade Review — analyze recent trades and generate insights
// Elite-only feature: requires exchange connection

interface Trade {
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  qty: number;
  realizedPnl: number;
  commission: number;
  time: number;
}

interface TradeGroup {
  symbol: string;
  entries: Trade[];
  exits: Trade[];
  pnl: number;
  fees: number;
  duration: number; // ms
  maxSize: number;
  entryAvg: number;
  exitAvg: number;
  rMultiple: number;
}

function groupTrades(trades: Trade[]): TradeGroup[] {
  const bySymbol: Record<string, Trade[]> = {};
  for (const t of trades) {
    if (!bySymbol[t.symbol]) bySymbol[t.symbol] = [];
    bySymbol[t.symbol].push(t);
  }

  const groups: TradeGroup[] = [];
  for (const [symbol, symbolTrades] of Object.entries(bySymbol)) {
    const sorted = symbolTrades.sort((a, b) => a.time - b.time);
    let position = 0;
    let currentGroup: Trade[] = [];

    for (const t of sorted) {
      currentGroup.push(t);
      position += t.side === 'BUY' ? t.qty : -t.qty;

      if (Math.abs(position) < 0.0001 && currentGroup.length > 1) {
        const entries = currentGroup.filter(t => t.side === 'BUY');
        const exits = currentGroup.filter(t => t.side === 'SELL');
        const pnl = currentGroup.reduce((s, t) => s + (t.realizedPnl || 0), 0);
        const fees = currentGroup.reduce((s, t) => s + t.commission, 0);
        const duration = currentGroup[currentGroup.length - 1].time - currentGroup[0].time;
        const entryAvg = entries.length ? entries.reduce((s, t) => s + t.price * t.qty, 0) / entries.reduce((s, t) => s + t.qty, 0) : 0;
        const exitAvg = exits.length ? exits.reduce((s, t) => s + t.price * t.qty, 0) / exits.reduce((s, t) => s + t.qty, 0) : 0;
        const maxSize = Math.max(...currentGroup.map(t => t.qty));

        groups.push({
          symbol,
          entries,
          exits,
          pnl,
          fees,
          duration,
          maxSize,
          entryAvg,
          exitAvg,
          rMultiple: 0, // calculated below
        });
        currentGroup = [];
        position = 0;
      }
    }
  }

  return groups;
}

function analyzePatterns(groups: TradeGroup[]) {
  const wins = groups.filter(g => g.pnl > 0);
  const losses = groups.filter(g => g.pnl <= 0);
  const totalPnl = groups.reduce((s, g) => s + g.pnl, 0);
  const totalFees = groups.reduce((s, g) => s + g.fees, 0);
  const avgWin = wins.length ? wins.reduce((s, g) => s + g.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, g) => s + g.pnl, 0) / losses.length) : 0;
  const winRate = groups.length ? wins.length / groups.length : 0;
  const profitFactor = avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0;

  // Time analysis
  const byHour: Record<number, { wins: number; losses: number; pnl: number }> = {};
  for (const g of groups) {
    const hour = new Date(g.entries[0]?.time || 0).getUTCHours();
    if (!byHour[hour]) byHour[hour] = { wins: 0, losses: 0, pnl: 0 };
    byHour[hour].pnl += g.pnl;
    if (g.pnl > 0) byHour[hour].wins++;
    else byHour[hour].losses++;
  }

  const bestHour = Object.entries(byHour).sort((a, b) => b[1].pnl - a[1].pnl)[0];
  const worstHour = Object.entries(byHour).sort((a, b) => a[1].pnl - b[1].pnl)[0];

  // Duration analysis
  const avgDuration = groups.length ? groups.reduce((s, g) => s + g.duration, 0) / groups.length : 0;
  const quickTrades = groups.filter(g => g.duration < 5 * 60 * 1000); // <5min
  const quickLossRate = quickTrades.length ? quickTrades.filter(g => g.pnl <= 0).length / quickTrades.length : 0;

  // Consecutive losses
  let maxConsecLosses = 0;
  let currentStreak = 0;
  for (const g of groups) {
    if (g.pnl <= 0) { currentStreak++; maxConsecLosses = Math.max(maxConsecLosses, currentStreak); }
    else currentStreak = 0;
  }

  // Tilt detection
  const tiltTrades: TradeGroup[] = [];
  for (let i = 1; i < groups.length; i++) {
    if (groups[i - 1].pnl < 0 && groups[i].pnl < 0) {
      const gap = groups[i].entries[0]?.time - (groups[i - 1].exits[groups[i - 1].exits.length - 1]?.time || 0);
      if (gap < 2 * 60 * 1000) tiltTrades.push(groups[i]); // <2min after loss = revenge trade
    }
  }

  // Insights generation
  const insights: { type: 'positive' | 'warning' | 'critical'; text: string; icon: string }[] = [];

  if (winRate >= 0.6) insights.push({ type: 'positive', text: `胜率 ${(winRate * 100).toFixed(0)}% 表现优秀`, icon: '🎯' });
  else if (winRate < 0.4) insights.push({ type: 'warning', text: `胜率仅 ${(winRate * 100).toFixed(0)}%，考虑提高入场质量`, icon: '⚠️' });

  if (profitFactor > 2) insights.push({ type: 'positive', text: `盈亏比 ${profitFactor.toFixed(1)} 非常健康`, icon: '💪' });
  else if (profitFactor < 1) insights.push({ type: 'critical', text: `盈亏比 ${profitFactor.toFixed(1)} — 赚的不够赔的`, icon: '🔴' });

  if (totalFees > Math.abs(totalPnl) * 0.3) insights.push({ type: 'warning', text: `手续费占净盈亏 ${((totalFees / Math.max(Math.abs(totalPnl), 1)) * 100).toFixed(0)}% — 手续费黑洞`, icon: '💸' });

  if (quickLossRate > 0.7 && quickTrades.length >= 3) insights.push({ type: 'warning', text: `${quickTrades.length}笔快速交易（<5min）中 ${(quickLossRate * 100).toFixed(0)}% 亏损 — 考虑放慢节奏`, icon: '⏱️' });

  if (tiltTrades.length > 0) insights.push({ type: 'critical', text: `检测到 ${tiltTrades.length} 笔可能的情绪化交易（亏损后2分钟内反手）`, icon: '😤' });

  if (maxConsecLosses >= 3) insights.push({ type: 'warning', text: `最大连亏 ${maxConsecLosses} 笔 — 建议设置连亏暂停机制`, icon: '📉' });

  if (bestHour) insights.push({ type: 'positive', text: `最佳交易时段 ${bestHour[0]}:00 UTC (净赚 $${bestHour[1].pnl.toFixed(2)})`, icon: '🕐' });
  if (worstHour && worstHour[1].pnl < 0) insights.push({ type: 'warning', text: `最差时段 ${worstHour[0]}:00 UTC (亏损 $${Math.abs(worstHour[1].pnl).toFixed(2)})`, icon: '🌙' });

  // Score (0-100)
  let score = 50;
  score += winRate >= 0.5 ? (winRate - 0.5) * 60 : (winRate - 0.5) * 80;
  score += profitFactor > 1 ? Math.min((profitFactor - 1) * 10, 20) : Math.max((profitFactor - 1) * 20, -20);
  score -= tiltTrades.length * 5;
  score -= maxConsecLosses * 2;
  if (totalFees > Math.abs(totalPnl) * 0.3) score -= 10;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';

  return {
    summary: {
      totalTrades: groups.length,
      wins: wins.length,
      losses: losses.length,
      winRate,
      totalPnl,
      totalFees,
      avgWin,
      avgLoss,
      profitFactor,
      maxConsecLosses,
      avgDuration,
      score,
      grade,
    },
    timeAnalysis: byHour,
    tiltTrades: tiltTrades.length,
    insights,
    tradeGroups: groups.slice(0, 20), // Last 20 for display
  };
}

// Fetch real trades from Binance
async function fetchBinanceTrades(apiKey: string, apiSecret: string): Promise<Trade[]> {
  const BINANCE_BASE = 'https://fapi.binance.com';
  const timestamp = Date.now();
  const qs = `timestamp=${timestamp}&limit=500`;
  const signature = createHmac('sha256', apiSecret).update(qs).digest('hex');

  const res = await fetch(`${BINANCE_BASE}/fapi/v1/userTrades?${qs}&signature=${signature}`, {
    headers: { 'X-MBX-APIKEY': apiKey },
  });
  if (!res.ok) throw new Error(`Binance API error: ${await res.text()}`);
  const data = await res.json();

  return data.map((t: any) => ({
    symbol: t.symbol,
    side: t.side as 'BUY' | 'SELL',
    price: parseFloat(t.price),
    qty: parseFloat(t.qty),
    realizedPnl: parseFloat(t.realizedPnl || '0'),
    commission: parseFloat(t.commission || '0'),
    time: t.time,
  }));
}

// Fetch real trades from OKX
async function fetchOKXTrades(apiKey: string, apiSecret: string, passphrase: string): Promise<Trade[]> {
  const path = '/api/v5/trade/fills-history?instType=SWAP&limit=100';
  const ts = new Date().toISOString();
  const sign = createHmac('sha256', apiSecret).update(ts + 'GET' + path).digest('base64');

  const res = await fetch(`https://www.okx.com${path}`, {
    headers: {
      'OK-ACCESS-KEY': apiKey, 'OK-ACCESS-SIGN': sign,
      'OK-ACCESS-TIMESTAMP': ts, 'OK-ACCESS-PASSPHRASE': passphrase,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`OKX API error: ${await res.text()}`);
  const data = await res.json();
  if (data.code !== '0') throw new Error(`OKX error: ${data.msg}`);

  return (data.data || []).map((t: any) => ({
    symbol: t.instId,
    side: t.side?.toUpperCase() as 'BUY' | 'SELL',
    price: parseFloat(t.fillPx),
    qty: parseFloat(t.fillSz),
    realizedPnl: parseFloat(t.pnl || '0'),
    commission: Math.abs(parseFloat(t.fee || '0')),
    time: parseInt(t.ts),
  }));
}

// Fetch real trades from Bybit
async function fetchBybitTrades(apiKey: string, apiSecret: string): Promise<Trade[]> {
  const ts = Date.now().toString();
  const recvWindow = '5000';
  const qs = 'category=linear&limit=100';
  const sign = createHmac('sha256', apiSecret).update(ts + apiKey + recvWindow + qs).digest('hex');

  const res = await fetch(`https://api.bybit.com/v5/execution/list?${qs}`, {
    headers: {
      'X-BAPI-API-KEY': apiKey, 'X-BAPI-SIGN': sign,
      'X-BAPI-TIMESTAMP': ts, 'X-BAPI-RECV-WINDOW': recvWindow,
    },
  });
  if (!res.ok) throw new Error(`Bybit API error: ${await res.text()}`);
  const data = await res.json();
  if (data.retCode !== 0) throw new Error(`Bybit error: ${data.retMsg}`);

  return (data.result?.list || []).map((t: any) => ({
    symbol: t.symbol,
    side: t.side?.toUpperCase() as 'BUY' | 'SELL',
    price: parseFloat(t.execPrice),
    qty: parseFloat(t.execQty),
    realizedPnl: parseFloat(t.closedPnl || '0'),
    commission: parseFloat(t.execFee || '0'),
    time: parseInt(t.execTime),
  }));
}

async function getExchangeCredentials(): Promise<{ exchange: string; apiKey: string; apiSecret: string; passphrase?: string } | null> {
  try {
    const cookieStore = await cookies();
    const encrypted = cookieStore.get('exchange-creds')?.value;
    if (!encrypted) return null;
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const mode = req.nextUrl.searchParams.get('mode') || 'auto';
    const session = await getSession();

    // If requesting saved reviews
    if (mode === 'list' && session?.email) {
      const reviews = await getReviews(session.email, 30);
      return NextResponse.json({ reviews }, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    // Get specific review by date
    const dateParam = req.nextUrl.searchParams.get('date');
    if (dateParam && session?.email) {
      const review = await getReviewByDate(session.email, dateParam);
      return NextResponse.json({ review }, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    // Try to fetch real trades from connected exchange
    const creds = await getExchangeCredentials();
    let trades: Trade[] = [];
    let source = 'none';

    if (creds) {
      try {
        switch (creds.exchange) {
          case 'binance':
            trades = await fetchBinanceTrades(creds.apiKey, creds.apiSecret);
            source = 'binance';
            break;
          case 'okx':
            trades = await fetchOKXTrades(creds.apiKey, creds.apiSecret, creds.passphrase || '');
            source = 'okx';
            break;
          case 'bybit':
            trades = await fetchBybitTrades(creds.apiKey, creds.apiSecret);
            source = 'bybit';
            break;
          case 'hyperliquid':
            // HL doesn't have a simple trade history API for read-only
            source = 'hyperliquid';
            break;
        }
      } catch (e: any) {
        console.error('Failed to fetch exchange trades:', e.message);
      }
    }

    if (trades.length === 0) {
      return NextResponse.json({
        connected: !!creds,
        source,
        noTrades: true,
        message: creds
          ? '已连接交易所但暂无近期交易记录。开始交易后即可使用AI复盘功能。'
          : '请先在 Elite 控制台连接交易所，即可获取真实交易数据进行AI复盘。',
      });
    }

    const groups = groupTrades(trades);
    const analysis = analyzePatterns(groups);

    return NextResponse.json({ ...analysis, connected: true, source }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — save a review
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { date, entries, mood, ai_diagnosis, score } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }

    const saved = await saveReviewDB({
      user_id: session.email,
      date,
      entries: entries || [],
      mood,
      ai_diagnosis,
      score,
    });

    if (!saved) {
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
