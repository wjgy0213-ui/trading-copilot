'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftRight, Key, Lock, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import EliteGate from './EliteGate';

type Exchange = 'binance' | 'okx' | 'bybit' | 'hyperliquid';

interface ExchangeConfig {
  exchange: Exchange;
  apiKey: string;
  apiSecret: string;
  connected: boolean;
  balance?: number;
}

const EXCHANGES = [
  { id: 'binance' as Exchange, name: 'Binance', icon: '🟡' },
  { id: 'okx' as Exchange, name: 'OKX', icon: '⚫' },
  { id: 'bybit' as Exchange, name: 'Bybit', icon: '🟠' },
  { id: 'hyperliquid' as Exchange, name: 'Hyperliquid', icon: '🔵' },
];

export default function ExchangeConnect() {
  const [selectedExchange, setSelectedExchange] = useState<Exchange>('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [configs, setConfigs] = useState<ExchangeConfig[]>([]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tc-exchange-keys');
    if (saved) {
      try {
        setConfigs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse exchange configs', e);
      }
    }
  }, []);

  const saveConfig = () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setTestResult({ success: false, message: '请输入 API Key 和 Secret' });
      return;
    }

    const newConfig: ExchangeConfig = {
      exchange: selectedExchange,
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      connected: false,
    };

    const updated = configs.filter(c => c.exchange !== selectedExchange);
    updated.push(newConfig);
    setConfigs(updated);
    localStorage.setItem('tc-exchange-keys', JSON.stringify(updated));

    setTestResult({ success: true, message: '配置已保存（未加密，仅用于演示）' });
    setApiKey('');
    setApiSecret('');
  };

  const testConnection = async () => {
    const config = configs.find(c => c.exchange === selectedExchange);
    if (!config) {
      setTestResult({ success: false, message: '请先保存配置' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    // 模拟API测试
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockBalance = Math.random() * 10000 + 1000;
    const updated = configs.map(c =>
      c.exchange === selectedExchange
        ? { ...c, connected: true, balance: mockBalance }
        : c
    );
    setConfigs(updated);
    localStorage.setItem('tc-exchange-keys', JSON.stringify(updated));

    setTestResult({
      success: true,
      message: `连接成功！账户余额: $${mockBalance.toFixed(2)} USDT`,
    });
    setTesting(false);
  };

  const currentConfig = configs.find(c => c.exchange === selectedExchange);

  return (
    <EliteGate>
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <ArrowLeftRight className="w-6 h-6 text-violet-400" />
          <h2 className="text-xl font-bold text-white">交易所 API 连接</h2>
        </div>

        {/* Exchange Selector */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">选择交易所</label>
          <div className="grid grid-cols-2 gap-2">
            {EXCHANGES.map(ex => (
              <button
                key={ex.id}
                onClick={() => setSelectedExchange(ex.id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedExchange === ex.id
                    ? 'bg-violet-600/20 border-violet-500 text-violet-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="text-xl mr-2">{ex.icon}</span>
                {ex.name}
              </button>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        {currentConfig && currentConfig.connected && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <div className="flex-1">
              <div className="text-sm text-green-400 font-medium">已连接</div>
              {currentConfig.balance && (
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Wallet className="w-3 h-3" />
                  余额: ${currentConfig.balance.toFixed(2)} USDT
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Key Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入你的 API Key"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* API Secret Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            API Secret
          </label>
          <input
            type="password"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="输入你的 API Secret"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-400">
              <strong>安全提示：</strong> 请确保 API 只有<strong>只读权限</strong>。
              本演示版本使用 localStorage 存储（未加密），生产环境需使用加密存储。
            </div>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`mb-4 p-3 rounded-lg border flex items-start gap-2 ${
            testResult.success
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            )}
            <div className={`text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.message}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={saveConfig}
            className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all"
          >
            保存配置
          </button>
          <button
            onClick={testConnection}
            disabled={testing || !currentConfig}
            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
        </div>
      </div>
    </EliteGate>
  );
}
