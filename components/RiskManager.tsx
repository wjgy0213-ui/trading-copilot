'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, XCircle, History } from 'lucide-react';
import EliteGate from './EliteGate';
import { useI18n } from '@/lib/i18n';

interface RiskSettings {
  maxRiskPerTrade: number; // %
  maxDailyLoss: number; // %
  maxPositions: number;
  maxLeverage: number;
}

interface RiskEvent {
  timestamp: number;
  type: 'warning' | 'trigger' | 'emergency';
  message: string;
}

const DEFAULT_SETTINGS: RiskSettings = {
  maxRiskPerTrade: 2,
  maxDailyLoss: 5,
  maxPositions: 3,
  maxLeverage: 10,
};

export default function RiskManager() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<RiskSettings>(DEFAULT_SETTINGS);
  const [currentRisk, setCurrentRisk] = useState({
    riskLevel: 'safe' as 'safe' | 'warning' | 'danger',
    dailyLoss: 0,
    openPositions: 0,
    avgLeverage: 1,
  });
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tc-risk-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse risk settings', e);
      }
    }

    const savedEvents = localStorage.getItem('tc-risk-events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        console.error('Failed to parse risk events', e);
      }
    }

    // 模拟实时风控状态
    const interval = setInterval(() => {
      const randomLoss = Math.random() * 3;
      const randomPositions = Math.floor(Math.random() * 2);
      const randomLeverage = 1 + Math.random() * 5;

      let level: 'safe' | 'warning' | 'danger' = 'safe';
      if (randomLoss > 2 || randomPositions > 2 || randomLeverage > 8) {
        level = 'warning';
      }
      if (randomLoss > 4 || randomPositions > 3 || randomLeverage > 12) {
        level = 'danger';
      }

      setCurrentRisk({
        riskLevel: level,
        dailyLoss: randomLoss,
        openPositions: randomPositions,
        avgLeverage: randomLeverage,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('tc-risk-settings', JSON.stringify(settings));
    addEvent('warning', t('risk.settings_updated'));
  };

  const addEvent = (type: RiskEvent['type'], message: string) => {
    const newEvent: RiskEvent = {
      timestamp: Date.now(),
      type,
      message,
    };
    const updated = [newEvent, ...events].slice(0, 10);
    setEvents(updated);
    localStorage.setItem('tc-risk-events', JSON.stringify(updated));
  };

  const emergencyStop = async () => {
    if (!confirm(t('risk.confirm_emergency'))) return;

    setEmergencyLoading(true);
    addEvent('emergency', t('risk.emergency_exec'));

    // 模拟平仓操作
    await new Promise(resolve => setTimeout(resolve, 2000));

    setEmergencyLoading(false);
    addEvent('trigger', t('risk.emergency_done'));
    alert(t('risk.emergency_sim'));
  };

  const getRiskColor = () => {
    switch (currentRisk.riskLevel) {
      case 'safe': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'danger': return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const getRiskIcon = () => {
    switch (currentRisk.riskLevel) {
      case 'safe': return '🟢';
      case 'warning': return '🟡';
      case 'danger': return '🔴';
    }
  };

  return (
    <EliteGate>
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-violet-400" />
          <h2 className="text-xl font-bold text-white">{t('risk.title')}</h2>
        </div>

        {/* Current Risk Status */}
        <div className={`mb-6 p-4 rounded-lg border ${getRiskColor()}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getRiskIcon()}</span>
              <span className="font-bold">
                {currentRisk.riskLevel === 'safe' && t('risk.safe')}
                {currentRisk.riskLevel === 'warning' && t('risk.warning')}
                {currentRisk.riskLevel === 'danger' && t('risk.danger')}
              </span>
            </div>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-gray-400">{t('risk.daily_loss')}</div>
              <div className="font-bold">{currentRisk.dailyLoss.toFixed(2)}%</div>
            </div>
            <div>
              <div className="text-gray-400">{t('risk.position_count')}</div>
              <div className="font-bold">{currentRisk.openPositions}</div>
            </div>
            <div>
              <div className="text-gray-400">{t('risk.avg_leverage')}</div>
              <div className="font-bold">{currentRisk.avgLeverage.toFixed(1)}x</div>
            </div>
          </div>
        </div>

        {/* Risk Settings */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t('risk.max_risk_per_trade')}
            </label>
            <input
              type="number"
              value={settings.maxRiskPerTrade}
              onChange={(e) => setSettings({ ...settings, maxRiskPerTrade: parseFloat(e.target.value) || 0 })}
              min="0.1"
              max="10"
              step="0.1"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t('risk.max_daily_loss')}
            </label>
            <input
              type="number"
              value={settings.maxDailyLoss}
              onChange={(e) => setSettings({ ...settings, maxDailyLoss: parseFloat(e.target.value) || 0 })}
              min="1"
              max="20"
              step="0.5"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t('risk.max_positions')}
            </label>
            <input
              type="number"
              value={settings.maxPositions}
              onChange={(e) => setSettings({ ...settings, maxPositions: parseInt(e.target.value) || 1 })}
              min="1"
              max="10"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t('risk.max_leverage')}
            </label>
            <input
              type="number"
              value={settings.maxLeverage}
              onChange={(e) => setSettings({ ...settings, maxLeverage: parseInt(e.target.value) || 1 })}
              min="1"
              max="100"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={saveSettings}
            className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all"
          >
            {t('risk.save_settings')}
          </button>
          <button
            onClick={emergencyStop}
            disabled={emergencyLoading}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            {emergencyLoading ? t('risk.executing') : t('risk.emergency_stop')}
          </button>
        </div>

        {/* Event History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-400">{t('risk.event_history')}</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-4">{t('risk.no_events')}</div>
            ) : (
              events.map((event, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-xs ${
                    event.type === 'emergency'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : event.type === 'trigger'
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex-1">{event.message}</span>
                    <span className="text-gray-500 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </EliteGate>
  );
}
