import { NextResponse } from 'next/server';

// BTC On-Chain Metrics — free data sources
// Supplements ITC price-based risk with on-chain indicators

const BLOCKCHAIN_API = 'https://api.blockchain.info/charts';

interface OnChainMetric {
  id: string;
  name: string;
  nameEn: string;
  value: number;
  risk: number; // 0-1 normalized risk
  description: string;
  category: 'price' | 'on-chain' | 'weightless';
}

async function fetchBlockchainChart(chart: string, timespan = '2days', rollingAverage?: string): Promise<number | null> {
  try {
    let url = `${BLOCKCHAIN_API}/${chart}?timespan=${timespan}&format=json`;
    if (rollingAverage) url += `&rollingAverage=${rollingAverage}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.values?.[data.values.length - 1]?.y ?? null;
  } catch { return null; }
}

// Puell Multiple = Daily Miner Revenue / 365-day MA of Daily Miner Revenue
async function calcPuellMultiple(): Promise<{ value: number; risk: number } | null> {
  const [daily, ma365] = await Promise.all([
    fetchBlockchainChart('miners-revenue', '2days'),
    fetchBlockchainChart('miners-revenue', '2days', '365days'),
  ]);
  if (!daily || !ma365 || ma365 === 0) return null;
  const puell = daily / ma365;
  // Risk normalization: Puell < 0.5 = low risk (buying zone), > 4 = high risk (selling zone)
  // ITC maps: 0.326 at current
  const risk = Math.min(1, Math.max(0, (puell - 0.3) / 3.7));
  return { value: puell, risk };
}

// Running ROI = (Current Price / Price 365 days ago) - 1
async function calcRunningROI(btcPrice: number): Promise<{ value: number; risk: number } | null> {
  try {
    const res = await fetch(`${BLOCKCHAIN_API}/market-price?timespan=370days&format=json&rollingAverage=1days`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const values = data.values || [];
    if (values.length < 365) return null;
    const price365ago = values[0].y;
    if (!price365ago) return null;
    const roi = (btcPrice / price365ago) - 1;
    // Risk: ROI > 3x (200%) = high risk, < 0 = low risk
    const risk = Math.min(1, Math.max(0, roi / 3));
    return { value: roi, risk };
  } catch { return null; }
}

// Logarithmic Regression Risk
// BTC log regression: log(price) = a * log(days_since_genesis) + b
// Genesis: 2009-01-03
function calcLogRegressionRisk(btcPrice: number): { value: number; risk: number } {
  const genesis = new Date('2009-01-03').getTime();
  const daysSinceGenesis = (Date.now() - genesis) / 86400000;
  // Regression coefficients (fitted to BTC historical data)
  const a = 5.84;
  const b = -17.01;
  const logFairValue = a * Math.log(daysSinceGenesis) + b;
  const fairValue = Math.exp(logFairValue);
  const ratio = btcPrice / fairValue;
  // ratio < 0.5 = extremely undervalued, > 3 = extremely overvalued
  const risk = Math.min(1, Math.max(0, (ratio - 0.3) / 2.7));
  return { value: ratio, risk };
}

// Cowen Corridor — price position within log growth channel
function calcCowenCorridor(btcPrice: number): { value: number; risk: number } {
  const genesis = new Date('2009-01-03').getTime();
  const daysSinceGenesis = (Date.now() - genesis) / 86400000;
  // Lower band (support) and upper band (resistance) of log corridor
  const logLower = 4.5 * Math.log(daysSinceGenesis) - 15.5;
  const logUpper = 6.2 * Math.log(daysSinceGenesis) - 16.5;
  const lower = Math.exp(logLower);
  const upper = Math.exp(logUpper);
  const logPrice = Math.log(btcPrice);
  // Position within corridor: 0 = at lower band, 1 = at upper band
  const position = (logPrice - logLower) / (logUpper - logLower);
  const risk = Math.min(1, Math.max(0, position));
  return { value: position, risk };
}

// Market Cap to Thermocap approximation
// Thermocap ≈ cumulative miner revenue (we approximate with current difficulty × blocks)
async function calcMCTC(btcPrice: number): Promise<{ value: number; risk: number } | null> {
  try {
    const [marketCap, totalMinerRevenue] = await Promise.all([
      fetchBlockchainChart('market-cap', '1days'),
      fetchBlockchainChart('miners-revenue', '1days', '1095days'), // 3yr avg as proxy
    ]);
    if (!marketCap || !totalMinerRevenue) return null;
    // Approximate thermocap as cumulative revenue (use 3yr MA × ~5500 days ≈ rough proxy)
    const approxThermocap = totalMinerRevenue * 5500;
    const ratio = marketCap / approxThermocap;
    const risk = Math.min(1, Math.max(0, (ratio - 2) / 18)); // typical range 2-20
    return { value: ratio, risk };
  } catch { return null; }
}

export async function GET() {
  try {
    // Get BTC price first
    let btcPrice = 0;
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', { next: { revalidate: 60 } });
      const data = await res.json();
      btcPrice = data.bitcoin?.usd || 0;
    } catch {
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await res.json();
        btcPrice = parseFloat(data.price || '0');
      } catch {}
    }

    if (!btcPrice) {
      return NextResponse.json({ error: 'Cannot fetch BTC price' }, { status: 500 });
    }

    // Fetch all metrics in parallel
    const [puell, runningROI, mctc] = await Promise.all([
      calcPuellMultiple(),
      calcRunningROI(btcPrice),
      calcMCTC(btcPrice),
    ]);

    const logRegression = calcLogRegressionRisk(btcPrice);
    const cowenCorridor = calcCowenCorridor(btcPrice);

    const metrics: OnChainMetric[] = [];

    if (puell) {
      metrics.push({
        id: 'puell-multiple', name: 'Puell Multiple', nameEn: 'Puell Multiple',
        value: parseFloat(puell.value.toFixed(3)), risk: parseFloat(puell.risk.toFixed(3)),
        description: `矿工收入/365日均值 = ${puell.value.toFixed(2)}。低于0.5为历史买入区，高于4为卖出区。`,
        category: 'on-chain',
      });
    }

    metrics.push({
      id: 'log-regression', name: 'Logarithmic Regression', nameEn: 'Log Regression',
      value: parseFloat(logRegression.value.toFixed(3)), risk: parseFloat(logRegression.risk.toFixed(3)),
      description: `当前价格/对数回归公允价值 = ${logRegression.value.toFixed(2)}x。>1为高于均衡，<1为低于。`,
      category: 'price',
    });

    metrics.push({
      id: 'cowen-corridor', name: 'Cowen Corridor', nameEn: 'Cowen Corridor',
      value: parseFloat(cowenCorridor.value.toFixed(3)), risk: parseFloat(cowenCorridor.risk.toFixed(3)),
      description: `对数增长通道内位置 ${(cowenCorridor.value * 100).toFixed(0)}%。接近上轨=过热，接近下轨=超跌。`,
      category: 'price',
    });

    if (runningROI) {
      metrics.push({
        id: 'running-roi', name: 'Running ROI', nameEn: 'Running ROI (365d)',
        value: parseFloat(runningROI.value.toFixed(3)), risk: parseFloat(runningROI.risk.toFixed(3)),
        description: `BTC 365天回报率 ${(runningROI.value * 100).toFixed(1)}%。高回报=均值回归风险增加。`,
        category: 'weightless',
      });
    }

    if (mctc) {
      metrics.push({
        id: 'mctc-ratio', name: 'MarketCap/ThermoCap (近似)', nameEn: 'MCTC Ratio (approx)',
        value: parseFloat(mctc.value.toFixed(3)), risk: parseFloat(mctc.risk.toFixed(3)),
        description: `市值/热值比 ≈ ${mctc.value.toFixed(1)}。衡量市场溢价相对矿工投入。`,
        category: 'on-chain',
      });
    }

    return NextResponse.json({
      btcPrice,
      metrics,
      timestamp: Date.now(),
      note: 'MVRV/RHODL/Transaction Fees 需要 Realized Cap 数据，暂用免费数据源近似。',
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
