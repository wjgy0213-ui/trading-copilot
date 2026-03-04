import { NextRequest, NextResponse } from 'next/server';

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

function assessRisk(positions: Position[], balance: number): { score: RiskScore; alerts: RiskAlert[] } {
  const alerts: RiskAlert[] = [];
  const totalNotional = positions.reduce((s, p) => s + p.size, 0);
  const totalPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);

  // 1. Concentration risk
  let concentrationScore = 100;
  for (const p of positions) {
    const pct = p.size / Math.max(totalNotional, 1);
    if (pct > 0.5) {
      concentrationScore = 20;
      alerts.push({ level: 'critical', category: '集中度', title: `${p.symbol} 占仓位 ${(pct * 100).toFixed(0)}%`, detail: '单一标的超过50%，风险极高', action: '减仓至30%以下' });
    } else if (pct > 0.3) {
      concentrationScore = Math.min(concentrationScore, 50);
      alerts.push({ level: 'warning', category: '集中度', title: `${p.symbol} 占 ${(pct * 100).toFixed(0)}%`, detail: '建议分散', action: '考虑分散到其他标的' });
    }
  }
  if (positions.length === 0) concentrationScore = 100;

  // 2. Leverage risk
  let leverageScore = 100;
  const weightedLev = positions.length ? positions.reduce((s, p) => s + p.leverage * (p.size / Math.max(totalNotional, 1)), 0) : 0;
  if (weightedLev > 20) {
    leverageScore = 10;
    alerts.push({ level: 'critical', category: '杠杆', title: `加权杠杆 ${weightedLev.toFixed(1)}x`, detail: '极端杠杆，微小波动即爆仓', action: '立即降杠杆至10x以下' });
  } else if (weightedLev > 10) {
    leverageScore = 40;
    alerts.push({ level: 'warning', category: '杠杆', title: `加权杠杆 ${weightedLev.toFixed(1)}x`, detail: '高杠杆需要严格止损', action: '确保每笔都有止损' });
  } else if (weightedLev > 5) {
    leverageScore = 70;
  }

  // 3. Drawdown risk
  let drawdownScore = 100;
  const drawdownPct = balance > 0 ? (totalPnl / balance) * 100 : 0;
  if (drawdownPct < -10) {
    drawdownScore = 15;
    alerts.push({ level: 'critical', category: '回撤', title: `浮亏 ${drawdownPct.toFixed(1)}%`, detail: '超过10%回撤红线', action: '考虑减仓或全平，冷静后再入场' });
  } else if (drawdownPct < -5) {
    drawdownScore = 40;
    alerts.push({ level: 'warning', category: '回撤', title: `浮亏 ${drawdownPct.toFixed(1)}%`, detail: '接近回撤警戒线', action: '收紧止损，不加仓' });
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
    alerts.push({ level: 'warning', category: '相关性', title: `${sameSide.length}个高相关标的同方向`, detail: 'BTC/ETH/SOL高度相关，同向持仓=放大风险', action: '考虑对冲或减少同向持仓' });
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
      alerts.push({ level: 'critical', category: '爆仓', title: `${p.symbol} 距爆仓仅 ${dist.toFixed(1)}%`, detail: `当前价 $${p.markPrice.toFixed(2)}，爆仓价 $${p.liquidationPrice.toFixed(2)}`, action: '立即加保证金或减仓' });
    } else if (dist < 8) {
      liquidationScore = Math.min(liquidationScore, 35);
      alerts.push({ level: 'warning', category: '爆仓', title: `${p.symbol} 距爆仓 ${dist.toFixed(1)}%`, detail: '安全边际不足', action: '考虑减仓位' });
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
    alerts.push({ level: 'info', category: '状态', title: '风控健康', detail: '所有指标在安全范围内', action: '继续保持纪律' });
  }
  if (positions.length === 0) {
    alerts.push({ level: 'info', category: '状态', title: '空仓状态', detail: '无持仓风险', action: '等待高质量入场信号' });
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

    const { score, alerts } = assessRisk(positions, balance);

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
