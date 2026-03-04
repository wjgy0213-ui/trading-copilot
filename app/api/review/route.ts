import { NextRequest, NextResponse } from 'next/server';

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

// Demo mode — generate sample trades for non-connected users
function generateDemoTrades(): Trade[] {
  const now = Date.now();
  const trades: Trade[] = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

  for (let i = 0; i < 40; i++) {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const basePrice = sym === 'BTCUSDT' ? 67000 : sym === 'ETHUSDT' ? 1960 : 135;
    const isWin = Math.random() > 0.45;
    const entry = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    const exit = isWin ? entry * (1 + Math.random() * 0.015) : entry * (1 - Math.random() * 0.01);
    const qty = sym === 'BTCUSDT' ? 0.01 : sym === 'ETHUSDT' ? 0.1 : 5;
    const time = now - (40 - i) * 3600000 * (1 + Math.random());

    trades.push({ symbol: sym, side: 'BUY', price: entry, qty, realizedPnl: 0, commission: entry * qty * 0.0004, time });
    trades.push({ symbol: sym, side: 'SELL', price: exit, qty, realizedPnl: (exit - entry) * qty, commission: exit * qty * 0.0004, time: time + (5 + Math.random() * 60) * 60000 });
  }

  return trades;
}

export async function GET(req: NextRequest) {
  try {
    const mode = req.nextUrl.searchParams.get('mode') || 'demo';

    let trades: Trade[];

    if (mode === 'live') {
      // TODO: fetch from connected exchange via /api/exchange
      // For now, return demo
      trades = generateDemoTrades();
    } else {
      trades = generateDemoTrades();
    }

    const groups = groupTrades(trades);
    const analysis = analyzePatterns(groups);

    return NextResponse.json(analysis, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
