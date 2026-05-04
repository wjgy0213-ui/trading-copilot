'use client';

import { DollarSign, TrendingUp, Percent, AlertCircle, RotateCcw, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Account } from '@/lib/types';
import { resetAccount } from '@/lib/storage';
import { useI18n } from '@/lib/i18n';
import { calculateEquity } from '@/lib/tradingEngine';
import { analyzePerformance, getRecentPerformanceSummary } from '@/lib/tradeAnalyzer';
import { formatLocaleCurrency } from '@/lib/i18n-helpers';
import RankBadge from './RankBadge';

interface AccountPanelProps {
  account: Account;
  currentPrice: number;
}

export default function AccountPanel({ account, currentPrice }: AccountPanelProps) {
  const { t, locale } = useI18n();
  const equity = calculateEquity(account, currentPrice);
  const initialBalance = 10000;
  const totalReturn = ((equity - initialBalance) / initialBalance) * 100;
  
  // 交易分析
  const analysis = analyzePerformance(account.closedTrades, locale);
  const recentSummary = getRecentPerformanceSummary(account.closedTrades, 7, locale);

  const handleReset = () => {
    const confirmed = confirm(t('account_panel.confirm_reset'));
    if (confirmed) {
      resetAccount();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Rank Badge */}
      <RankBadge 
        totalTrades={account.closedTrades.length} 
        winRate={account.winRate} 
        showProgress={true}
      />

      {/* Account Summary */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">{t('account_panel.overview')}</h2>
        
        <div className="space-y-4">
          <StatItem
            icon={<DollarSign className="w-5 h-5" />}
            label={t('account_panel.balance')}
            value={`$${account.balance.toFixed(2)}`}
            valueColor="text-blue-400"
          />
          
          <StatItem
            icon={<TrendingUp className="w-5 h-5" />}
            label={t('account_panel.equity')}
            value={`$${equity.toFixed(2)}`}
            valueColor={equity >= initialBalance ? 'text-green-400' : 'text-red-400'}
          />
          
          <StatItem
            icon={<Percent className="w-5 h-5" />}
            label={t('account_panel.total_return')}
            value={`${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`}
            valueColor={totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}
          />

          <div className="pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">{t('account_panel.initial_balance')}</div>
            <div className="text-lg font-semibold">{formatLocaleCurrency(initialBalance, locale, 'USD', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Trading Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">{t('account_panel.trading_stats')}</h2>
        
        <div className="space-y-4">
          <StatItem
            icon={<TrendingUp className="w-5 h-5" />}
            label={t('account_panel.total_pnl')}
            value={`${account.totalPnl >= 0 ? '+' : ''}$${account.totalPnl.toFixed(2)}`}
            valueColor={account.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          
          <StatItem
            icon={<Percent className="w-5 h-5" />}
            label={t('account_panel.win_rate')}
            value={account.closedTrades.length > 0 ? `${(account.winRate * 100).toFixed(1)}%` : '-'}
            valueColor="text-blue-400"
          />
          
          <StatItem
            icon={<AlertCircle className="w-5 h-5" />}
            label={t('account_panel.max_drawdown')}
            value={account.maxDrawdown > 0 ? `${(account.maxDrawdown * 100).toFixed(1)}%` : '-'}
            valueColor={account.maxDrawdown > 0.2 ? 'text-red-400' : 'text-yellow-400'}
          />

          <div className="pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">{t('account_panel.open_positions')}</div>
              <div className="text-lg font-semibold">{account.positions.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">{t('account_panel.closed_trades')}</div>
              <div className="text-lg font-semibold">{account.closedTrades.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      {analysis.totalTrades > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            {t('account_panel.performance')}
          </h2>
          
          {/* 最近表现 */}
          <div className="mb-4 pb-4 border-b border-gray-700">
            <div className="text-sm text-gray-400 mb-1">{t('account_panel.recent_7d')}</div>
            <div className="text-sm text-gray-300">{recentSummary}</div>
          </div>

          {/* 关键指标 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{t('account_panel.rr_ratio')}</div>
              <div className={`text-xl font-bold ${analysis.avgRR >= 1.5 ? 'text-green-400' : analysis.avgRR >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                {analysis.avgRR.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{t('account_panel.profit_factor')}</div>
              <div className={`text-xl font-bold ${analysis.profitFactor >= 1.5 ? 'text-green-400' : analysis.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                {analysis.profitFactor === Infinity ? '∞' : analysis.profitFactor.toFixed(2)}
              </div>
            </div>
          </div>

          {/* 优化建议 */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-purple-300">{t('account_panel.suggestions')}</h3>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 策略优化按钮 */}
          {(analysis.winRate < 50 || analysis.avgRR < 1.5) && (
            <Link
              href="/strategy"
              className="mt-4 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-lg transition font-medium text-sm">
              <TrendingUp className="w-4 h-4" />
              {t('account_panel.optimize_strategy')} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* 新手建议（无交易记录时显示） */}
      {analysis.totalTrades === 0 && (
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-700/50">
          <h3 className="font-semibold mb-3 text-blue-300">{t('account_panel.beginner_guide')}</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>{t('account_panel.tip1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>{t('account_panel.tip2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>{t('account_panel.tip3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">•</span>
              <span>{t('account_panel.tip4')}</span>
            </li>
          </ul>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 rounded-lg transition"
      >
        <RotateCcw className="w-4 h-4" />
        {t('account_panel.reset')}
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
