'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, X, Zap, Activity } from 'lucide-react';
import {
  getDeployedStrategy, stopStrategy, removeStrategy,
  getSignalLogs, addSignalLog, evaluateSignal,
  addPricePoint, getPriceHistory,
  type AutoStrategy, type SignalLog
} from '@/lib/autoTrader';
import { openPosition } from '@/lib/tradingEngine';
import { getAccount } from '@/lib/storage';

interface AutoTraderPanelProps {
  currentPrice: number;
  onTradeComplete: () => void;
}

export default function AutoTraderPanel({ currentPrice, onTradeComplete }: AutoTraderPanelProps) {
  const [strategy, setStrategy] = useState<AutoStrategy | null>(null);
  const [logs, setLogs] = useState<SignalLog[]>([]);
  const [lastEval, setLastEval] = useState<string>('等待数据...');
  const [evalCount, setEvalCount] = useState(0);

  useEffect(() => {
    setStrategy(getDeployedStrategy());
    setLogs(getSignalLogs());
  }, []);

  useEffect(() => {
    if (!strategy?.active || !currentPrice) return;

    addPricePoint(currentPrice);
    const history = getPriceHistory();
    const prices = history.map(h => h.price);

    if (prices.length < 30) {
      setLastEval(`收集数据中... (${prices.length}/30)`);
      return;
    }

    const result = evaluateSignal(strategy, prices);
    setLastEval(result.reason);
    setEvalCount(c => c + 1);

    if (result.signal !== 'none') {
      const account = getAccount();
      const maxPos = (strategy.risk.maxPosition / 100) * account.balance;
      const size = Math.min(maxPos, account.balance * 0.2);

      if (size < 10) {
        addSignalLog({ time: Date.now(), type: 'info', message: `信号: ${result.reason}，余额不足`, executed: false });
        setLogs(getSignalLogs());
        return;
      }

      const slPct = strategy.risk.stopLoss / 100;
      const tpPct = strategy.risk.takeProfit / 100;

      const tradeResult = openPosition({
        side: result.signal === 'buy' ? 'long' : 'short',
        size,
        leverage: 1,
        currentPrice,
        stopLoss: result.signal === 'buy' ? currentPrice * (1 - slPct) : currentPrice * (1 + slPct),
        takeProfit: result.signal === 'buy' ? currentPrice * (1 + tpPct) : currentPrice * (1 - tpPct),
      });

      addSignalLog({
        time: Date.now(),
        type: result.signal,
        message: `${result.reason} → ${tradeResult.success ? '已执行' : tradeResult.message}`,
        price: currentPrice,
        executed: tradeResult.success,
      });
      setLogs(getSignalLogs());
      if (tradeResult.success) onTradeComplete();
    }
  }, [currentPrice, strategy?.active]);

  if (!strategy) return null;

  const handleToggle = () => {
    if (strategy.active) {
      stopStrategy();
    } else {
      strategy.active = true;
      localStorage.setItem('tc-auto-strategy', JSON.stringify(strategy));
    }
    setStrategy(getDeployedStrategy());
  };

  const handleRemove = () => {
    removeStrategy();
    setStrategy(null);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm">自动交易</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            strategy.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
          }`}>
            {strategy.active ? '运行中' : '已暂停'}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={handleToggle} className="p-1.5 rounded-lg hover:bg-gray-700 transition">
            {strategy.active ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-green-400" />}
          </button>
          <button onClick={handleRemove} className="p-1.5 rounded-lg hover:bg-gray-700 transition">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
        <div className="text-xs text-gray-400 mb-1">策略</div>
        <div className="font-semibold text-sm">{strategy.strategyName}</div>
        <div className="text-xs text-gray-500 mt-1">
          止损 {strategy.risk.stopLoss}% | 止盈 {strategy.risk.takeProfit}% | 最大仓位 {strategy.risk.maxPosition}%
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs">
        <Activity className="w-3 h-3 text-gray-500" />
        <span className="text-gray-400">{lastEval}</span>
        <span className="text-gray-600 ml-auto">#{evalCount}</span>
      </div>

      {logs.length > 0 && (
        <div className="max-h-32 overflow-y-auto space-y-1">
          {logs.slice().reverse().slice(0, 10).map((log, i) => (
            <div key={i} className={`text-xs px-2 py-1 rounded ${
              log.type === 'buy' ? 'bg-green-900/20 text-green-400' :
              log.type === 'sell' ? 'bg-red-900/20 text-red-400' :
              'bg-gray-800/50 text-gray-500'
            }`}>
              <span className="font-mono">{new Date(log.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
              {' '}{log.message}
              {log.price && <span className="text-gray-500"> @${log.price.toLocaleString()}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
