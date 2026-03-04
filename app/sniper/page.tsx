'use client';

import { useState, useEffect, useCallback } from 'react';

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

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function SniperPage() {
  const [data, setData] = useState<SniperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'positions' | 'history'>('positions');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/sniper');
      if (res.ok) {
        setData(await res.json());
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(iv);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-3">Loading Sniper...</p>
        </div>
      </div>
    );
  }

  if (!data?.state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-4xl mb-4">🔫</p>
          <p className="text-lg">Meme Sniper 未运行</p>
          <p className="text-sm mt-2">模拟盘系统离线</p>
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🔫</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Meme Sniper
              </span>
            </h1>
            <p className="text-gray-500 text-sm">链上Meme自动化狙击 · 模拟盘</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20 mb-6">
          <div className="text-center mb-4">
            <div className="text-gray-400 text-sm">Portfolio Value</div>
            <div className="text-4xl font-bold mt-1">
              {portfolio.total_value_sol.toFixed(2)} <span className="text-lg text-gray-400">SOL</span>
            </div>
            <div className="text-gray-400 text-sm">${portfolio.total_value_usd.toLocaleString()}</div>
            <div className={`text-lg font-semibold mt-1 ${pnlColor}`}>
              {portfolio.total_pnl_pct >= 0 ? '+' : ''}{portfolio.total_pnl_pct.toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard 
              label="余额" 
              value={`${state.balance_sol.toFixed(2)} SOL`} 
            />
            <StatCard 
              label="持仓数" 
              value={`${positions.length} / 10`}
              sub={`${state.total_trades} 总交易`}
            />
            <StatCard 
              label="胜率" 
              value={`${portfolio.win_rate.toFixed(0)}%`}
              sub={`${state.wins}W ${state.losses}L`}
              color={portfolio.win_rate >= 50 ? 'text-green-400' : portfolio.win_rate > 0 ? 'text-red-400' : 'text-gray-400'}
            />
            <StatCard 
              label="最大回撤" 
              value={`${state.max_drawdown.toFixed(1)}%`}
              color={state.max_drawdown < -10 ? 'text-red-400' : 'text-yellow-400'}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
          <button
            onClick={() => setTab('positions')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'positions' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            📊 持仓 ({positions.length})
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === 'history' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            📜 交易记录 ({trades.length})
          </button>
        </div>

        {/* Positions Tab */}
        {tab === 'positions' && (
          <div className="space-y-3">
            {positions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-3xl mb-2">🎯</p>
                <p>暂无持仓 — 等待狙击机会</p>
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
                            部分止盈
                          </span>
                        )}
                      </div>
                      <PnlText pnl={pos.pnl_pct} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">入场价</div>
                        <div className="text-gray-300 font-mono">${pos.entry_price.toFixed(8)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">现价</div>
                        <div className="text-gray-300 font-mono">${pos.current_price.toFixed(8)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">仓位</div>
                        <div className="text-gray-300">{pos.size_sol.toFixed(3)} SOL</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">持仓时间</div>
                        <div className="text-gray-300">{timeAgo(pos.entry_time)}</div>
                      </div>
                    </div>

                    {/* PnL bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>止损 -30%</span>
                        <span>入场</span>
                        <span>止盈 +200%</span>
                      </div>
                      <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        {/* Stop loss zone */}
                        <div className="absolute left-0 h-full bg-red-500/30 rounded-l-full" style={{ width: '13%' }} />
                        {/* Take profit zone */}
                        <div className="absolute right-0 h-full bg-green-500/30 rounded-r-full" style={{ width: '33%' }} />
                        {/* Current position marker */}
                        <div
                          className={`absolute top-0 h-full w-1 ${pos.pnl_pct >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{
                            left: `${Math.min(100, Math.max(0, ((pos.pnl_pct + 30) / 230) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Token address */}
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
                <p>暂无交易记录</p>
              </div>
            ) : (
              trades.map((t, i) => (
                <div key={i} className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/30 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                    t.action === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {t.action === 'BUY' ? '🟢' : '🔴'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.symbol}</span>
                      <span className={`text-xs ${t.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.action}
                      </span>
                      {t.score && <ScoreBadge score={t.score} />}
                      {t.reason && (
                        <span className="text-xs text-gray-500 truncate">{t.reason}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {t.size_sol && <span>{t.size_sol.toFixed(3)} SOL</span>}
                      {t.price && <span> @ ${t.price.toFixed(8)}</span>}
                      {t.pnl_pct !== undefined && (
                        <span className={t.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {' '}({t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">{timeAgo(t.ts)}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-gray-600">
          <p>🔫 每5分钟自动扫描 · 5维评分≥65自动买入 · 止损-30% / 止盈+200%</p>
          <p className="mt-1">模拟盘 · 不涉及真实资金 · SOL ${portfolio.sol_price.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
