import { NextResponse } from 'next/server';

export const revalidate = 60; // 1 min cache

interface Position {
  coin: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  size: number;         // notional USD
  unrealizedPnl: number;
  leverage: string;
  sizeRaw: number;      // raw token amount
}

interface Whale {
  address: string;
  label: string;
  accountValue: number;
  dayPnl: number;
  weekPnl: number;
  monthPnl: number;
  positions: Position[];
  totalNotional: number;
  longExposure: number;
  shortExposure: number;
}

// Top active HL traders (curated from leaderboard)
const WHALE_LIST = [
  { address: '0x162cc7c861ebd0c06b3d72319201150482518185', label: 'Whale Alpha' },
  { address: '0xecb63caa47c7c4e77f60f1ce858cf28dc2b82b00', label: 'Mega Whale' },
  { address: '0xfc667adba8d4837586078f4fdcdc29804337ca06', label: 'PAXG Whale' },
  { address: '0x010461c14e146ac35fe42271bdc1134ee31c703a', label: 'HLP Sub-1' },
  { address: '0x31ca8395cf837de08b24da3f660e77761dfb974b', label: 'HLP Sub-2' },
  { address: '0xff4cd3826ecee12acd4329aada4a2d3419fc463c', label: 'SOL Trader' },
  { address: '0xe45e4fc1dbd8ab1c554c8a2bd7fa752d1e53bb35', label: 'Veteran' },
  { address: '0x156115e100141e9330620c253225cc5ee598a31a', label: 'Big Player' },
  { address: '0xfbad3f9bafd0b924c1649c068fe1d6873319dfb1', label: 'Steady Eddie' },
  { address: '0x8196e0648cb16e9151c2920618a58605706b5836', label: 'OG Vault' },
];

async function getWhaleData(addr: string, label: string): Promise<Whale | null> {
  try {
    // Get positions
    const posRes = await fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'clearinghouseState', user: addr }),
    });
    if (!posRes.ok) return null;
    const posData = await posRes.json();

    const accountValue = parseFloat(posData.marginSummary?.accountValue || '0');
    if (accountValue <= 0) return null;

    const positions: Position[] = [];
    let longExposure = 0;
    let shortExposure = 0;

    for (const p of posData.assetPositions || []) {
      const pos = p.position;
      const szi = parseFloat(pos?.szi || '0');
      if (szi === 0) continue;
      
      const entryPrice = parseFloat(pos?.entryPx || '0');
      const notional = Math.abs(szi) * entryPrice;
      
      // Filter out dust positions (< $100)
      if (notional < 100) continue;
      
      const side = szi > 0 ? 'LONG' : 'SHORT';
      if (side === 'LONG') longExposure += notional;
      else shortExposure += notional;

      positions.push({
        coin: pos.coin,
        side: side as 'LONG' | 'SHORT',
        entryPrice,
        size: notional,
        unrealizedPnl: parseFloat(pos?.unrealizedPnl || '0'),
        leverage: pos?.leverage?.value || '?',
        sizeRaw: Math.abs(szi),
      });
    }

    // Sort by notional size
    positions.sort((a, b) => b.size - a.size);

    return {
      address: addr,
      label,
      accountValue,
      dayPnl: 0, // Will be populated from leaderboard
      weekPnl: 0,
      monthPnl: 0,
      positions: positions.slice(0, 20), // Top 20 positions
      totalNotional: longExposure + shortExposure,
      longExposure,
      shortExposure,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Fetch leaderboard for PnL data
    let leaderboardMap: Record<string, { day: number; week: number; month: number }> = {};
    try {
      const lbRes = await fetch('https://stats-data.hyperliquid.xyz/Mainnet/leaderboard');
      if (lbRes.ok) {
        const lb = await lbRes.json();
        for (const row of lb.leaderboardRows || []) {
          const perfs: Record<string, number> = {};
          for (const [window, data] of (row.windowPerformances || [])) {
            perfs[window] = parseFloat((data as any).pnl || '0');
          }
          leaderboardMap[row.ethAddress.toLowerCase()] = {
            day: perfs['day'] || 0,
            week: perfs['week'] || 0,
            month: perfs['month'] || 0,
          };
        }
      }
    } catch {}

    // Fetch whale data in parallel
    const results = await Promise.allSettled(
      WHALE_LIST.map(w => getWhaleData(w.address, w.label))
    );

    const whales: Whale[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        const whale = r.value;
        const lb = leaderboardMap[whale.address.toLowerCase()];
        if (lb) {
          whale.dayPnl = lb.day;
          whale.weekPnl = lb.week;
          whale.monthPnl = lb.month;
        }
        whales.push(whale);
      }
    }

    // Sort by account value
    whales.sort((a, b) => b.accountValue - a.accountValue);

    // Aggregate stats
    const totalLong = whales.reduce((s, w) => s + w.longExposure, 0);
    const totalShort = whales.reduce((s, w) => s + w.shortExposure, 0);
    
    // Count consensus positions (what are most whales doing with BTC/ETH/SOL)
    const consensus: Record<string, { long: number; short: number; totalSize: number }> = {};
    for (const w of whales) {
      for (const p of w.positions) {
        if (!consensus[p.coin]) consensus[p.coin] = { long: 0, short: 0, totalSize: 0 };
        if (p.side === 'LONG') consensus[p.coin].long++;
        else consensus[p.coin].short++;
        consensus[p.coin].totalSize += p.size;
      }
    }

    // Top coins by whale interest
    const topCoins = Object.entries(consensus)
      .sort(([,a], [,b]) => b.totalSize - a.totalSize)
      .slice(0, 15)
      .map(([coin, data]) => ({
        coin,
        longCount: data.long,
        shortCount: data.short,
        totalSize: data.totalSize,
        bias: data.long > data.short ? 'LONG' : data.short > data.long ? 'SHORT' : 'MIXED',
      }));

    return NextResponse.json({
      whales,
      summary: {
        totalWhales: whales.length,
        totalLongExposure: totalLong,
        totalShortExposure: totalShort,
        longShortRatio: totalShort > 0 ? totalLong / totalShort : 0,
        topCoins,
      },
      timestamp: Date.now(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
