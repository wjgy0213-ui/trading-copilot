'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp, Target, Zap, Code, ChevronDown, ChevronUp, 
  Play, TrendingDown, DollarSign, Activity, Clock 
} from 'lucide-react';
import {
  STRATEGY_TEMPLATES,
  StrategyType,
  TradingParams,
  DEFAULT_TRADING_PARAMS,
  BacktestConfig,
  DEFAULT_BACKTEST_CONFIG,
  generateStrategyCode,
  generateStrategyDescription,
} from '@/lib/strategies';
import { runBacktest, BacktestResult, ASSETS, TIMEFRAMES, PERIODS } from '@/lib/backtestEngine';

export default function StrategyPage() {
  // 策略选择
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType>('ema-cross');
  
  // 策略参数
  const [strategyParams, setStrategyParams] = useState<Record<string, number>>({
    fastPeriod: 9,
    slowPeriod: 21,
    rsiPeriod: 14,
    oversold: 30,
    overbought: 70,
    period: 20,
    stdDev: 2,
    signalPeriod: 9,
  });
  
  // 交易参数
  const [tradingParams, setTradingParams] = useState<TradingParams>(DEFAULT_TRADING_PARAMS);
  
  // 回测配置
  const [backtestConfig, setBacktestConfig] = useState<BacktestConfig>(DEFAULT_BACKTEST_CONFIG);
  
  // UI 状态
  const [showCode, setShowCode] = useState(true);
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  
  // 当前策略模板
  const currentTemplate = STRATEGY_TEMPLATES.find(t => t.id === selectedStrategy);
  
  // 生成策略代码
  const strategyCode = useMemo(() => {
    return generateStrategyCode(selectedStrategy, strategyParams, tradingParams);
  }, [selectedStrategy, strategyParams, tradingParams]);
  
  // 生成策略描述
  const strategyDescription = useMemo(() => {
    return generateStrategyDescription(selectedStrategy, strategyParams, tradingParams);
  }, [selectedStrategy, strategyParams, tradingParams]);
  
  // 运行回测
  const handleRunBacktest = async () => {
    setIsBacktesting(true);
    try {
      const result = await runBacktest(
        selectedStrategy,
        tradingParams.symbol,
        tradingParams.timeframe,
        backtestConfig.period,
        {
          ...strategyParams,
          stopLoss: tradingParams.stopLoss,
          takeProfit: tradingParams.takeProfit,
        },
        backtestConfig
      );
      setBacktestResult(result);
    } catch (error) {
      console.error('回测失败:', error);
      alert('回测失败，请检查参数或稍后重试');
    } finally {
      setIsBacktesting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 py-6 px-4">
      <div className="container mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            策略工坊
          </h1>
          <p className="text-gray-400 text-sm">构建、测试、优化你的交易策略</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左侧：策略模板选择 */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-4 sticky top-20">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-200">
                <Target className="w-4 h-4 text-emerald-400" />
                策略模板
              </h2>
              
              <div className="space-y-2">
                {STRATEGY_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedStrategy(template.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedStrategy === template.id
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：参数编辑器 + 预览 + 回测 */}
          <div className="lg:col-span-9 space-y-4">
            {/* 策略参数 */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4 text-gray-200">策略参数</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTemplate?.parameters.map(param => (
                  <div key={param.id}>
                    <label className="block text-xs text-gray-400 mb-2">
                      {param.label} {param.unit && <span className="text-gray-600">({param.unit})</span>}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={strategyParams[param.id] || param.default}
                        onChange={e => setStrategyParams({
                          ...strategyParams,
                          [param.id]: parseFloat(e.target.value),
                        })}
                        className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <input
                        type="number"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={strategyParams[param.id] || param.default}
                        onChange={e => setStrategyParams({
                          ...strategyParams,
                          [param.id]: parseFloat(e.target.value),
                        })}
                        className="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white text-center"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 交易设置 */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4 text-gray-200">交易设置</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* 币种 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">币种</label>
                  <select
                    value={tradingParams.symbol}
                    onChange={e => setTradingParams({ ...tradingParams, symbol: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    {ASSETS.map(a => (
                      <option key={a.id} value={a.id}>{a.symbol}</option>
                    ))}
                  </select>
                </div>

                {/* 时间框架 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">时间框架</label>
                  <select
                    value={tradingParams.timeframe}
                    onChange={e => setTradingParams({ ...tradingParams, timeframe: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    {TIMEFRAMES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* 止损 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">止损%</label>
                  <input
                    type="number"
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={tradingParams.stopLoss}
                    onChange={e => setTradingParams({ ...tradingParams, stopLoss: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                {/* 止盈 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">止盈%</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={1}
                    value={tradingParams.takeProfit}
                    onChange={e => setTradingParams({ ...tradingParams, takeProfit: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                {/* 最大仓位 */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">最大仓位%</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    step={10}
                    value={tradingParams.maxPosition}
                    onChange={e => setTradingParams({ ...tradingParams, maxPosition: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              </div>
            </div>

            {/* 策略描述 */}
            <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-800/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-emerald-300 mb-1">策略逻辑</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{strategyDescription}</p>
                </div>
              </div>
            </div>

            {/* 策略代码预览 */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowCode(!showCode)}
                className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-gray-200 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-400" />
                  策略伪代码
                </div>
                {showCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showCode && (
                <div className="px-5 pb-5">
                  <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 font-mono overflow-x-auto">
                    {strategyCode}
                  </pre>
                </div>
              )}
            </div>

            {/* 回测配置 */}
            <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-4 text-gray-200">回测配置</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">回测周期</label>
                  <select
                    value={backtestConfig.period}
                    onChange={e => setBacktestConfig({ ...backtestConfig, period: parseInt(e.target.value) as any })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  >
                    {PERIODS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">初始资金</label>
                  <input
                    type="number"
                    min={1000}
                    max={1000000}
                    step={1000}
                    value={backtestConfig.initialCapital}
                    onChange={e => setBacktestConfig({ ...backtestConfig, initialCapital: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">手续费%</label>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={backtestConfig.fee}
                    onChange={e => setBacktestConfig({ ...backtestConfig, fee: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">滑点%</label>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={backtestConfig.slippage}
                    onChange={e => setBacktestConfig({ ...backtestConfig, slippage: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleRunBacktest}
                disabled={isBacktesting}
                className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isBacktesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    运行中...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    运行回测
                  </>
                )}
              </button>
            </div>

            {/* 回测结果 */}
            {backtestResult && (
              <div className="space-y-4">
                {/* 核心指标卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <MetricCard
                    icon={DollarSign}
                    label="总收益"
                    value={`${backtestResult.totalReturn >= 0 ? '+' : ''}${backtestResult.totalReturn.toFixed(2)}%`}
                    color={backtestResult.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}
                  />
                  <MetricCard
                    icon={Target}
                    label="胜率"
                    value={`${backtestResult.winRate.toFixed(1)}%`}
                    color={backtestResult.winRate >= 50 ? 'text-emerald-400' : 'text-yellow-400'}
                  />
                  <MetricCard
                    icon={TrendingUp}
                    label="盈亏比"
                    value={backtestResult.profitLossRatio.toFixed(2)}
                    color={backtestResult.profitLossRatio >= 1 ? 'text-emerald-400' : 'text-yellow-400'}
                  />
                  <MetricCard
                    icon={TrendingDown}
                    label="最大回撤"
                    value={`${backtestResult.maxDrawdown.toFixed(2)}%`}
                    color="text-red-400"
                  />
                  <MetricCard
                    icon={Activity}
                    label="夏普比率"
                    value={backtestResult.sharpeRatio.toFixed(2)}
                    color={backtestResult.sharpeRatio >= 1 ? 'text-emerald-400' : 'text-gray-400'}
                  />
                  <MetricCard
                    icon={Zap}
                    label="交易次数"
                    value={backtestResult.totalTrades.toString()}
                    color="text-blue-400"
                  />
                </div>

                {/* 资金曲线 */}
                <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-4 text-gray-200">资金曲线</h3>
                  <EquityCurveChart data={backtestResult.equityCurve} />
                </div>

                {/* 交易明细 */}
                <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold mb-4 text-gray-200">交易明细（最近10笔）</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {backtestResult.trades
                      .filter(t => t.pnl !== undefined)
                      .slice(-10)
                      .reverse()
                      .map(trade => (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded font-medium ${
                              trade.type === 'buy' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.type === 'buy' ? '买入' : '卖出'}
                            </div>
                            <div className="text-gray-400">
                              {new Date(trade.timestamp).toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                            {trade.holdingTime && (
                              <div className="text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatHoldingTime(trade.holdingTime)}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-gray-300">
                              ${trade.price.toFixed(2)}
                            </div>
                            {trade.pnlPercent !== undefined && (
                              <div className={`font-mono font-bold min-w-[60px] text-right ${
                                trade.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 指标卡片组件
function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  color: string;
}) {
  return (
    <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-3">
      <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className={`text-lg font-mono font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}

// 资金曲线图组件（SVG）
function EquityCurveChart({ data }: { data: { timestamp: number; equity: number }[] }) {
  if (data.length === 0) return null;
  
  const width = 800;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // 计算比例
  const minEquity = Math.min(...data.map(d => d.equity));
  const maxEquity = Math.max(...data.map(d => d.equity));
  const minTime = data[0].timestamp;
  const maxTime = data[data.length - 1].timestamp;
  
  const xScale = (timestamp: number) => 
    padding.left + ((timestamp - minTime) / (maxTime - minTime)) * chartWidth;
  const yScale = (equity: number) => 
    padding.top + chartHeight - ((equity - minEquity) / (maxEquity - minEquity)) * chartHeight;
  
  // 生成路径
  const pathData = data.map((d, i) => {
    const x = xScale(d.timestamp);
    const y = yScale(d.equity);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Y轴刻度
  const yTicks = [minEquity, (minEquity + maxEquity) / 2, maxEquity];
  
  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* 网格线 */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={yScale(tick)}
              x2={width - padding.right}
              y2={yScale(tick)}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <text
              x={padding.left - 10}
              y={yScale(tick)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-[10px] fill-gray-500"
            >
              ${tick.toFixed(0)}
            </text>
          </g>
        ))}
        
        {/* 资金曲线 */}
        <path
          d={pathData}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />
        
        {/* 起点和终点标记 */}
        <circle cx={xScale(data[0].timestamp)} cy={yScale(data[0].equity)} r="3" fill="#10b981" />
        <circle cx={xScale(data[data.length - 1].timestamp)} cy={yScale(data[data.length - 1].equity)} r="3" fill="#10b981" />
        
        {/* X轴标签（首尾） */}
        <text
          x={xScale(minTime)}
          y={height - 5}
          textAnchor="start"
          className="text-[10px] fill-gray-500"
        >
          {new Date(minTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
        </text>
        <text
          x={xScale(maxTime)}
          y={height - 5}
          textAnchor="end"
          className="text-[10px] fill-gray-500"
        >
          {new Date(maxTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
        </text>
      </svg>
    </div>
  );
}

// 格式化持仓时间
function formatHoldingTime(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天`;
  if (hours > 0) return `${hours}小时`;
  return `${Math.floor(ms / (1000 * 60))}分钟`;
}
