import { NextResponse } from 'next/server';

const ITC_API_KEY = process.env.ITC_API_KEY || '';

// Market Health Check — aggregates multiple data sources into a single 0-100 score
// Dimensions: Fear & Greed, ITC Risk, Funding Rate, Price Momentum, Volatility

interface HealthDimension {
  name: string;
  nameZh: string;
  score: number;       // 0-100 (higher = more favorable for longs)
  signal: 'bullish' | 'bearish' | 'neutral';
  detail: string;
  weight: number;
}

export const revalidate = 300; // 5 min cache

export async function GET() {
  const dimensions: HealthDimension[] = [];
  
  try {
    // Parallel fetch all data sources
    const [fgRes, priceRes, itcRes, fundingRes] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=7&format=json').catch(() => null),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true').catch(() => null),
      ITC_API_KEY ? fetch(`https://app.intothecryptoverse.com/api/v2/risk-models/price-based/crypto?apikey=${ITC_API_KEY}`).catch(() => null) : null,
      fetch('https://fapi.binance.com/fapi/v1/fundingRate?symbol=BTCUSDT&limit=1').catch(() => null),
    ]);

    // 1. Fear & Greed (weight: 25%)
    // F&G < 20 = contrarian bullish, > 80 = contrarian bearish
    if (fgRes?.ok) {
      const fg = await fgRes.json();
      const val = parseInt(fg.data?.[0]?.value || '50');
      const prev = parseInt(fg.data?.[1]?.value || String(val));
      const trend = val > prev ? '↑' : val < prev ? '↓' : '→';
      
      // Contrarian: extreme fear = opportunity, extreme greed = danger
      let score: number;
      if (val <= 10) score = 90;       // extreme fear = huge opportunity
      else if (val <= 20) score = 80;
      else if (val <= 30) score = 70;
      else if (val <= 45) score = 60;
      else if (val <= 55) score = 50;  // neutral
      else if (val <= 70) score = 40;
      else if (val <= 80) score = 30;
      else if (val <= 90) score = 20;
      else score = 10;                 // extreme greed = danger
      
      dimensions.push({
        name: 'Fear & Greed',
        nameZh: '恐惧贪婪指数',
        score,
        signal: score >= 65 ? 'bullish' : score <= 35 ? 'bearish' : 'neutral',
        detail: `F&G = ${val} (${fg.data?.[0]?.value_classification}) ${trend} | 逆向指标：极端恐惧 = 机会`,
        weight: 0.25,
      });
    }

    // 2. ITC Risk (weight: 25%)
    // Risk < 0.3 = low risk (bullish), > 0.7 = high risk (bearish)
    if (itcRes?.ok) {
      const itc = await itcRes.json();
      const risk = itc.data?.current_risk ?? null;
      if (risk !== null) {
        const score = Math.round((1 - risk) * 100); // invert: low risk = high score
        dimensions.push({
          name: 'ITC Risk',
          nameZh: 'ITC 风险值',
          score,
          signal: risk < 0.35 ? 'bullish' : risk > 0.65 ? 'bearish' : 'neutral',
          detail: `Risk = ${risk.toFixed(3)} | <0.3 低风险区, >0.7 高风险区`,
          weight: 0.25,
        });
      }
    }

    // 3. Price Momentum (weight: 20%)
    // BTC 24h change: positive = bullish momentum
    if (priceRes?.ok) {
      const prices = await priceRes.json();
      const btcChange = prices.bitcoin?.usd_24h_change ?? 0;
      const ethChange = prices.ethereum?.usd_24h_change ?? 0;
      const btcPrice = prices.bitcoin?.usd ?? 0;
      const ethPrice = prices.ethereum?.usd ?? 0;
      
      // Score: -10% → 10, 0% → 50, +10% → 90
      const score = Math.min(95, Math.max(5, Math.round(50 + btcChange * 4)));
      
      dimensions.push({
        name: 'Price Momentum',
        nameZh: '价格动量',
        score,
        signal: btcChange > 2 ? 'bullish' : btcChange < -2 ? 'bearish' : 'neutral',
        detail: `BTC $${btcPrice.toLocaleString()} (${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(2)}%) | ETH $${ethPrice.toLocaleString()} (${ethChange >= 0 ? '+' : ''}${ethChange.toFixed(2)}%)`,
        weight: 0.20,
      });
    }

    // 4. Funding Rate (weight: 15%)
    // Positive = crowded long (bearish contrarian), negative = crowded short (bullish contrarian)
    if (fundingRes?.ok) {
      const funding = await fundingRes.json();
      const rate = parseFloat(funding[0]?.fundingRate || '0');
      const ratePct = rate * 100;
      
      // Contrarian: high positive = bearish, high negative = bullish
      let score: number;
      if (ratePct < -0.1) score = 85;       // heavy short = squeeze potential
      else if (ratePct < -0.01) score = 70;
      else if (ratePct < 0.01) score = 55;  // neutral-slight bullish
      else if (ratePct < 0.05) score = 45;
      else if (ratePct < 0.1) score = 30;
      else score = 15;                       // extreme long crowding
      
      dimensions.push({
        name: 'Funding Rate',
        nameZh: '资金费率',
        score,
        signal: ratePct < -0.01 ? 'bullish' : ratePct > 0.05 ? 'bearish' : 'neutral',
        detail: `BTC 费率 ${ratePct >= 0 ? '+' : ''}${ratePct.toFixed(4)}% | 负费率=空头付费=潜在轧空`,
        weight: 0.15,
      });
    }

    // 5. Volatility Regime (weight: 15%)
    // Use 24h vol / market cap as proxy. High vol = uncertainty
    if (priceRes?.ok) {
      // Re-parse (already consumed above, but prices cached)
      // Use BTC vol/mcap ratio as volatility proxy
      const priceData = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_vol=true&include_market_cap=true').then(r => r.json()).catch(() => null);
      if (priceData?.bitcoin) {
        const vol = priceData.bitcoin.usd_24h_vol || 0;
        const mcap = priceData.bitcoin.usd_market_cap || 1;
        const volRatio = (vol / mcap) * 100; // typically 1-5%
        
        // Lower vol = calmer = slightly bullish; extreme vol = danger
        let score: number;
        if (volRatio < 1.5) score = 70;       // calm
        else if (volRatio < 3) score = 55;     // normal
        else if (volRatio < 5) score = 40;     // elevated
        else score = 20;                        // extreme
        
        dimensions.push({
          name: 'Volatility',
          nameZh: '波动率',
          score,
          signal: volRatio < 2 ? 'bullish' : volRatio > 4 ? 'bearish' : 'neutral',
          detail: `24h 成交量/市值 = ${volRatio.toFixed(2)}% | 低波动=稳定，高波动=风险`,
          weight: 0.15,
        });
      }
    }

    // Calculate overall score
    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    const overallScore = totalWeight > 0 
      ? Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight)
      : 50;

    // Overall signal
    const overallSignal: 'bullish' | 'bearish' | 'neutral' = 
      overallScore >= 65 ? 'bullish' : overallScore <= 35 ? 'bearish' : 'neutral';

    // Traffic light
    const light: 'green' | 'yellow' | 'red' = 
      overallScore >= 60 ? 'green' : overallScore >= 40 ? 'yellow' : 'red';

    // Action suggestion
    const suggestion = light === 'green' 
      ? '市场条件有利，可以寻找入场机会。注意仓位管理。'
      : light === 'yellow'
      ? '市场信号混合，建议观望或轻仓试探。严格止损。'
      : '市场条件不利或极端恐慌（可能是反转机会）。谨慎操作，等待确认信号。';

    return NextResponse.json({
      score: overallScore,
      signal: overallSignal,
      light,
      suggestion,
      dimensions,
      timestamp: Date.now(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
