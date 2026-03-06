// 交易陪练AI - 类型定义

/** 仓位方向 */
export type PositionSide = 'long' | 'short';

/** 交易状态 */
export type TradeStatus = 'open' | 'closed';

/** 交易记录 */
export interface Trade {
  id: string;
  side: PositionSide;
  entryPrice: number;
  exitPrice?: number;
  size: number; // 投入金额（USD）
  leverage: number; // 杠杆倍数 (1-10x)
  stopLoss?: number;
  takeProfit?: number;
  status: TradeStatus;
  openedAt: number; // timestamp
  closedAt?: number; // timestamp
  pnl?: number; // 盈亏（USD）
  pnlPercent?: number; // 盈亏百分比
}

/** 虚拟账户 */
export interface Account {
  balance: number; // 可用余额
  equity: number; // 总权益（余额 + 未实现盈亏）
  positions: Trade[]; // 持仓
  closedTrades: Trade[]; // 已平仓交易
  totalPnl: number; // 累计盈亏
  winRate: number; // 胜率
  maxDrawdown: number; // 最大回撤
}

/** AI评分 */
export interface AIScore {
  tradeId: string;
  entryScore: number; // 入场评分 0-100
  exitScore?: number; // 出场评分 0-100
  overallScore?: number; // 综合评分 0-100
  feedback: {
    entry: string[]; // 入场建议
    exit?: string[]; // 出场建议
    overall?: string[]; // 综合建议
  };
  flags: {
    hasStopLoss: boolean;
    hasTakeProfit: boolean;
    positionSizeOk: boolean; // 仓位大小是否合理
    leverageOk: boolean; // 杠杆是否合理
    emotionalTrade?: boolean; // 是否情绪化交易
  };
}

/** 资产类别 */
export type AssetCategory = 'crypto' | 'stock';

/** 支持的交易对 */
export type TradingPair = 
  // Crypto
  | 'BTC/USD' | 'ETH/USD' | 'SOL/USD' | 'BNB/USD' | 'XRP/USD' | 'DOGE/USD' | 'ADA/USD' | 'AVAX/USD' | 'LINK/USD' | 'DOT/USD'
  // Mag 7
  | 'AAPL' | 'MSFT' | 'GOOGL' | 'AMZN' | 'NVDA' | 'META' | 'TSLA';

/** 交易对配置 */
export const TRADING_PAIRS: Record<TradingPair, { id: string; name: string; icon: string; category: AssetCategory }> = {
  // Crypto
  'BTC/USD': { id: 'bitcoin', name: '比特币', icon: '₿', category: 'crypto' },
  'ETH/USD': { id: 'ethereum', name: '以太坊', icon: 'Ξ', category: 'crypto' },
  'SOL/USD': { id: 'solana', name: 'Solana', icon: '◎', category: 'crypto' },
  'BNB/USD': { id: 'binancecoin', name: 'BNB', icon: '⬡', category: 'crypto' },
  'XRP/USD': { id: 'ripple', name: 'XRP', icon: '✕', category: 'crypto' },
  'DOGE/USD': { id: 'dogecoin', name: 'DOGE', icon: '🐕', category: 'crypto' },
  'ADA/USD': { id: 'cardano', name: 'ADA', icon: '♦', category: 'crypto' },
  'AVAX/USD': { id: 'avalanche-2', name: 'AVAX', icon: '🔺', category: 'crypto' },
  'LINK/USD': { id: 'chainlink', name: 'LINK', icon: '⬡', category: 'crypto' },
  'DOT/USD': { id: 'polkadot', name: 'DOT', icon: '●', category: 'crypto' },
  // Magnificent 7
  'AAPL': { id: 'AAPL', name: 'Apple', icon: '🍎', category: 'stock' },
  'MSFT': { id: 'MSFT', name: 'Microsoft', icon: '🪟', category: 'stock' },
  'GOOGL': { id: 'GOOGL', name: 'Google', icon: '🔍', category: 'stock' },
  'AMZN': { id: 'AMZN', name: 'Amazon', icon: '📦', category: 'stock' },
  'NVDA': { id: 'NVDA', name: 'NVIDIA', icon: '💚', category: 'stock' },
  'META': { id: 'META', name: 'Meta', icon: '👁', category: 'stock' },
  'TSLA': { id: 'TSLA', name: 'Tesla', icon: '⚡', category: 'stock' },
};

/** 价格数据 */
export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
  change24h: number;
  stale?: boolean;
}
