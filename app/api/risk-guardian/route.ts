import { NextRequest, NextResponse } from 'next/server';
import { fillTemplate, getRequestLocale, translateForLocale } from '@/lib/server-i18n';

// Risk Guardian — real-time portfolio risk scanner
// Checks: position concentration, leverage, correlation, drawdown, volatility exposure

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;      // notional USD
  leverage: number;
  unrealizedPnl: number;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number;
}

interface RiskAlert {
  level: 'info' | 'warning' | 'critical';
  categoryKey: 'status' | 'concentration' | 'leverage' | 'drawdown' | 'correlation' | 'liquidation';
  category: string;
  title: string;
  detail: string;
  action: string;
}

interface RiskScore {
  overall: number;        // 0-100, higher = safer
  concentration: number;  // single position % of portfolio
  leverage: number;       // weighted avg leverage risk
  drawdown: number;       // current drawdown severity
  correlation: number;    // correlated positions risk
  liquidation: number;    // proximity to liquidation
}

function assessRisk(positions: Position[], balance: number, locale: 'zh' | 'en'): { score: RiskScore; alerts: RiskAlert[] } {
  const tr = (key: string, fallback?: string) => translateForLocale(locale, key, fallback);
  const txt = (key: string, values: Record<string, string | number> = {}, fallback?: string) =>
    fillTemplate(tr(key, fallback), values);
  const alerts: RiskAlert[] = [];
  const totalNotional = positions.reduce((s, p) => s + p.size, 0);
  const totalPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);

  // 1. Concentration risk
  let concentrationScore = 100;
  for (const p of positions) {
    const pct = p.size / Math.max(totalNotional, 1);
    if (pct > 0.5) {
      concentrationScore = 20;
      alerts.push({ level: 'critical', categoryKey: 'concentration', category: tr('guardian.alertCategory.concentration'), title: txt('guardian.alert.concentration.critical.title', { symbol: p.symbol, percent: (pct * 100).toFixed(0) }), detail: tr('guardian.alert.concentration.critical.detail'), action: tr('guardian.alert.concentration.critical.action') });
    } else if (pct > 0.3) {
      concentrationScore = Math.min(concentrationScore, 50);
      alerts.push({ level: 'warning', categoryKey: 'concentration', category: tr('guardian.alertCategory.concentration'), title: txt('guardian.alert.concentration.warning.title', { symbol: p.symbol, percent: (pct * 100).toFixed(0) }), detail: tr('guardian.alert.concentration.warning.detail'), action: tr('guardian.alert.concentration.warning.action') });
    }
  }
  if (positions.length === 0) concentrationScore = 100;

  // 2. Leverage risk
  let leverageScore = 100;
  const weightedLev = positions.length ? positions.reduce((s, p) => s + p.leverage * (p.size / Math.max(totalNotional, 1)), 0) : 0;
  if (weightedLev > 20) {
    leverageScore = 10;
    alerts.push({ level: 'critical', categoryKey: 'leverage', category: tr('guardian.alertCategory.leverage'), title: txt('guardian.alert.leverage.critical.title', { leverage: weightedLev.toFixed(1) }), detail: tr('guardian.alert.leverage.critical.detail'), action: tr('guardian.alert.leverage.critical.action') });
  } else if (weightedLev > 10) {
    leverageScore = 40;
    alerts.push({ level: 'warning', categoryKey: 'leverage', category: tr('guardian.alertCategory.leverage'), title: txt('guardian.alert.leverage.warning.title', { leverage: weightedLev.toFixed(1) }), detail: tr('guardian.alert.leverage.warning.detail'), action: tr('guardian.alert.leverage.warning.action') });
  } else if (weightedLev > 5) {
    leverageScore = 70;
  }

  // 3. Drawdown risk
  let drawdownScore = 100;
  const drawdownPct = balance > 0 ? (totalPnl / balance) * 100 : 0;
  if (drawdownPct < -10) {
    drawdownScore = 15;
    alerts.push({ level: 'critical', categoryKey: 'drawdown', category: tr('guardian.alertCategory.drawdown'), title: txt('guardian.alert.drawdown.critical.title', { percent: drawdownPct.toFixed(1) }), detail: tr('guardian.alert.drawdown.critical.detail'), action: tr('guardian.alert.drawdown.critical.action') });
  } else if (drawdownPct < -5) {
    drawdownScore = 40;
    alerts.push({ level: 'warning', categoryKey: 'drawdown', category: tr('guardian.alertCategory.drawdown'), title: txt('guardian.alert.drawdown.warning.title', { percent: drawdownPct.toFixed(1) }), detail: tr('guardian.alert.drawdown.warning.detail'), action: tr('guardian.alert.drawdown.warning.action') });
  } else if (drawdownPct < -3) {
    drawdownScore = 65;
  }

  // 4. Correlation risk (simplified: BTC/ETH/SOL are correlated)
  let correlationScore = 100;
  const cryptoMajors = ['BTC', 'ETH', 'SOL', 'BNB'];
  const majorPositions = positions.filter(p => cryptoMajors.some(c => p.symbol.includes(c)));
  const sameSide = majorPositions.filter(p => p.side === majorPositions[0]?.side);
  if (sameSide.length >= 3) {
    correlationScore = 30;
    alerts.push({ level: 'warning', categoryKey: 'correlation', category: tr('guardian.alertCategory.correlation'), title: txt('guardian.alert.correlation.warning.title', { count: sameSide.length }), detail: tr('guardian.alert.correlation.warning.detail'), action: tr('guardian.alert.correlation.warning.action') });
  } else if (sameSide.length >= 2) {
    correlationScore = 60;
  }

  // 5. Liquidation proximity
  let liquidationScore = 100;
  for (const p of positions) {
    if (p.liquidationPrice <= 0) continue;
    const dist = Math.abs(p.markPrice - p.liquidationPrice) / p.markPrice * 100;
    if (dist < 3) {
      liquidationScore = 5;
      alerts.push({ level: 'critical', categoryKey: 'liquidation', category: tr('guardian.alertCategory.liquidation'), title: txt('guardian.alert.liquidation.critical.title', { symbol: p.symbol, percent: dist.toFixed(1) }), detail: txt('guardian.alert.liquidation.critical.detail', { markPrice: p.markPrice.toFixed(2), liquidationPrice: p.liquidationPrice.toFixed(2) }), action: tr('guardian.alert.liquidation.critical.action') });
    } else if (dist < 8) {
      liquidationScore = Math.min(liquidationScore, 35);
      alerts.push({ level: 'warning', categoryKey: 'liquidation', category: tr('guardian.alertCategory.liquidation'), title: txt('guardian.alert.liquidation.warning.title', { symbol: p.symbol, percent: dist.toFixed(1) }), detail: tr('guardian.alert.liquidation.warning.detail'), action: tr('guardian.alert.liquidation.warning.action') });
    } else if (dist < 15) {
      liquidationScore = Math.min(liquidationScore, 65);
    }
  }

  // Overall score (weighted)
  const overall = Math.round(
    concentrationScore * 0.2 +
    leverageScore * 0.25 +
    drawdownScore * 0.25 +
    correlationScore * 0.15 +
    liquidationScore * 0.15
  );

  // Add positive alerts
  if (alerts.length === 0 && positions.length > 0) {
    alerts.push({ level: 'info', categoryKey: 'status', category: tr('guardian.alertCategory.status'), title: tr('guardian.alert.status.healthy.title'), detail: tr('guardian.alert.status.healthy.detail'), action: tr('guardian.alert.status.healthy.action') });
  }
  if (positions.length === 0) {
    alerts.push({ level: 'info', categoryKey: 'status', category: tr('guardian.alertCategory.status'), title: tr('guardian.alert.status.flat.title'), detail: tr('guardian.alert.status.flat.detail'), action: tr('guardian.alert.status.flat.action') });
  }

  return {
    score: { overall, concentration: concentrationScore, leverage: leverageScore, drawdown: drawdownScore, correlation: correlationScore, liquidation: liquidationScore },
    alerts,
  };
}

