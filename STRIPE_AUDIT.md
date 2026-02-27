# Stripe 支付审计报告

> 审计时间: 2026-02-27
> 审计者: Billy

## 🔴 严重问题（阻碍上线）

### 1. Webhook 只有 console.log，无持久化
**文件**: `app/api/webhook/route.ts`
**问题**: checkout.session.completed 和 subscription.deleted 只 console.log，没有写入任何数据库
**影响**: 用户付款后如果 activate API 调用失败（网络问题/浏览器关闭），订阅状态永远丢失
**修复**: 添加 Vercel KV 存储

### 2. 用户状态纯靠 JWT Cookie
**文件**: `lib/auth.ts`
**问题**: 用户的 plan/subscription 信息只存在 cookie 里
**影响**: 
- 清 cookie = 丢失订阅
- 换设备 = 需要重新激活
- 无法服务端验证用户是否真的付费
**修复**: KV 作为 source of truth，JWT 作为缓存

### 3. Activate 端点无防重放
**文件**: `app/api/auth/activate/route.ts`
**问题**: 任何人拿到 session_id 都能调用激活，没有验证是否已使用
**修复**: KV 记录已激活的 session_id

## 🟡 中等问题

### 4. Webhook Secret 未验证是否配置正确
需要在 Stripe Dashboard 确认 webhook endpoint URL 指向 `https://trading-copilot-delta.vercel.app/api/webhook`

### 5. 取消订阅只设了 cancel_at_period_end
逻辑正确，但 webhook 里没处理 `customer.subscription.updated` 事件来同步状态

### 6. 没有处理支付失败的情况
缺少 `invoice.payment_failed` 事件处理

## ✅ 做得好的

- Checkout 流程逻辑清晰
- metadata 传递了 planId 和 email
- JWT 有效期 30 天合理
- 前端 success 页自动激活逻辑 OK

## 📋 修复计划

1. 添加 `@vercel/kv` → `lib/db.ts`
2. 重写 `webhook/route.ts` → KV 持久化
3. 修改 `activate/route.ts` → KV 验证 + 防重放
4. 修改 `getSession()` → KV fallback
5. 处理更多 webhook 事件
6. 端到端测试

## 🧪 测试清单（Test Mode）

### 测试卡号
- 成功: `4242 4242 4242 4242`
- 失败: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### 完整流程
1. [ ] 选 Pro → 输入邮箱 → 跳转 Stripe Checkout
2. [ ] 用测试卡付款 → 返回 success 页
3. [ ] 自动激活 → 验证 cookie + KV 都有数据
4. [ ] 刷新页面 → 仍显示 Pro
5. [ ] 清 cookie → 重新登录 → 从 KV 恢复 Pro
6. [ ] 账户页取消订阅 → 显示"周期结束后取消"
7. [ ] Webhook 手动触发 subscription.deleted → KV 更新为 free
8. [ ] 用失败卡测试 → 正确错误提示
