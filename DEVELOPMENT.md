# 开发指南

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问应用
open http://localhost:3000
```

## 项目结构说明

### `/app` - 页面路由
- `page.tsx` - Landing Page (首页)
- `trade/page.tsx` - 交易主页面
- `history/page.tsx` - 交易历史

### `/components` - React组件
- `TradingPanel.tsx` - 开仓交易面板
- `PositionsPanel.tsx` - 持仓管理
- `AccountPanel.tsx` - 账户信息展示

### `/lib` - 业务逻辑
- `types.ts` - TypeScript 类型定义
- `storage.ts` - LocalStorage 数据持久化
- `priceAPI.ts` - 价格数据获取 (CoinGecko)
- `tradingEngine.ts` - 交易引擎核心逻辑
- `aiScoring.ts` - AI评分系统

## 核心功能实现

### 1. 价格数据流

```typescript
// 初始化价格流
const priceStream = new PriceStream();
priceStream.subscribe((newPrice) => {
  setPrice(newPrice);
});
priceStream.start(10000); // 每10秒更新
```

### 2. 开仓交易

```typescript
const result = openPosition({
  side: 'long',
  size: 100,
  leverage: 2,
  currentPrice: 50000,
  stopLoss: 48000,
  takeProfit: 52000,
});
```

### 3. 平仓

```typescript
const result = closePosition(tradeId, currentPrice);
```

### 4. AI评分

```typescript
// 入场评分
const score = scoreEntry(trade, account);

// 出场评分（平仓时）
const exitScore = scoreExit(trade, wasStopTriggered);
```

## 数据模型

### Trade (交易)
```typescript
{
  id: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  size: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'open' | 'closed';
  openedAt: number;
  closedAt?: number;
  pnl?: number;
  pnlPercent?: number;
}
```

### Account (账户)
```typescript
{
  balance: number;
  equity: number;
  positions: Trade[];
  closedTrades: Trade[];
  totalPnl: number;
  winRate: number;
  maxDrawdown: number;
}
```

## 常见开发任务

### 添加新的交易对

1. 修改 `priceAPI.ts`
```typescript
export async function getETHPrice(): Promise<PriceData> {
  // 类似 getBTCPrice 实现
}
```

2. 更新类型定义
```typescript
export type Symbol = 'BTC/USD' | 'ETH/USD';
```

### 修改AI评分规则

编辑 `lib/aiScoring.ts`:
```typescript
export function scoreEntry(trade: Trade, account: Account): AIScore {
  let entryScore = 100;
  
  // 添加新的评分规则
  if (/* 你的条件 */) {
    entryScore -= 10;
    feedback.push('你的反馈');
  }
  
  return { entryScore, feedback, flags };
}
```

### 添加新的统计指标

1. 更新 `Account` 类型
2. 在 `tradingEngine.ts` 中计算新指标
3. 在 `AccountPanel.tsx` 中展示

## 调试技巧

### 查看本地存储数据
```javascript
// 浏览器控制台
localStorage.getItem('trading-copilot')
```

### 清空数据
```javascript
localStorage.clear()
// 或使用重置按钮
```

### 模拟价格波动
修改 `priceAPI.ts` 的 fallback 数据:
```typescript
price: 50000 + Math.random() * 5000, // 更大的波动
```

## 样式自定义

### 修改主题颜色
编辑 `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {...},
    }
  }
}
```

### 组件样式
使用 Tailwind CSS 类名直接修改组件样式

## 性能优化建议

1. **价格更新频率**: 根据需要调整 `PriceStream.start(interval)`
2. **懒加载**: 大型组件使用 `dynamic import`
3. **Memo**: 对频繁渲染的组件使用 `React.memo`

## 常见问题

### Q: 价格不更新？
A: 检查网络连接和 CoinGecko API 限制

### Q: 数据丢失？
A: 检查浏览器是否清除了 LocalStorage

### Q: AI评分不准确？
A: 当前是V1规则版本，可以调整 `aiScoring.ts` 中的规则

## Git 工作流

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 提交代码
git add .
git commit -m "feat: 添加新功能"

# 推送
git push origin feature/new-feature
```

## 部署

### Vercel (推荐)
1. 连接 GitHub 仓库
2. 自动部署
3. 无需额外配置

### 其他平台
- Netlify
- Railway
- Render

所有平台都支持 Next.js，部署零配置。

---

有问题欢迎查看代码注释或提Issue！
