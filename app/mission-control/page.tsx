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
  address?: string;
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
    peak_balance: number;
    start_time: string;
  };
  portfolio: {
    total_value_sol: number;
    total_value_usd: number;
    total_pnl_pct: number;
    win_rate: number;
    sol_price: number;
  };
  trades: any[];
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatUptime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

export default function MissionControlPage() {
  const [sniperData, setSniperData] = useState<SniperData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const ADMIN_PASS = '0sw-wx3NdFPNvEqIeEdi4rGnD-FGnyk8';

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/sniper');
      if (res.ok) {
        const data = await res.json();
        setSniperData(data);
        setLastRefresh(new Date());
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchData();
    const iv = setInterval(fetchData, 15000); // 15s refresh for mission control
    return () => clearInterval(iv);
  }, [authenticated, fetchData]);

  // Auth gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 max-w-sm w-full">
          <h1 className="text-xl font-bold mb-4 text-center">🎛️ Mission Control</h1>
          <p className="text-gray-500 text-sm text-center mb-6">Admin access required</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password === ADMIN_PASS) setAuthenticated(true);
            }}
            placeholder="Password"
            className="w-full bg-gray-800 rounded-lg px-4 py-3 text-white border border-gray-700 focus:border-purple-500 focus:outline-none mb-4"
          />
          <button
            onClick={() => { if (password === ADMIN_PASS) setAuthenticated(true); }}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sniper = sniperData;
  const state = sniper?.state;
  const portfolio = sniper?.portfolio;
  const positions = state ? Object.entries(state.positions) : [];
  const trades = sniper?.trades || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span>🎛️</span>
              <span>Mission Control</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">内部系统监控面板</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Last: {lastRefresh.toLocaleTimeString()}</span>
            <button onClick={fetchData} className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* System Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-gray-400">Meme Sniper</span>
            </div>
            <div className="text-lg font-bold text-green-400">Running</div>
            <div className="text-xs text-gray-500 mt-1">
              {state?.start_time ? `Uptime: ${formatUptime(state.start_time)}` : 'N/A'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-2">Portfolio Value</div>
            <div className="text-lg font-bold">
              {portfolio ? `${portfolio.total_value_sol.toFixed(2)} SOL` : 'N/A'}
            </div>
            <div className={`text-sm font-medium ${(portfolio?.total_pnl_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio ? `${portfolio.total_pnl_pct >= 0 ? '+' : ''}${portfolio.total_pnl_pct.toFixed(1)}%` : ''}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-2">交易统计</div>
            <div className="text-lg font-bold">{state?.total_trades || 0} 笔</div>
            <div className="text-xs text-gray-500 mt-1">
              {state ? `${state.wins}W / ${state.losses}L (${portfolio?.win_rate.toFixed(0)}%)` : 'N/A'}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-xs text-gray-400 mb-2">风控</div>
            <div className={`text-lg font-bold ${(state?.max_drawdown || 0) < -15 ? 'text-red-400' : 'text-yellow-400'}`}>
              {state ? `${state.max_drawdown.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Peak: {state ? `${state.peak_balance.toFixed(2)} SOL` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Positions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            📊 持仓 <span className="text-sm text-gray-500 font-normal">({positions.length}/10)</span>
          </h2>
          
          {positions.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center text-gray-500">
              暂无持仓
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800">
                    <th className="text-left py-2 px-3">Symbol</th>
                    <th className="text-right py-2 px-3">Score</th>
                    <th className="text-right py-2 px-3">Entry</th>
                    <th className="text-right py-2 px-3">Current</th>
                    <th className="text-right py-2 px-3">PnL</th>
                    <th className="text-right py-2 px-3">Size</th>
                    <th className="text-right py-2 px-3">Age</th>
                    <th className="text-right py-2 px-3">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {positions
                    .sort(([,a], [,b]) => b.pnl_pct - a.pnl_pct)
                    .map(([addr, pos]) => (
                    <tr key={addr} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                      <td className="py-2 px-3 font-medium">{pos.symbol}</td>
                      <td className="py-2 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          pos.score >= 80 ? 'bg-green-500/20 text-green-400' :
                          pos.score >= 70 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {pos.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-xs text-gray-400">${pos.entry_price.toFixed(8)}</td>
                      <td className="py-2 px-3 text-right font-mono text-xs text-gray-400">${pos.current_price?.toFixed(8) || '...'}</td>
                      <td className={`py-2 px-3 text-right font-medium ${pos.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pos.pnl_pct >= 0 ? '+' : ''}{pos.pnl_pct?.toFixed(1) || '0'}%
                      </td>
                      <td className="py-2 px-3 text-right text-gray-400">{pos.size_sol.toFixed(3)}</td>
                      <td className="py-2 px-3 text-right text-gray-500 text-xs">{timeAgo(pos.entry_time)}</td>
                      <td className="py-2 px-3 text-right">
                        <a href={`https://dexscreener.com/solana/${addr}`} target="_blank" rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-xs">↗</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            📜 最近交易 <span className="text-sm text-gray-500 font-normal">({trades.length})</span>
          </h2>
          
          <div className="space-y-1">
            {trades.slice(0, 20).map((t, i) => (
              <div key={i} className="bg-gray-900/60 rounded-lg px-4 py-2 border border-gray-800/50 flex items-center gap-3 text-sm">
                <span className={`w-6 text-center ${t.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                  {t.action === 'BUY' ? '↑' : '↓'}
                </span>
                <span className="font-medium w-20">{t.symbol}</span>
                {t.score && (
                  <span className="text-xs text-gray-500 w-12">{t.score.toFixed(0)}分</span>
                )}
                <span className="text-xs text-gray-500 w-20">{t.size_sol?.toFixed(3)} SOL</span>
                {t.pnl_pct !== undefined && (
                  <span className={`text-xs font-medium w-16 ${t.pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.pnl_pct >= 0 ? '+' : ''}{t.pnl_pct.toFixed(1)}%
                  </span>
                )}
                {t.reason && <span className="text-xs text-gray-600 truncate flex-1">{t.reason}</span>}
                <span className="text-xs text-gray-600 ml-auto">{timeAgo(t.ts)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <h2 className="text-sm font-bold mb-3 text-gray-400">System Info</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-gray-500">Data Source</div>
              <div className="text-gray-300 mt-1">{(sniper as any)?.source || 'unknown'}</div>
            </div>
            <div>
              <div className="text-gray-500">SOL Price</div>
              <div className="text-gray-300 mt-1">${portfolio?.sol_price.toFixed(2) || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500">Start Time</div>
              <div className="text-gray-300 mt-1">{state?.start_time ? new Date(state.start_time).toLocaleString() : 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500">Balance (cash)</div>
              <div className="text-gray-300 mt-1">{state ? `${state.balance_sol.toFixed(2)} SOL` : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
