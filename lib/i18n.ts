'use client';
import { useState, useCallback, useSyncExternalStore } from 'react';

export type Locale = 'zh' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  zh: {
    'nav.home': '首页', 'nav.trade': '交易', 'nav.dashboard': '仪表盘',
    'nav.backtest': '回测', 'nav.news': '资讯', 'nav.learn': '课程', 'nav.history': '历史',
    'home.title': '交易陪练', 'home.subtitle': '从韭菜到交易者的第一步',
    'home.desc': '零风险模拟交易，教练实时评分，帮你建立交易纪律。',
    'home.start': '开始交易', 'home.learn': '学习课程',
    'trade.title': '模拟交易', 'trade.buy': '做多', 'trade.sell': '做空',
    'trade.close': '平仓', 'trade.balance': '余额', 'trade.pnl': '盈亏',
    'trade.leverage': '杠杆', 'trade.stoploss': '止损', 'trade.takeprofit': '止盈', 'trade.amount': '金额',
    'coach.title': '教练反馈', 'coach.score': '评分', 'coach.feedback': '反馈',
    'dashboard.title': '市场仪表盘', 'dashboard.btcRisk': 'BTC 风险指数',
    'dashboard.ethRisk': 'ETH 风险指数', 'dashboard.totalRisk': '总市场风险',
    'dashboard.mvrvZScore': 'MVRV Z-Score', 'dashboard.macroRisk': '宏观衰退风险',
    'dashboard.cryptoRisk': '综合加密风险', 'dashboard.low': '低', 'dashboard.medium': '中',
    'dashboard.high': '高', 'dashboard.lastUpdate': '最后更新',
    'backtest.title': '策略回测', 'backtest.strategy': '策略', 'backtest.coin': '币种',
    'backtest.timeframe': '时间框架', 'backtest.period': '回测周期',
    'backtest.run': '开始回测', 'backtest.running': '回测中...',
    'backtest.winRate': '胜率', 'backtest.profitFactor': '盈亏比',
    'backtest.maxDrawdown': '最大回撤', 'backtest.totalReturn': '总收益',
    'backtest.totalTrades': '总交易数', 'backtest.equityCurve': '资金曲线',
    'backtest.tradeList': '交易列表', 'backtest.days': '天',
    'backtest.emaCross': 'EMA双均线交叉', 'backtest.rsiReversal': 'RSI超卖反弹',
    'backtest.breakout': '突破回踩',
    'news.title': '市场资讯', 'news.all': '全部', 'news.market': '市场数据',
    'news.macro': '宏观政策', 'news.onchain': '链上动态', 'news.trending': '热门话题',
    'news.bullish': '利好', 'news.bearish': '利空', 'news.neutral': '中性',
    'history.title': '交易历史', 'learn.title': '交易课程',
    'common.loading': '加载中...', 'common.error': '出错了', 'common.noData': '暂无数据',
  },
  en: {
    'nav.home': 'Home', 'nav.trade': 'Trade', 'nav.dashboard': 'Dashboard',
    'nav.backtest': 'Backtest', 'nav.news': 'News', 'nav.learn': 'Learn', 'nav.history': 'History',
    'home.title': 'Trading Coach', 'home.subtitle': 'Your first step from beginner to trader',
    'home.desc': 'Zero-risk simulated trading with real-time coach feedback.',
    'home.start': 'Start Trading', 'home.learn': 'Learn Trading',
    'trade.title': 'Sim Trading', 'trade.buy': 'Long', 'trade.sell': 'Short',
    'trade.close': 'Close', 'trade.balance': 'Balance', 'trade.pnl': 'PnL',
    'trade.leverage': 'Leverage', 'trade.stoploss': 'Stop Loss', 'trade.takeprofit': 'Take Profit', 'trade.amount': 'Amount',
    'coach.title': 'Coach Feedback', 'coach.score': 'Score', 'coach.feedback': 'Feedback',
    'dashboard.title': 'Market Dashboard', 'dashboard.btcRisk': 'BTC Risk',
    'dashboard.ethRisk': 'ETH Risk', 'dashboard.totalRisk': 'Total Market Risk',
    'dashboard.mvrvZScore': 'MVRV Z-Score', 'dashboard.macroRisk': 'Macro Recession Risk',
    'dashboard.cryptoRisk': 'Crypto Risk Index', 'dashboard.low': 'Low', 'dashboard.medium': 'Med',
    'dashboard.high': 'High', 'dashboard.lastUpdate': 'Last updated',
    'backtest.title': 'Strategy Backtest', 'backtest.strategy': 'Strategy', 'backtest.coin': 'Coin',
    'backtest.timeframe': 'Timeframe', 'backtest.period': 'Period',
    'backtest.run': 'Run Backtest', 'backtest.running': 'Running...',
    'backtest.winRate': 'Win Rate', 'backtest.profitFactor': 'Profit Factor',
    'backtest.maxDrawdown': 'Max Drawdown', 'backtest.totalReturn': 'Total Return',
    'backtest.totalTrades': 'Total Trades', 'backtest.equityCurve': 'Equity Curve',
    'backtest.tradeList': 'Trade List', 'backtest.days': 'days',
    'backtest.emaCross': 'EMA Crossover', 'backtest.rsiReversal': 'RSI Reversal',
    'backtest.breakout': 'Breakout Pullback',
    'news.title': 'Market News', 'news.all': 'All', 'news.market': 'Market',
    'news.macro': 'Macro', 'news.onchain': 'On-chain', 'news.trending': 'Trending',
    'news.bullish': 'Bullish', 'news.bearish': 'Bearish', 'news.neutral': 'Neutral',
    'history.title': 'Trade History', 'learn.title': 'Trading Course',
    'common.loading': 'Loading...', 'common.error': 'Error', 'common.noData': 'No data',
  },
};

// Simple global state without zustand
let currentLocale: Locale = 'zh';
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Locale {
  return currentLocale;
}

export function useI18n() {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setLocale = useCallback((l: Locale) => {
    currentLocale = l;
    listeners.forEach(cb => cb());
  }, []);

  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] || translations.zh[key] || key;
  }, [locale]);

  return { locale, setLocale, t };
}