function generateDemoPositions(): { positions: Position[]; balance: number } {
  return {
    balance: 5000,
    positions: [
      { symbol: 'BTCUSDT', side: 'LONG', size: 6700, leverage: 10, unrealizedPnl: -180, entryPrice: 67800, markPrice: 67530, liquidationPrice: 61200 },
      { symbol: 'ETHUSDT', side: 'LONG', size: 1960, leverage: 8, unrealizedPnl: 45, entryPrice: 1945, markPrice: 1963, liquidationPrice: 1710 },
      { symbol: 'SOLUSDT', side: 'SHORT', size: 1350, leverage: 15, unrealizedPnl: -65, entryPrice: 133, markPrice: 135.4, liquidationPrice: 142 },
    ],
  };
}

export async function GET(req: NextRequest) {
  try {
    const locale = getRequestLocale(req);
    const mode = req.nextUrl.searchParams.get('mode') || 'demo';

    let positions: Position[];
    let balance: number;

    if (mode === 'live') {
      // TODO: fetch from connected exchange
      const demo = generateDemoPositions();
      positions = demo.positions;
      balance = demo.balance;
    } else {
      const demo = generateDemoPositions();
      positions = demo.positions;
      balance = demo.balance;
    }

    const { score, alerts } = assessRisk(positions, balance, locale);

    return NextResponse.json({
      score,
      alerts,
      positions,
      balance,
      totalNotional: positions.reduce((s, p) => s + p.size, 0),
      totalPnl: positions.reduce((s, p) => s + p.unrealizedPnl, 0),
      timestamp: Date.now(),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
