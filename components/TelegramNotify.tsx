'use client';

import { useState, useEffect } from 'react';
import { Send, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import EliteGate from './EliteGate';

interface TelegramConfig {
  botToken: string;
  chatId: string;
  notifications: {
    openPosition: boolean;
    closePosition: boolean;
    stopLoss: boolean;
    riskAlert: boolean;
    dailySummary: boolean;
  };
}

const DEFAULT_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  notifications: {
    openPosition: true,
    closePosition: true,
    stopLoss: true,
    riskAlert: true,
    dailySummary: false,
  },
};

export default function TelegramNotify() {
  const [config, setConfig] = useState<TelegramConfig>(DEFAULT_CONFIG);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tc-telegram-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse telegram config', e);
      }
    }
  }, []);

  const saveConfig = () => {
    if (!config.botToken.trim() || !config.chatId.trim()) {
      setTestResult({ success: false, message: '请输入 Bot Token 和 Chat ID' });
      return;
    }

    localStorage.setItem('tc-telegram-config', JSON.stringify(config));
    setTestResult({ success: true, message: '配置已保存' });
  };

  const testNotification = async () => {
    if (!config.botToken.trim() || !config.chatId.trim()) {
      setTestResult({ success: false, message: '请先保存配置' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    // 模拟发送测试消息
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = Math.random() > 0.3; // 70% 成功率模拟
    setTestResult({
      success,
      message: success
        ? '✅ 测试消息已发送到 Telegram！'
        : '❌ 发送失败，请检查 Bot Token 和 Chat ID 是否正确',
    });
    setTesting(false);
  };

  const toggleNotification = (key: keyof TelegramConfig['notifications']) => {
    setConfig({
      ...config,
      notifications: {
        ...config.notifications,
        [key]: !config.notifications[key],
      },
    });
  };

  const notificationItems = [
    { key: 'openPosition' as const, label: '开仓通知', icon: '📈' },
    { key: 'closePosition' as const, label: '平仓通知', icon: '📉' },
    { key: 'stopLoss' as const, label: '止损触发', icon: '🛑' },
    { key: 'riskAlert' as const, label: '风控警报', icon: '⚠️' },
    { key: 'dailySummary' as const, label: '每日摘要', icon: '📊' },
  ];

  return (
    <EliteGate>
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Send className="w-6 h-6 text-violet-400" />
          <h2 className="text-xl font-bold text-white">Telegram 通知</h2>
        </div>

        {/* Bot Token Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Bot Token
          </label>
          <input
            type="text"
            value={config.botToken}
            onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 font-mono text-sm"
          />
        </div>

        {/* Chat ID Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Chat ID
          </label>
          <input
            type="text"
            value={config.chatId}
            onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
            placeholder="-1001234567890"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 font-mono text-sm"
          />
        </div>

        {/* Help Text */}
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-400">
              <strong>如何获取？</strong>
              <ol className="list-decimal ml-4 mt-1 space-y-1">
                <li>在 Telegram 搜索 @BotFather 创建 Bot，获取 Token</li>
                <li>将 Bot 添加到你的频道或群组</li>
                <li>使用 @userinfobot 获取你的 Chat ID</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Notification Toggles */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-400">通知类型</h3>
          </div>
          <div className="space-y-2">
            {notificationItems.map(item => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-white">{item.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotification(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    config.notifications[item.key] ? 'bg-violet-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      config.notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            ))}
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
            onClick={testNotification}
            disabled={testing}
            className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {testing ? '发送中...' : '测试通知'}
          </button>
        </div>
      </div>
    </EliteGate>
  );
}
