'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, TrendingUp, AlertTriangle, Bell, Check, X, Loader2 } from 'lucide-react';

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  leverage: number;
  liquidationPrice: number;
}

interface RiskData {
  status: 'green' | 'yellow' | 'red';
  details: {
    maxPositionRisk: number;
    dailyLoss: number;
    maxLeverage: number;
    accountBalance: number;
  };
  positions: Position[];
}

export default function ElitePage() {
  const { data: session } = useSession();
  const [exchange, setExchange] = useState('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [chatId, setChatId] = useState('');
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-refresh positions every 10 seconds
  useEffect(() => {
    if (connected) {
      fetchPositions();
      fetchRiskData();
      const interval = setInterval(() => {
        fetchPositions();
        fetchRiskData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  const connectExchange = async () => {
    setConnecting(true);
    setError('');
    try {
      const res = await fetch('/api/exchange/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exchange, apiKey, apiSecret, passphrase: exchange === 'okx' ? passphrase : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connection failed');
      
      setConnected(true);
      setBalance(data.balance);
      setSuccess('✅ Exchange connected successfully!');
      setApiKey('');
      setApiSecret('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/exchange/positions');
      if (!res.ok) return;
      const data = await res.json();
      setPositions(data.positions || []);
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    }
  };

  const fetchRiskData = async () => {
    try {
      const res = await fetch('/api/risk/monitor');
      if (!res.ok) return;
      const data = await res.json();
      setRiskData(data);
    } catch (err) {
      console.error('Failed to fetch risk data:', err);
    }
  };

  const closePosition = async (position: Position) => {
    if (!confirm(`确认平仓 ${position.symbol} ${position.side}？`)) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/exchange/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: position.symbol,
          side: position.side,
          quantity: position.size,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to close position');
      
      setSuccess(`✅ ${position.symbol} 已平仓`);
      fetchPositions();
      fetchRiskData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupTelegram = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/telegram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setup failed');
      
      setTelegramConnected(true);
      setSuccess('✅ Telegram connected! Check your messages.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">请先登录</h1>
          <p className="text-gray-400">Elite功能需要登录账户</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-10 h-10 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold">Elite 控制台</h1>
            <p className="text-gray-400">实盘交易 · 风控监控 · 自动化</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <X className="w-5 h-5 text-red-400 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
            <p className="text-emerald-400 text-sm">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Section 1: Exchange Connection */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              交易所连接
            </h2>
            
            {!connected ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">交易所</label>
                  <select 
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="binance">Binance USDT-M Futures</option>
                    <option value="okx">OKX</option>
                    <option value="bybit">Bybit</option>
                    <option value="hyperliquid">Hyperliquid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {exchange === 'hyperliquid' ? '钱包地址 (0x...)' : 'API Key'}
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={exchange === 'hyperliquid' ? '0x...' : '输入你的API Key'}
                  />
                </div>

                {exchange !== 'hyperliquid' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">API Secret</label>
                    <input
                      type="password"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="输入你的API Secret"
                    />
                  </div>
                )}

                {exchange === 'okx' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Passphrase</label>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="输入你的OKX Passphrase"
                    />
                  </div>
                )}

                <button
                  onClick={connectExchange}
                  disabled={connecting || !apiKey || (exchange !== 'hyperliquid' && !apiSecret) || (exchange === 'okx' && !passphrase)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      连接中...
                    </>
                  ) : (
                    '连接交易所'
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ 请确保API权限包含：读取持仓、交易（平仓）。不需要提币权限。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">已连接</span>
                    <span className="text-emerald-400 font-semibold">{exchange.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">账户余额</span>
                    <span className="text-2xl font-bold">${balance?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setConnected(false);
                    setBalance(null);
                    setPositions([]);
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-lg transition"
                >
                  断开连接
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Telegram Notifications */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              Telegram 通知
            </h2>

            {!telegramConnected ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Chat ID</label>
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入你的Telegram Chat ID"
                  />
                </div>

                <button
                  onClick={setupTelegram}
                  disabled={loading || !chatId}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      连接中...
                    </>
                  ) : (
                    '连接 Telegram'
                  )}
                </button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>💡 如何获取Chat ID：</p>
                  <p>1. 打开 Telegram，搜索 @userinfobot</p>
                  <p>2. 点击 Start，机器人会回复你的 Chat ID</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-semibold">已连接</span>
                  </div>
                  <p className="text-sm text-gray-400">Chat ID: {chatId}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>持仓变化通知</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>风控警报</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>平仓确认</span>
                  </label>
                </div>

                <button
                  onClick={() => setTelegramConnected(false)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 rounded-lg transition"
                >
                  断开连接
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Risk Dashboard */}
        {connected && riskData && (
          <div className="mt-6 bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              风控仪表盘
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Risk Indicator */}
              <div className="flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold border-4 ${
                  riskData.status === 'green' 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : riskData.status === 'yellow'
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                    : 'bg-red-500/20 border-red-500 text-red-400'
                }`}>
                  {riskData.status === 'green' ? '🟢' : riskData.status === 'yellow' ? '🟡' : '🔴'}
                </div>
                <p className="mt-4 text-lg font-semibold">
                  {riskData.status === 'green' ? '安全' : riskData.status === 'yellow' ? '警告' : '危险'}
                </p>
              </div>

              {/* Risk Metrics */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">单笔风险</span>
                    <span className="font-semibold">{riskData.details.maxPositionRisk.toFixed(2)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        riskData.details.maxPositionRisk > 5 ? 'bg-red-500' :
                        riskData.details.maxPositionRisk > 3 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(riskData.details.maxPositionRisk * 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">当日亏损</span>
                    <span className="font-semibold">{riskData.details.dailyLoss.toFixed(2)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        riskData.details.dailyLoss > 8 ? 'bg-red-500' :
                        riskData.details.dailyLoss > 5 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(riskData.details.dailyLoss * 10, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">最高杠杆</span>
                    <span className="font-semibold">{riskData.details.maxLeverage}x</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        riskData.details.maxLeverage > 20 ? 'bg-red-500' :
                        riskData.details.maxLeverage > 10 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(riskData.details.maxLeverage * 3.33, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Positions */}
        {connected && (
          <div className="mt-6 bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                持仓监控
              </h2>
              <span className="text-xs text-gray-500">每10秒自动刷新</span>
            </div>

            {positions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>当前无持仓</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-2 text-gray-400 font-medium">币种</th>
                      <th className="text-left py-3 px-2 text-gray-400 font-medium">方向</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-medium">大小</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-medium">入场价</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-medium">当前价</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-medium">盈亏</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-medium">杠杆</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos, i) => (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 px-2 font-semibold">{pos.symbol}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            pos.side === 'LONG' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {pos.side}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">{pos.size.toFixed(3)}</td>
                        <td className="py-3 px-2 text-right">${pos.entryPrice.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right">${pos.markPrice.toFixed(2)}</td>
                        <td className={`py-3 px-2 text-right font-semibold ${
                          pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right">{pos.leverage}x</td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => closePosition(pos)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded border border-red-600/30 transition disabled:opacity-50"
                          >
                            平仓
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
