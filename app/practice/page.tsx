'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface Position {
  id: string;
  coin: string;
  side: 'long' | 'short';
  entryPrice: number;
  size: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: string;
}

interface Trade {
  coin: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPct: number;
  reason: string;
  entryTime: string;
  exitTime: string;
  aiScore?: number;
  aiAdvice?: string;
}

interface Stats {
  totalTrades: number;
  wins: number;
  losses: number;
  bestTrade: number;
  worstTrade: number;
  maxDrawdown: number;
}

const COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
const COIN_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin', XRP: 'ripple'
};

const TIERS = {
  bronze:   { balance: 10000,  label: '🥉 Bronze', color: 'from-orange-600 to-orange-800', next: 'silver', reqKey: 'practice.tier_bronze_req' },
  silver:   { balance: 50000,  label: '🥈 Silver', color: 'from-gray-400 to-gray-600', next: 'gold', reqKey: 'practice.tier_silver_req' },
  gold:     { balance: 100000, label: '🥇 Gold', color: 'from-yellow-500 to-yellow-700', next: 'platinum', reqKey: 'practice.tier_gold_req' },
  platinum: { balance: 500000, label: '💎 Platinum', color: 'from-purple-500 to-purple-700', next: null, reqKey: 'practice.tier_platinum_req' },
};

