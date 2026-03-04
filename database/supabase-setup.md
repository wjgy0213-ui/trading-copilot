# Supabase 设置指南

这份指南将带你完成 Trading Copilot 的 Supabase 数据库设置。

## 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 使用邮箱 `a6723372291@gmail.com` 登录（如果没有账号则注册）
3. 点击 "New Project"
4. 填写项目信息：
   - **Name**: `trading-copilot` 或你喜欢的名字
   - **Database Password**: 生成一个强密码并保存好
   - **Region**: 选择离你最近的区域（建议：`Southeast Asia (Singapore)` 或 `Northeast Asia (Tokyo)`）
   - **Pricing Plan**: Free（免费套餐足够开始使用）
5. 点击 "Create new project"，等待 1-2 分钟初始化

## 2. 运行数据库 Schema

1. 在 Supabase 项目页面，点击左侧菜单的 **SQL Editor**
2. 点击 **+ New query**
3. 复制 `database/schema.sql` 文件的全部内容
4. 粘贴到 SQL 编辑器中
5. 点击右下角的 **Run** 按钮执行
6. 确认看到 "Success. No rows returned" 消息

## 3. 获取 API 密钥

1. 点击左侧菜单的 **Project Settings** (齿轮图标)
2. 点击左侧的 **API**
3. 你会看到两个重要信息：
   - **Project URL**: 类似 `https://xxxxxxxxxxxxx.supabase.co`
   - **API Keys** 部分有两个密钥：
     - `anon` `public` — 公开密钥（前端使用）
     - `service_role` `secret` — 服务端密钥（后端使用，保密！）

## 4. 配置本地环境

1. 在项目根目录创建 `.env.local` 文件（如果还没有）：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...

# 其他环境变量...
```

2. 替换上面的值为你在第 3 步获取的实际值：
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `SUPABASE_SERVICE_KEY` → service_role 密钥（**不是** anon 密钥）

3. 重启开发服务器：

```bash
npm run dev
```

## 5. 配置 Vercel 生产环境

1. 访问你的 Vercel 项目
2. 进入 **Settings** → **Environment Variables**
3. 添加以下变量（选择 All Environments 或 Production）：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase Project URL |
| `SUPABASE_SERVICE_KEY` | 你的 service_role 密钥 |

4. 点击 **Save**
5. 重新部署项目（或等待下次自动部署）

## 6. 同步 Sniper 数据到云端（可选）

如果你已经有本地的 Sniper 模拟盘数据想要同步到 Supabase：

### 方式 1: 通过 API（推荐）

```bash
curl -X POST http://localhost:3000/api/sniper/sync
```

### 方式 2: 直接运行脚本

```bash
npx ts-node scripts/sync-sniper-to-supabase.ts
```

### 方式 3: 设置 Cron 定时同步

在 Vercel 或其他服务器上设置定时任务，每小时同步一次：

```bash
# Crontab example (runs every hour)
0 * * * * curl -X POST https://your-domain.vercel.app/api/sniper/sync
```

## 7. 验证设置

### 测试 Practice 功能

1. 访问 `/practice` 页面
2. 登录后进行一笔虚拟交易
3. 刷新页面，确认数据持久化

### 测试 Review 功能

1. 访问 `/review` 页面
2. 创建一条复盘日记
3. 刷新页面，确认保存成功

### 测试 Sniper 功能

1. 访问 `/sniper` 页面
2. 应该能看到同步的模拟盘数据
3. 如果没有数据，检查 `source` 字段：
   - `"source": "supabase"` — 从云端读取 ✅
   - `"source": "local"` — 从本地文件读取（开发环境）
   - `"source": "none"` — 没有数据

## 8. 查看数据库数据

1. 在 Supabase 项目中，点击左侧菜单的 **Table Editor**
2. 你会看到所有创建的表：
   - `profiles` — 用户资料
   - `practice_portfolios` — 虚拟交易组合
   - `practice_trades` — 交易历史
   - `reviews` — 复盘日记
   - `sniper_state` — Sniper 状态
   - `sniper_trades` — Sniper 交易记录
3. 点击任意表查看数据

## 故障排查

### 问题 1: "Missing env vars, running in fallback mode"

**原因**: 环境变量未设置

**解决**:
1. 检查 `.env.local` 文件是否存在且格式正确
2. 确认已重启开发服务器
3. 对于 Vercel，确认环境变量已保存并重新部署

### 问题 2: 数据没有保存

**原因**: 可能是 RLS (Row Level Security) 策略问题

**解决**:
1. 确认使用的是 `service_role` 密钥，不是 `anon` 密钥
2. 检查 Supabase 日志：Project Settings → Logs → Postgres Logs
3. 如果看到权限错误，重新运行 `schema.sql`

### 问题 3: 本地开发可以，Vercel 部署后报错

**原因**: Vercel 环境变量未设置

**解决**:
1. 确认在 Vercel 设置了所有必需的环境变量
2. 重新部署项目
3. 检查 Vercel 函数日志：Deployments → 点击部署 → Functions

## 安全提示

⚠️ **永远不要**：
- 把 `SUPABASE_SERVICE_KEY` 提交到 Git
- 在前端代码中使用 service_role 密钥
- 公开分享你的 Supabase 密钥

✅ **应该做的**：
- 把 `.env.local` 加入 `.gitignore`
- 只在服务端 API routes 中使用 service_role 密钥
- 定期轮换密钥（每 3-6 个月）

## 数据库管理

### 备份数据

Supabase 免费版每天自动备份，保留 7 天。

手动备份：
1. 进入 **Database** → **Backups**
2. 点击 **Create backup**

### 重置数据

如果需要清空所有数据重新开始：

```sql
-- 在 SQL Editor 中运行
truncate table practice_portfolios cascade;
truncate table practice_trades cascade;
truncate table reviews cascade;
truncate table sniper_trades cascade;
update sniper_state set 
  balance_sol = 10.0,
  total_pnl_pct = 0,
  total_pnl_sol = 0,
  win_rate = 0,
  total_trades = 0,
  wins = 0,
  losses = 0,
  positions = '[]'::jsonb
where id = 'current';
```

## 下一步

- [ ] 配置 Supabase Realtime（实时同步功能）
- [ ] 添加数据分析 Dashboard
- [ ] 设置邮件通知（交易提醒）
- [ ] 优化查询性能（添加索引）

---

需要帮助？查看：
- [Supabase 官方文档](https://supabase.com/docs)
- [Next.js + Supabase 教程](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
