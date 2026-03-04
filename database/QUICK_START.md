# Supabase 快速开始 🚀

## 3分钟上手

### 1. 创建项目 (2分钟)

1. 访问 [supabase.com](https://supabase.com)，用 `a6723372291@gmail.com` 登录
2. 点击 "New Project"
3. 填写名称、密码、选择区域（Singapore/Tokyo）
4. 等待初始化完成

### 2. 运行 Schema (30秒)

1. 点击左侧 **SQL Editor**
2. 点击 **+ New query**
3. 复制粘贴 `database/schema.sql` 全部内容
4. 点击 **Run**

### 3. 获取密钥 (30秒)

1. 点击 **Project Settings** → **API**
2. 复制两个值：
   - **Project URL**
   - **service_role** 密钥（⚠️ 不是 anon）

### 4. 配置本地

创建/编辑 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的Project URL
SUPABASE_SERVICE_KEY=你的service_role密钥
```

重启开发服务器：

```bash
npm run dev
```

### 5. 配置 Vercel

在 Vercel 项目：

1. Settings → Environment Variables
2. 添加上面两个变量
3. 重新部署

### 6. 同步 Sniper 数据（可选）

```bash
curl -X POST http://localhost:3000/api/sniper/sync
```

## 验证

- 登录后使用 Practice 功能，刷新页面确认数据保存
- 创建 Review 日记
- 访问 `/sniper` 查看数据来源

## 遇到问题？

查看详细文档：`database/supabase-setup.md`

---

**就这么简单！** 🎉