function formatUsd(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function PracticePage() {
  const { t } = useI18n();
  const [prices, setPrices] = useState<Record<string, { usd: number; usd_24h_change: number }>>({});
  const [tier, setTier] = useState<keyof typeof TIERS>('bronze');
  const [balance, setBalance] = useState(10000);
  const [startBalance] = useState(10000);
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<Trade[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTrades: 0, wins: 0, losses: 0, bestTrade: 0, worstTrade: 0, maxDrawdown: 0 });
  
  // Order form
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [orderSide, setOrderSide] = useState<'long' | 'short'>('long');
  const [orderSize, setOrderSize] = useState('500');
  const [orderLeverage, setOrderLeverage] = useState('5');
  const [orderSL, setOrderSL] = useState('');
  const [orderTP, setOrderTP] = useState('');
  const [lastGrade, setLastGrade] = useState<{ score: number; advice: string } | null>(null);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('practice_state');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setTier(s.tier || 'bronze');
        setBalance(s.balance || 10000);
        setPositions(s.positions || []);
        setHistory(s.history || []);
        setStats(s.stats || stats);
      } catch {}
    }
  }, []);

  // Save state
  const saveState = useCallback(() => {
    localStorage.setItem('practice_state', JSON.stringify({ tier, balance, positions, history, stats }));
  }, [tier, balance, positions, history, stats]);

  useEffect(() => { saveState(); }, [saveState]);

  // Fetch prices
  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/practice?action=prices');
      if (res.ok) setPrices(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchPrices();
    const iv = setInterval(fetchPrices, 10000);
    return () => clearInterval(iv);
  }, [fetchPrices]);

  const currentPrice = (coin: string) => prices[COIN_IDS[coin]]?.usd || 0;

  // Open position
  const openPosition = () => {
    const price = currentPrice(selectedCoin);
    if (!price) return;
    const size = parseFloat(orderSize);
    const lev = parseFloat(orderLeverage);
    if (isNaN(size) || size <= 0 || size > balance) return;
    if (isNaN(lev) || lev < 1 || lev > 50) return;

    const margin = size / lev;
    if (margin > balance) return;

    const pos: Position = {
      id: Date.now().toString(),
      coin: selectedCoin,
      side: orderSide,
      entryPrice: price,
      size,
      leverage: lev,
      stopLoss: orderSL ? parseFloat(orderSL) : undefined,
      takeProfit: orderTP ? parseFloat(orderTP) : undefined,
      entryTime: new Date().toISOString(),
    };

    setBalance(prev => prev - margin);
    setPositions(prev => [...prev, pos]);
    setLastGrade(null);
  };

  // Close position
  const closePosition = async (posId: string, reason: string = 'manual') => {
    const pos = positions.find(p => p.id === posId);
    if (!pos) return;
    const exitPrice = currentPrice(pos.coin);
    if (!exitPrice) return;

    const pnlMultiplier = pos.side === 'long' 
      ? (exitPrice - pos.entryPrice) / pos.entryPrice
      : (pos.entryPrice - exitPrice) / pos.entryPrice;
    const pnl = pos.size * pnlMultiplier * pos.leverage;
    const pnlPct = pnlMultiplier * pos.leverage * 100;
    const margin = pos.size / pos.leverage;

    const trade: Trade = {
      coin: pos.coin,
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice,
      size: pos.size,
      leverage: pos.leverage,
      pnl,
      pnlPct,
      reason,
      entryTime: pos.entryTime,
      exitTime: new Date().toISOString(),
    };

    // Get AI grade
    try {
      const gradeRes = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grade', trade }),
      });
      if (gradeRes.ok) {
        const grade = await gradeRes.json();
        trade.aiScore = grade.score;
        trade.aiAdvice = grade.advice;
        setLastGrade(grade);
      }
    } catch {}

    // Update state
    setBalance(prev => prev + margin + pnl);
    setPositions(prev => prev.filter(p => p.id !== posId));
    setHistory(prev => [trade, ...prev].slice(0, 100));
    setStats(prev => ({
      totalTrades: prev.totalTrades + 1,
      wins: pnl > 0 ? prev.wins + 1 : prev.wins,
      losses: pnl <= 0 ? prev.losses + 1 : prev.losses,
      bestTrade: Math.max(prev.bestTrade, pnlPct),
      worstTrade: Math.min(prev.worstTrade, pnlPct),
      maxDrawdown: Math.min(prev.maxDrawdown, ((balance + margin + pnl) / startBalance - 1) * 100),
    }));
  };

  // Check SL/TP
  useEffect(() => {
    for (const pos of positions) {
      const price = currentPrice(pos.coin);
      if (!price) continue;
      
      if (pos.stopLoss) {
        if (pos.side === 'long' && price <= pos.stopLoss) closePosition(pos.id, 'stop_loss');
        if (pos.side === 'short' && price >= pos.stopLoss) closePosition(pos.id, 'stop_loss');
      }
      if (pos.takeProfit) {
        if (pos.side === 'long' && price >= pos.takeProfit) closePosition(pos.id, 'take_profit');
        if (pos.side === 'short' && price <= pos.takeProfit) closePosition(pos.id, 'take_profit');
      }
    }
  }, [prices]);

  const winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades * 100) : 0;
  const totalPnl = ((balance - startBalance) / startBalance) * 100;
  const tierInfo = TIERS[tier];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🎮</span>
              <span className={`bg-gradient-to-r ${tierInfo.color} bg-clip-text text-transparent`}>
                {t('practice.title')} {tierInfo.label}
              </span>
            </h1>
            <p className="text-gray-500 text-sm">{t('practice.subtitle')}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatUsd(balance)}</div>
            <div className={`text-sm ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 text-center">
            <div className="text-gray-400 text-xs">{t('practice.stats_trades')}</div>
            <div className="text-lg font-bold">{stats.totalTrades}</div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 text-center">
            <div className="text-gray-400 text-xs">{t('practice.stats_winrate')}</div>
            <div className={`text-lg font-bold ${winRate >= 50 ? 'text-green-400' : winRate > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {winRate.toFixed(0)}%
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 text-center">
            <div className="text-gray-400 text-xs">{t('practice.stats_best')}</div>
            <div className="text-lg font-bold text-green-400">
              {stats.bestTrade > 0 ? `+${stats.bestTrade.toFixed(1)}%` : '-'}
            </div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 text-center">
            <div className="text-gray-400 text-xs">{t('practice.stats_drawdown')}</div>
            <div className="text-lg font-bold text-red-400">
              {stats.maxDrawdown < 0 ? `${stats.maxDrawdown.toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        {tierInfo.next && (
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30 mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{tierInfo.label}</span>
              <span>{t('practice.next_tier')}: {TIERS[tierInfo.next as keyof typeof TIERS].label}</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full transition-all" 
                style={{ width: `${Math.min(100, Math.max(0, totalPnl / 20 * 100))}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">{t('practice.unlock_req')}: {t(tierInfo.reqKey)}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Order Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
              <h3 className="font-semibold mb-3">📝 {t('practice.order')}</h3>

              {/* Coin selector */}
              <div className="flex gap-1 mb-3">
                {COINS.map(c => (
                  <button key={c} onClick={() => setSelectedCoin(c)}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                      selectedCoin === c ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>

              {/* Price display */}
              <div className="text-center mb-3">
                <span className="text-gray-400 text-xs">{t('practice.current_price')}</span>
                <div className="text-xl font-bold">{currentPrice(selectedCoin) ? formatUsd(currentPrice(selectedCoin)) : t('practice.loading')}</div>
              </div>

              {/* Side */}
              <div className="flex gap-2 mb-3">
                <button onClick={() => setOrderSide('long')}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    orderSide === 'long' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>🟢 {t('practice.long')}</button>
                <button onClick={() => setOrderSide('short')}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    orderSide === 'short' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>🔴 {t('practice.short')}</button>
              </div>

              {/* Size */}
              <div className="mb-2">
                <label className="text-xs text-gray-400">{t('practice.size')}</label>
                <input type="number" value={orderSize} onChange={e => setOrderSize(e.target.value)}
                  className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white mt-1" placeholder="500" />
                <div className="flex gap-1 mt-1">
                  {[100, 500, 1000, 2000].map(v => (
                    <button key={v} onClick={() => setOrderSize(String(v))}
                      className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-400">${v}</button>
                  ))}
                </div>
              </div>

              {/* Leverage */}
              <div className="mb-2">
                <label className="text-xs text-gray-400">{t('practice.leverage')} {orderLeverage}x</label>
                <input type="range" min="1" max="20" value={orderLeverage} onChange={e => setOrderLeverage(e.target.value)}
                  className="w-full mt-1" />
              </div>

              {/* SL/TP */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-400">{t('practice.stop_loss')}</label>
                  <input type="number" value={orderSL} onChange={e => setOrderSL(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white mt-1 text-sm" placeholder={t('practice.optional')} />
                </div>
                <div>
                  <label className="text-xs text-gray-400">{t('practice.take_profit')}</label>
                  <input type="number" value={orderTP} onChange={e => setOrderTP(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white mt-1 text-sm" placeholder={t('practice.optional')} />
                </div>
              </div>

              {/* Margin preview */}
              <div className="text-xs text-gray-400 mb-3">
                {t('practice.margin_req')}: {formatUsd(parseFloat(orderSize || '0') / parseFloat(orderLeverage || '1'))}
              </div>

              <button onClick={openPosition} disabled={!currentPrice(selectedCoin)}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-colors ${
                  orderSide === 'long' 
                    ? 'bg-green-600 hover:bg-green-500 text-white' 
                    : 'bg-red-600 hover:bg-red-500 text-white'
                } disabled:opacity-30`}>
                {orderSide === 'long' ? `🟢 ${t('practice.open_long')}` : `🔴 ${t('practice.open_short')}`} {selectedCoin}
              </button>
            </div>

            {/* AI Grade */}
            {lastGrade && (
              <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 mt-3">
                <h3 className="font-semibold mb-2">🤖 {t('practice.ai_score')}</h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`text-3xl font-bold ${
                    lastGrade.score >= 70 ? 'text-green-400' : lastGrade.score >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{lastGrade.score}</div>
                  <div className="text-sm text-gray-400">/100</div>
                </div>
                <p className="text-xs text-gray-300">{lastGrade.advice}</p>
              </div>
            )}
          </div>

          {/* Right: Positions & History */}
          <div className="lg:col-span-2 space-y-4">
            {/* Active Positions */}
            <div>
              <h3 className="font-semibold mb-2">📊 {t('practice.positions')} ({positions.length})</h3>
              {positions.length === 0 ? (
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/30 text-center text-gray-500">
                  <p className="text-2xl mb-2">🎯</p>
                  <p>{t('practice.no_positions')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {positions.map(pos => {
                    const price = currentPrice(pos.coin);
                    const pnlMult = pos.side === 'long'
                      ? (price - pos.entryPrice) / pos.entryPrice
                      : (pos.entryPrice - price) / pos.entryPrice;
                    const pnl = pos.size * pnlMult * pos.leverage;
                    const pnlPct = pnlMult * pos.leverage * 100;

                    return (
                      <div key={pos.id} className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              pos.side === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>{pos.side === 'long' ? 'LONG' : 'SHORT'}</span>
                            <span className="font-bold">{pos.coin}</span>
                            <span className="text-xs text-gray-500">{pos.leverage}x</span>
                          </div>
                          <span className={`font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl >= 0 ? '+' : ''}{formatUsd(pnl)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{t('practice.entry')} {formatUsd(pos.entryPrice)} · {t('practice.position_size')} {formatUsd(pos.size)}</span>
                          <button onClick={() => closePosition(pos.id, 'manual')}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                            {t('practice.close')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trade History */}
            <div>
              <h3 className="font-semibold mb-2">📜 {t('practice.history')} ({history.length})</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-4">{t('practice.no_history')}</div>
                ) : (
                  history.map((t, i) => (
                    <div key={i} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {t.pnl >= 0 ? '🟢' : '🔴'}
                          </span>
                          <span className="font-medium text-sm">{t.coin} {t.side.toUpperCase()}</span>
                          <span className="text-xs text-gray-500">{t.leverage}x</span>
                          {t.aiScore !== undefined && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              t.aiScore >= 70 ? 'bg-green-500/20 text-green-400' :
                              t.aiScore >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>AI: {t.aiScore}</span>
                          )}
                        </div>
                        <span className={`font-medium text-sm ${t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {t.pnl >= 0 ? '+' : ''}{formatUsd(t.pnl)}
                        </span>
                      </div>
                      {t.aiAdvice && <p className="text-xs text-gray-400 mt-1">💡 {t.aiAdvice}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next Step CTA */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-gray-900 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">{t('practice.afterLabel')}</div>
            <h3 className="mt-2 text-lg font-semibold text-white">{t('practice.ctaTitle')}</h3>
            <p className="mt-2 text-sm text-gray-400">{t('practice.ctaDesc')}</p>
            <Link href="/strategy" className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400">
              {t('practice.ctaButton')}
            </Link>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-gray-900 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">{t('practice.proLabel')}</div>
            <h3 className="mt-2 text-lg font-semibold text-white">{t('practice.proTitle')}</h3>
            <p className="mt-2 text-sm text-gray-400">{t('practice.proDesc')}</p>
            <Link href="/pricing" className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400">
              {t('practice.proButton')}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600 space-y-1">
          <p>{t('practice.footer1')}</p>
          <p>{t('practice.footer2')}</p>
          <button onClick={() => { localStorage.removeItem('practice_state'); window.location.reload(); }}
            className="text-gray-600 hover:text-red-400 transition-colors mt-2">{t('practice.reset')}</button>
        </div>
      </div>
    </div>
  );
}
