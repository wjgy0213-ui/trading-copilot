export interface HyperliquidCredentials {
  apiKey: string; // wallet address
  apiSecret: string; // not used for read-only, but kept for API consistency
}

const HL_BASE = 'https://api.hyperliquid.xyz';

export async function getHyperliquidBalance(creds: HyperliquidCredentials): Promise<number> {
  const res = await fetch(`${HL_BASE}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'clearinghouseState', user: creds.apiKey }),
  });
  if (!res.ok) throw new Error(`Hyperliquid API error: ${await res.text()}`);
  const data = await res.json();
  // Also check spot
  const spotRes = await fetch(`${HL_BASE}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'spotClearinghouseState', user: creds.apiKey }),
  });
  const spotData = spotRes.ok ? await spotRes.json() : null;
  const perpValue = parseFloat(data.marginSummary?.accountValue || '0');
  const spotValue = spotData?.balances?.reduce((s: number, b: any) => s + parseFloat(b.total || '0') * (b.coin === 'USDC' ? 1 : 0), 0) || 0;
  return perpValue + spotValue;
}

export async function getHyperliquidPositions(creds: HyperliquidCredentials) {
  const res = await fetch(`${HL_BASE}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'clearinghouseState', user: creds.apiKey }),
  });
  if (!res.ok) throw new Error(`Hyperliquid API error: ${await res.text()}`);
  const data = await res.json();
  return (data.assetPositions || [])
    .filter((p: any) => parseFloat(p.position?.szi || '0') !== 0)
    .map((p: any) => ({
      symbol: p.position.coin,
      side: parseFloat(p.position.szi) > 0 ? 'LONG' : 'SHORT',
      positionAmt: p.position.szi,
      entryPrice: p.position.entryPx,
      markPrice: p.position.positionValue ? (parseFloat(p.position.positionValue) / Math.abs(parseFloat(p.position.szi))).toString() : '0',
      unRealizedProfit: p.position.unrealizedPnl,
      leverage: p.position.leverage?.value || '1',
      liquidationPrice: p.position.liquidationPx || '0',
    }));
}
