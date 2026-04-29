'use client';

import { useI18n } from '@/lib/i18n';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Position {
  symbol: string;
  entry_price: number;
  size_sol: number;
  size_usd: number;
  tokens: number;
  entry_time: string;
  peak_price: number;
  score: number;
  partial_sold: boolean;
  current_price: number;
  pnl_pct: number;
  pnl_usd: number;
}

interface Portfolio {
  total_value_sol: number;
  total_value_usd: number;
  total_pnl_pct: number;
  unrealized_pnl_sol: number;
  win_rate: number;
  sol_price: number;
}

interface Trade {
  action: string;
  symbol: string;
  token: string;
  price?: number;
  entry_price?: number;
  exit_price?: number;
  pnl_pct?: number;
  pnl_sol?: number;
  reason?: string;
  score?: number;
  size_sol?: number;
  ts: string;
}

interface SniperData {
  state: {
    balance_sol: number;
    positions: Record<string, Position>;
    total_trades: number;
    wins: number;
    losses: number;
    total_pnl_sol: number;
    max_drawdown: number;
    start_time: string;
  } | null;
  portfolio: Portfolio;
  trades: Trade[];
}

type SniperMode = 'choose' | 'paper' | 'live';
type LiveExchange = 'binance' | 'phantom' | null;

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className={`text-xl font-bold ${color || 'text-white'}`}>{value}</div>
      {sub && <div className="text-gray-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                score >= 70 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                score >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-gray-500/20 text-gray-400 border-gray-500/30';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}

function PnlText({ pnl }: { pnl: number }) {
  const color = pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : 'text-gray-400';
  return <span className={`font-medium ${color}`}>{pnl > 0 ? '+' : ''}{pnl.toFixed(1)}%</span>;
}

function timeAgo(isoStr: string, t: (key: string, fallback?: string) => string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return t('sniper.time.minutes').replace('{value}', String(mins));
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('sniper.time.hours').replace('{value}', String(hrs));
  return t('sniper.time.days').replace('{value}', String(Math.floor(hrs / 24)));
}

/* ========== Mode Selection Screen ========== */
function ModeSelector({ onSelect }: { onSelect: (mode: SniperMode) => void }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <span>🔫</span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {t('sniper.title')}
            </span>
          </h1>
          <p className="text-gray-400 mt-2">{t('sniper.aiDesc')}</p>
          <p className="text-gray-500 text-sm mt-1">{t('sniper.scoring')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Paper Trading */}
          <button
            onClick={() => onSelect('paper')}
            className="group bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/60 transition-all text-left"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-purple-300 group-hover:text-purple-200">{t('sniper.paper')}</h3>
            <p className="text-gray-400 text-sm mt-2">{t('sniper.paperDesc')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">{t('sniper.free')}</span>
              <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">{t('sniper.realtime')}</span>
              <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">{t('sniper.zeroRisk')}</span>
            </div>
            <div className="mt-4 text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              {t('sniper.startNow')}
            </div>
          </button>

          {/* Live Trading */}
          <button
            onClick={() => onSelect('live')}
            className="group bg-gradient-to-br from-orange-900/40 to-orange-800/20 rounded-2xl p-6 border border-orange-500/30 hover:border-orange-400/60 transition-all text-left"
          >
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-orange-300 group-hover:text-orange-200">{t('sniper.live')}</h3>
            <p className="text-gray-400 text-sm mt-2">{t('sniper.liveDesc')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-orange-500/20 rounded text-xs text-orange-300">{t('sniper.eliteBadge')}</span>
              <span className="px-2 py-1 bg-orange-500/20 rounded text-xs text-orange-300">{t('sniper.binanceBadge')}</span>
              <span className="px-2 py-1 bg-orange-500/20 rounded text-xs text-orange-300">{t('sniper.phantomBadge')}</span>
            </div>
            <div className="mt-4 text-orange-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
              {t('sniper.connectWallet')}
            </div>
          </button>
        </div>

        {/* Official Lab Stats */}
        <div className="mt-8 bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-300 font-medium">{t('sniper.officialLab')}</span>
          </div>
          <OfficialLabStats />
        </div>
      </div>
    </div>
  );
}

/* Official lab stats - fetches our real data */
function OfficialLabStats() {
  const { t } = useI18n();
  const [stats, setStats] = useState<{ pnl: string; trades: number; winRate: string; running: string } | null>(null);

  useEffect(() => {
    fetch('/api/sniper?source=official')
      .then(r => r.json())
      .then(d => {
        if (d.portfolio) {
          const startTime = d.state?.start_time ? new Date(d.state.start_time) : new Date();
          const days = Math.max(1, Math.ceil((Date.now() - startTime.getTime()) / 86400000));
          setStats({
            pnl: `${d.portfolio.total_pnl_pct >= 0 ? '+' : ''}${d.portfolio.total_pnl_pct.toFixed(1)}%`,
            trades: d.state?.total_trades || 0,
            winRate: `${d.portfolio.win_rate.toFixed(0)}%`,
            running: `${days}`,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!stats) return <div className="text-gray-500 text-sm">{t('sniper.loading')}</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
      <div>
        <div className={`font-bold ${stats.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{stats.pnl}</div>
        <div className="text-gray-500 text-xs">{t('sniper.cumReturn')}</div>
      </div>
      <div>
        <div className="font-bold text-white">{stats.trades}</div>
        <div className="text-gray-500 text-xs">{t('sniper.totalTrades')}</div>
      </div>
      <div>
        <div className="font-bold text-white">{stats.winRate}</div>
        <div className="text-gray-500 text-xs">{t('sniper.winRate')}</div>
      </div>
      <div>
        <div className="font-bold text-purple-400">{stats.running}</div>
        <div className="text-gray-500 text-xs">{t('sniper.runDays')}</div>
      </div>
    </div>
  );
}

/* ========== Live Mode Connect Screen ========== */
function LiveConnect({ onBack, onConnect }: { onBack: () => void; onConnect: (exchange: LiveExchange) => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const [showBinanceForm, setShowBinanceForm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [phantomStatus, setPhantomStatus] = useState<'idle' | 'connecting' | 'no-wallet'>('idle');

  const connectBinance = async () => {
    if (!apiKey || !apiSecret) { setError(t('sniper.fillApiKey')); return; }
    setConnecting(true);
    setError('');
    try {
      const res = await fetch('/api/exchange/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange: 'binance', apiKey, apiSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('sniper.connectFail'));
      onConnect('binance');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setConnecting(false);
    }
  };

  const connectPhantom = async () => {
    try {
      const provider = (window as any).phantom?.solana || (window as any).solana;
      if (!provider?.isPhantom) {
        setPhantomStatus('no-wallet');
        return;
      }
      setPhantomStatus('connecting');
      const resp = await provider.connect();
      const pubkey = resp.publicKey.toString();
      localStorage.setItem('sniper_phantom_pubkey', pubkey);
      onConnect('phantom');
    } catch (e: any) {
      setError(e.message || t('sniper.phantomFail'));
      setPhantomStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
          {t('sniper.back')}
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">{t('sniper.connectTitle')}</h2>
          <p className="text-gray-400 mt-2">{t('sniper.connectDesc')}</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 rounded-lg p-3 border border-red-500/20 text-red-300 text-sm">
            ❌ {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Binance */}
          <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-yellow-500/50 transition-all overflow-hidden">
            <button
              onClick={() => setShowBinanceForm(!showBinanceForm)}
              className="w-full p-5 flex items-center gap-4 text-left"
            >
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl">🟡</div>
              <div>
                <div className="font-bold">{t('sniper.exchangeNames.binance')}</div>
                <div className="text-gray-400 text-sm">{t('sniper.binanceDesc')}</div>
              </div>
              <div className="ml-auto text-gray-500">{showBinanceForm ? '↑' : '→'}</div>
            </button>
            {showBinanceForm && (
              <div className="px-5 pb-5 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">{t('sniper.apiKeyLabel')}</label>
                  <input
                    type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t('sniper.apiKeyPlaceholder')}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">{t('sniper.apiSecretLabel')}</label>
                  <input
                    type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)}
                    placeholder={t('sniper.apiSecretPlaceholder')}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                <div className="text-xs text-gray-500 bg-gray-900/60 rounded-lg p-2">
                  {t('sniper.securityTip').split('\n')[0]}<br/>
                  {t('sniper.securityTip').split('\n')[1]}
                </div>
                <button
                  onClick={connectBinance} disabled={connecting}
                  className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-black font-bold py-2.5 rounded-lg transition-all text-sm"
                >
                  {connecting ? t('sniper.connecting') : `🔗 ${t('sniper.connectBinance')}`}
                </button>
              </div>
            )}
          </div>

          {/* Phantom */}
          <button
            onClick={connectPhantom}
            disabled={phantomStatus === 'connecting'}
            className="w-full bg-gray-800/60 rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/50 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">👻</div>
            <div>
              <div className="font-bold">{t('sniper.exchangeNames.phantomWallet')}</div>
              <div className="text-gray-400 text-sm">
                {phantomStatus === 'connecting' ? t('sniper.phantomConnecting') :
                 phantomStatus === 'no-wallet' ? t('sniper.phantomNotFound') :
                 t('sniper.phantomDesc')}
              </div>
            </div>
            <div className="ml-auto text-gray-500">
              {phantomStatus === 'connecting' ? '⏳' : '→'}
            </div>
          </button>

          {phantomStatus === 'no-wallet' && (
            <a href="https://phantom.app/download" target="_blank" rel="noopener noreferrer"
              className="block text-center text-purple-400 hover:text-purple-300 text-xs underline">
              {t('sniper.downloadPhantom')}
            </a>
          )}

          {/* OKX */}
          <button
            onClick={() => router.push('/elite')}
            className="w-full bg-gray-800/60 rounded-xl p-5 border border-gray-700/50 hover:border-blue-500/50 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl font-bold text-blue-400">OK</div>
            <div>
              <div className="font-bold">{t('sniper.exchangeNames.okx')}</div>
              <div className="text-gray-400 text-sm">{t('sniper.okxDesc')}</div>
            </div>
            <div className="ml-auto text-gray-500">→</div>
          </button>

          {/* Bybit */}
          <button
            onClick={() => router.push('/elite')}
            className="w-full bg-gray-800/60 rounded-xl p-5 border border-gray-700/50 hover:border-orange-500/50 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-xl font-bold text-orange-400">By</div>
            <div>
              <div className="font-bold">{t('sniper.exchangeNames.bybit')}</div>
              <div className="text-gray-400 text-sm">{t('sniper.bybitDesc')}</div>
            </div>
            <div className="ml-auto text-gray-500">→</div>
          </button>

          {/* Hyperliquid */}
          <button
            onClick={() => router.push('/elite')}
            className="w-full bg-gray-800/60 rounded-xl p-5 border border-gray-700/50 hover:border-green-500/50 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-xl font-bold text-green-400">HL</div>
            <div>
              <div className="font-bold">{t('sniper.exchangeNames.hyperliquid')}</div>
              <div className="text-gray-400 text-sm">{t('sniper.hlDesc')}</div>
            </div>
            <div className="ml-auto text-gray-500">→</div>
          </button>
        </div>

        <div className="mt-6 bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
          <p className="text-orange-300 text-xs">
            {t('sniper.liveWarning')}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========== Main Sniper Dashboard ========== */
function SniperDashboard({ mode, onBack }: { mode: 'paper' | 'live'; onBack: () => void }) {
  const { t } = useI18n();
  const [data, setData] = useState<SniperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'positions' | 'history'>('positions');
  const [paperStarted, setPaperStarted] = useState(false);

  const loadPaperData = useCallback(() => {
    // Paper mode: user's own data from localStorage
    const saved = localStorage.getItem('sniper_paper_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        const solPrice = 93; // approximate
        const posEntries = Object.entries(state.positions || {});
        const posValue = posEntries.reduce((sum, [, p]: [string, any]) => sum + (p.size_sol || 0), 0);
        const totalValue = state.balance_sol + posValue;
        const pnlPct = ((totalValue - 10) / 10) * 100;
        const winRate = state.total_trades > 0 ? (state.wins / (state.wins + state.losses)) * 100 : 0;

        setData({
          state: state,
          portfolio: {
            total_value_sol: totalValue,
            total_value_usd: totalValue * solPrice,
            total_pnl_pct: pnlPct,
            unrealized_pnl_sol: 0,
            win_rate: winRate,
            sol_price: solPrice,
          },
          trades: state.trade_history || [],
        });
      } catch {}
    } else {
      // Fresh paper state
      const freshState = {
        balance_sol: 10,
        positions: {},
        total_trades: 0,
        wins: 0,
        losses: 0,
        total_pnl_sol: 0,
        max_drawdown: 0,
        peak_balance: 10,
        start_time: new Date().toISOString(),
        trade_history: [],
      };
      localStorage.setItem('sniper_paper_state', JSON.stringify(freshState));
      setData({
        state: freshState,
        portfolio: {
          total_value_sol: 10,
          total_value_usd: 930,
          total_pnl_pct: 0,
          unrealized_pnl_sol: 0,
          win_rate: 0,
          sol_price: 93,
        },
        trades: [],
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (mode === 'paper') {
      const saved = localStorage.getItem('sniper_paper_session');
      if (saved) {
        setPaperStarted(true);
        loadPaperData();
        const iv = setInterval(loadPaperData, 30000);
        return () => clearInterval(iv);
      } else {
        setLoading(false);
      }
    }
  }, [mode, loadPaperData]);

  // Paper mode - fresh start
  if (mode === 'paper' && !paperStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-12">
          <button onClick={onBack} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1">
            {t('sniper.backSelect')}
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">{t('sniper.paperTitle')}</h1>
            <p className="text-gray-400 mt-2">{t('sniper.paperSubtitle')}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/20 text-center">
            <div className="text-6xl mb-4">🔫</div>
            <h3 className="text-xl font-bold mb-2">{t('sniper.ready')}</h3>
            <p className="text-gray-400 mb-6">{t('sniper.readyDesc')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
              <div className="bg-gray-800/60 rounded-xl p-3">
                <div className="text-purple-400 font-bold">10 SOL</div>
                <div className="text-gray-500 text-xs">{t('sniper.startFund')}</div>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-3">
                <div className="text-purple-400 font-bold">{t('sniper.fiveDim')}</div>
                <div className="text-gray-500 text-xs">{t('sniper.algorithm')}</div>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-3">
                <div className="text-purple-400 font-bold">{t('sniper.autoExec')}</div>
                <div className="text-gray-500 text-xs">{t('sniper.execution')}</div>
              </div>
            </div>

            <div className="bg-gray-800/40 rounded-lg p-4 mb-6 text-left text-sm">
              <h4 className="font-medium text-gray-300 mb-2">{t('sniper.strategyParams')}</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <div>{t('sniper.scanFreq')}</div>
                <div>{t('sniper.buyThreshold')}</div>
                <div>{t('sniper.posSize')}</div>
                <div>{t('sniper.maxPos')}</div>
                <div>{t('sniper.stopLoss')}</div>
                <div>{t('sniper.takeProfit')}</div>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem('sniper_paper_session', JSON.stringify({
                  started: new Date().toISOString(),
                  balance: 10,
                }));
                setPaperStarted(true);
                loadPaperData();
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all transform hover:scale-105"
            >
              {t('sniper.launchPaper')}
            </button>
          </div>

          {/* Rules */}
          <div className="mt-6 text-xs text-gray-500 space-y-1">
            <p>{t('sniper.paperNote1')}</p>
            <p>{t('sniper.paperNote2')}</p>
            <p>{t('sniper.paperNote3')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-3">{t('sniper.loadingSniper')}</p>
        </div>
      </div>
    );
  }

  if (!data?.state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-4xl mb-4">🔫</p>
          <p className="text-lg">{t('sniper.preparing')}</p>
          <p className="text-sm mt-2">{t('sniper.scanning')}</p>
          <button onClick={onBack} className="mt-4 text-purple-400 hover:text-purple-300 text-sm">{t('sniper.back')}</button>
        </div>
      </div>
    );
  }

  const { state, portfolio, trades } = data;
  const positions = Object.entries(state.positions);
  const pnlColor = portfolio.total_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={onBack} className="text-gray-500 hover:text-white text-xs mb-1 flex items-center gap-1">
              {t('sniper.back')}
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🔫</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {t('sniper.title')}
              </span>
            </h1>
            <p className="text-gray-500 text-sm">
              {mode === 'paper' ? t('sniper.paperMode') : t('sniper.liveMode')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
              mode === 'paper' 
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
            }`}>
              {mode === 'paper' ? t('sniper.paperBadge') : t('sniper.liveBadge')}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-400">{t('sniper.liveNow')}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20 mb-6">
          <div className="text-center mb-4">
            <div className="text-gray-400 text-sm">{t('sniper.portfolioValue')}</div>
            <div className="text-4xl font-bold mt-1">
              {portfolio.total_value_sol.toFixed(2)} <span className="text-lg text-gray-400">SOL</span>
            </div>
            <div className="text-gray-400 text-sm">${portfolio.total_value_usd.toLocaleString()}</div>
            <div className={`text-lg font-semibold mt-1 ${pnlColor}`}>
              {portfolio.total_pnl_pct >= 0 ? '+' : ''}{portfolio.total_pnl_pct.toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label={t('sniper.balance')} value={`${state.balance_sol.toFixed(2)} SOL`} />
            <StatCard label={t('sniper.posCount')} value={`${positions.length} / 10`} sub={`${state.total_trades} ${t('sniper.totalTradesLabel')}`} />
            <StatCard 
              label={t('sniper.winRate')} 
              value={`${portfolio.win_rate.toFixed(0)}%`}
              sub={`${state.wins}W ${state.losses}L`}
              color={portfolio.win_rate >= 50 ? 'text-green-400' : portfolio.win_rate > 0 ? 'text-red-400' : 'text-gray-400'}
            />
            <StatCard 
              label={t('sniper.maxDrawdown')} 
              value={`${state.max_drawdown.toFixed(1)}%`}
              color={state.max_drawdown < -10 ? 'text-red-400' : 'text-yellow-400'}
            />
          </div>
        </div>

        {/* Upgrade banner for paper mode */}
        {mode === 'paper' && (
          <div className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 rounded-xl p-4 border border-orange-500/20 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-sm font-medium text-orange-300">{t('sniper.upgradeTitle')}</div>
                <div className="text-xs text-gray-400">{t('sniper.upgradeDesc')}</div>
              </div>
            </div>
            <button className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-sm font-medium border border-orange-500/30 transition-colors">
              {t('sniper.connectWallet')}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
          <button
            onClick={() => setTab('positions')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'positions' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t('sniper.positions')} ({positions.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'history' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t('sniper.tradeHistory')} ({trades.length})
          </button>
        </div>

        {/* Positions Tab */}
        {tab === 'positions' && (
          <div className="space-y-3">
            {positions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-3xl mb-2">🎯</p>
                <p>{t('sniper.noPositions')}</p>
              </div>
            ) : (
              positions
                .sort(([,a], [,b]) => b.pnl_pct - a.pnl_pct)
                .map(([addr, pos]) => (
                  <div key={addr} className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">{pos.symbol}</span>
                        <ScoreBadge score={pos.score} />
                        {pos.partial_sold && (
                          <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            {t('sniper.partialTPLabel')}
                          </span>
                        )}
                      </div>
                      <PnlText pnl={pos.pnl_pct} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">{t('sniper.entryPrice')}</div>
                        <div className="text-gray-300 font-mono">${pos.entry_price.toFixed(8)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">{t('sniper.currentPrice')}</div>
                        <div className="text-gray-300 font-mono">${pos.current_price.toFixed(8)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">{t('sniper.positionSize')}</div>
                        <div className="text-gray-300">{pos.size_sol.toFixed(3)} SOL</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">{t('sniper.holdTime')}</div>
                        <div className="text-gray-300">{timeAgo(pos.entry_time, t)}</div>
                      </div>
                    </div>

                    {/* PnL bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{t('sniper.slLabel')}</span>
                        <span>{t('sniper.entryLabel')}</span>
                        <span>{t('sniper.tpLabel')}</span>
                      </div>
                      <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="absolute left-0 h-full bg-red-500/30 rounded-l-full" style={{ width: '13%' }} />
                        <div className="absolute right-0 h-full bg-green-500/30 rounded-r-full" style={{ width: '33%' }} />
                        <div
                          className={`absolute top-0 h-full w-1 ${pos.pnl_pct >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{
                            left: `${Math.min(100, Math.max(0, ((pos.pnl_pct + 30) / 230) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-mono">{addr.slice(0, 8)}...{addr.slice(-4)}</span>
                      <a
                        href={`https://dexscreener.com/solana/${addr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        DexScreener ↗
                      </a>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div className="space-y-2">
            {trades.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>{t('sniper.noTrades')}</p>
              </div>
            ) : (
              trades.map((trade, i) => (
                <div key={i} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    trade.action === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {trade.action === 'BUY' ? '🟢' : '🔴'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trade.symbol}</span>
                      <span className={`text-xs ${trade.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.action}
                      </span>
                      {trade.score && <ScoreBadge score={trade.score} />}
                      {trade.reason && (
                        <span className="text-xs text-gray-500 truncate">{trade.reason}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {trade.size_sol && <span>{trade.size_sol.toFixed(3)} SOL</span>}
                      {trade.price && <span> @ ${trade.price.toFixed(8)}</span>}
                      {trade.pnl_pct !== undefined && (
                        <span className={trade.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {' '}({trade.pnl_pct >= 0 ? '+' : ''}{trade.pnl_pct.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{timeAgo(trade.ts, t)}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>{t('sniper.footerScan')}</p>
          <p className="mt-1">
            {mode === 'paper' ? t('sniper.paperFooter') : t('sniper.liveFooter')} · SOL ${portfolio.sol_price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========== Root Page ========== */
export default function SniperPage() {
  const [mode, setMode] = useState<SniperMode>('choose');
  const [liveExchange, setLiveExchange] = useState<LiveExchange>(null);

  // Check for existing session
  useEffect(() => {
    const saved = localStorage.getItem('sniper_mode');
    if (saved === 'paper' || saved === 'live') {
      setMode(saved);
    }
  }, []);

  const selectMode = (m: SniperMode) => {
    setMode(m);
    if (m === 'paper' || m === 'live') {
      localStorage.setItem('sniper_mode', m);
    }
  };

  const goBack = () => {
    setMode('choose');
    localStorage.removeItem('sniper_mode');
  };

  if (mode === 'choose') {
    return <ModeSelector onSelect={selectMode} />;
  }

  if (mode === 'live' && !liveExchange) {
    return <LiveConnect onBack={goBack} onConnect={(ex) => {
      setLiveExchange(ex);
    }} />;
  }

  return <SniperDashboard mode={mode === 'live' ? 'live' : 'paper'} onBack={goBack} />;
}
