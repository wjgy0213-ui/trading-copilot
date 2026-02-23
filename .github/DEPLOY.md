# 部署指南 — 交易陪练AI

## 一键部署（需要老大执行一次）

### Step 1: GitHub 登录
```bash
gh auth login
# 选择 GitHub.com → HTTPS → Login with browser
```

### Step 2: 创建仓库并推送
```bash
cd /Users/jacky/.openclaw/workspace/projects/trading-copilot
gh repo create trading-copilot --public --source=. --push
```

### Step 3: Vercel 部署
```bash
vercel login
# 登录后：
vercel --prod
```

或者直接在 vercel.com 导入 GitHub 仓库（零配置，自动识别 Next.js）。

### Step 4: 绑定域名（可选）
在 Vercel Dashboard → 项目设置 → Domains → 添加域名

## 预计耗时：5分钟
