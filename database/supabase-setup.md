# Supabase 设置指南

## 1. 创建项目

1. 打开 https://supabase.com → Sign Up (用 GitHub 或邮箱)
2. New Project → 选 Free tier
3. 项目名: `trading-copilot`
4. 密码: 随便设一个强密码
5. Region: 选 US West (离 Vercel 近)

## 2. 运行数据库 Schema

1. 进入 Supabase Dashboard → SQL Editor
2. 复制 `database/schema.sql` 的全部内容
3. 点 Run → 应该看到全部成功

## 3. 获取 Keys

在 Project Settings → API 找到:
- **Project URL**: `https://xxxxx.supabase.co`
- **Service Role Key**: `eyJhbG...` (⚠️ 这个是服务端key，不要暴露到前端)
- **Anon Key**: `eyJhbG...` (公开key，RLS保护)

## 4. 配置环境变量

### 本地开发 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...你的service_role_key
```

### Vercel
在 Vercel Dashboard → Settings → Environment Variables 添加:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
- `SUPABASE_SERVICE_KEY` = `eyJhbG...`

## 5. 验证

```bash
# 本地测试
npm run dev
# 访问 http://localhost:3000/sniper 应该能看到数据

# 同步 Sniper 数据
python3 scripts/sync-sniper.py
```

## 6. Cron 同步 (可选)

在 Billy 的 cron 中每10分钟同步 Sniper 数据:
```
python3 /path/to/trading-copilot/scripts/sync-sniper.py
```

## 功能影响

| 功能 | 无 Supabase | 有 Supabase |
|------|-------------|-------------|
| Practice | 浏览器存储（刷新丢失） | 云端持久化 ✅ |
| Review | Demo数据 | 真实复盘记录 ✅ |
| Sniper | 本地文件/Mock | 云端实时数据 ✅ |
| Dashboard | 已有ITC API | 不变 |
| Health | 已有真实数据 | 不变 |
