'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { openPosition } from '@/lib/tradingEngine';
import { scoreEntry } from '@/lib/aiScoring';
import { getAccount, saveAIScore } from '@/lib/storage';
import { PositionSide } from '@/lib/types';

interface TradingPanelProps {
  currentPrice: number;
  onTradeComplete: () => void;
}

export default function TradingPanel({ currentPrice, onTradeComplete }: TradingPanelProps) {
  const [side, setSide] = useState<PositionSide>('long');
  const [size, setSize] = useState<number>(100);
  const [leverage, setLeverage] = useState<number>(1);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [showAIFeedback, setShowAIFeedback] = useState(false);

  const handleOpenPosition = () => {
    const result = openPosition({
      side,
      size,
      leverage,
      currentPrice,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    if (result.trade) {
      // 生成AI评分
      const account = getAccount();
      const aiScore = scoreEntry(result.trade, account);
      saveAIScore(aiScore);
      
      // 显示反馈
      alert(result.message + '\n\nAI教练评分：' + aiScore.entryScore + '/100\n' + aiScore.feedback.entry.join('\n'));
      setShowAIFeedback(true);
    }

    // 重置表单
    setSize(100);
    setLeverage(1);
    setStopLoss('');
    setTakeProfit('');
    
    onTradeComplete();
  };

  const calculatePotentialPnL = () => {
    if (!stopLoss && !takeProfit) return null;
    
    const sl = stopLoss ? parseFloat(stopLoss) : 0;
    const tp = takeProfit ? parseFloat(takeProfit) : 0;
    
    const potentialLoss = sl ? ((side === 'long' ? currentPrice - sl : sl - currentPrice) / currentPrice) * size * leverage : 0;
    const potentialProfit = tp ? ((side === 'long' ? tp - currentPrice : currentPrice - tp) / currentPrice) * size * leverage : 0;
    
    return { potentialLoss: Math.abs(potentialLoss), potentialProfit };
  };

  const pnl = calculatePotentialPnL();

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6">开仓交易</h2>

      {/* Direction */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-3">交易方向</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSide('long')}
            className={`flex items-center justify-center gap-2 py-4 rounded-lg font-semibold transition ${
              side === 'long'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            做多 (看涨)
          </button>
          <button
            onClick={() => setSide('short')}
            className={`flex items-center justify-center gap-2 py-4 rounded-lg font-semibold transition ${
              side === 'short'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
            做空 (看跌)
          </button>
        </div>
      </div>

      {/* Size */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          投入金额 (USD)
        </label>
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(Math.max(1, parseFloat(e.target.value) || 0))}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="1"
          step="10"
        />
      </div>

      {/* Leverage */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          杠杆倍数: {leverage}x
        </label>
        <input
          type="range"
          value={leverage}
          onChange={(e) => setLeverage(parseInt(e.target.value))}
          min="1"
          max="10"
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1x</span>
          <span>5x</span>
          <span>10x</span>
        </div>
      </div>

      {/* Stop Loss */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          止损价格 (可选但强烈建议)
        </label>
        <input
          type="number"
          value={stopLoss}
          onChange={(e) => setStopLoss(e.target.value)}
          placeholder={`建议: ${side === 'long' ? (currentPrice * 0.95).toFixed(2) : (currentPrice * 1.05).toFixed(2)}`}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="0.01"
        />
      </div>

      {/* Take Profit */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          止盈价格 (可选)
        </label>
        <input
          type="number"
          value={takeProfit}
          onChange={(e) => setTakeProfit(e.target.value)}
          placeholder={`建议: ${side === 'long' ? (currentPrice * 1.1).toFixed(2) : (currentPrice * 0.9).toFixed(2)}`}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          step="0.01"
        />
      </div>

      {/* Potential P&L */}
      {pnl && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">预估盈亏</div>
          <div className="flex justify-between">
            {stopLoss && (
              <div className="text-red-400">
                <div className="text-xs">最大亏损</div>
                <div className="font-semibold">-${pnl.potentialLoss.toFixed(2)}</div>
              </div>
            )}
            {takeProfit && (
              <div className="text-green-400">
                <div className="text-xs">目标盈利</div>
                <div className="font-semibold">+${pnl.potentialProfit.toFixed(2)}</div>
              </div>
            )}
          </div>
          {stopLoss && takeProfit && (
            <div className="mt-2 text-xs text-gray-400">
              风险回报比: 1:{(pnl.potentialProfit / pnl.potentialLoss).toFixed(2)}
            </div>
          )}
        </div>
      )}

      {/* Warning */}
      {!stopLoss && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200">
            <strong>风险提示：</strong> 未设置止损可能导致巨额亏损。强烈建议设置止损价格！
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleOpenPosition}
        className={`w-full py-4 rounded-lg font-bold text-lg transition ${
          side === 'long'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {side === 'long' ? '开多单' : '开空单'}
      </button>
    </div>
  );
}
