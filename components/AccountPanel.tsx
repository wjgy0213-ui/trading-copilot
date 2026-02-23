'use client';

import { DollarSign, TrendingUp, Percent, AlertCircle, RotateCcw } from 'lucide-react';
import { Account } from '@/lib/types';
import { resetAccount } from '@/lib/storage';
import { calculateEquity } from '@/lib/tradingEngine';

interface AccountPanelProps {
  account: Account;
  currentPrice: number;
}

export default function AccountPanel({ account, currentPrice }: AccountPanelProps) {
  const equity = calculateEquity(account, currentPrice);
  const totalReturn = ((equity - 500) / 500) * 100;

  const handleReset = () => {
    const confirmed = confirm(
      '确定要重置账户吗？所有交易记录和AI评分将被清空，无法恢复！'
    );
    if (confirmed) {
      resetAccount();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Summary */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">账户总览</h2>
        
        <div className="space-y-4">
          <StatItem
            icon={<DollarSign className="w-5 h-5" />}
            label="可用余额"
            value={`$${account.balance.toFixed(2)}`}
            valueColor="text-blue-400"
          />
          
          <StatItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="总权益"
            value={`$${equity.toFixed(2)}`}
            valueColor={equity >= 500 ? 'text-green-400' : 'text-red-400'}
          />
          
          <StatItem
            icon={<Percent className="w-5 h-5" />}
            label="总收益率"
            value={`${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`}
            valueColor={totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}
          />

          <div className="pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">初始资金</div>
            <div className="text-lg font-semibold">$500.00</div>
          </div>
        </div>
      </div>

      {/* Trading Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">交易统计</h2>
        
        <div className="space-y-4">
          <StatItem
            icon={<TrendingUp className="w-5 h-5" />}
            label="总盈亏"
            value={`${account.totalPnl >= 0 ? '+' : ''}$${account.totalPnl.toFixed(2)}`}
            valueColor={account.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          
          <StatItem
            icon={<Percent className="w-5 h-5" />}
            label="胜率"
            value={account.closedTrades.length > 0 ? `${(account.winRate * 100).toFixed(1)}%` : '-'}
            valueColor="text-blue-400"
          />
          
          <StatItem
            icon={<AlertCircle className="w-5 h-5" />}
            label="最大回撤"
            value={account.maxDrawdown > 0 ? `${(account.maxDrawdown * 100).toFixed(1)}%` : '-'}
            valueColor={account.maxDrawdown > 0.2 ? 'text-red-400' : 'text-yellow-400'}
          />

          <div className="pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">持仓中</div>
              <div className="text-lg font-semibold">{account.positions.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">已平仓</div>
              <div className="text-lg font-semibold">{account.closedTrades.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-700/50">
        <h3 className="font-semibold mb-3 text-blue-300">💡 交易建议</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>每笔交易都设置止损，保护本金</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>单笔仓位不超过总资金的20%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>新手建议使用1-3x杠杆</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            <span>关注AI评分，改进交易策略</span>
          </li>
        </ul>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-lg transition"
      >
        <RotateCcw className="w-4 h-4" />
        重置账户
      </button>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className={`text-lg font-semibold ${valueColor}`}>{value}</div>
    </div>
  );
}
