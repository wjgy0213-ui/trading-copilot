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

/** 价格数据 */
export interface PriceData {
  symbol: string; // BTC/USD
  price: number;
  timestamp: number;
  change24h: number; // 24小时涨跌幅
}
