# Trading Copilot 部署指南 🚀

> 目标：2/25 上线 | 预计耗时：5分钟

## 方案 A: Vercel（推荐，最快）

### 步骤
1. **创建 GitHub repo**
```bash
cd ~/projects/trading-copilot  # 或实际路径
gh auth login                   # 如果没登录
gh repo create trading-copilot --public --source=. --push
```

2. **部署到 Vercel**
```bash
npx vercel login
npx vercel --prod
```

3. **搞定** — Vercel 自动检测 Next.js，静态导出直接部署

### 需要老大做的
- [ ] `gh auth login`（GitHub CLI 登录）
- [ ] `npx vercel login`（Vercel 登录）
- 登录完告诉我，我来执行部署

---

## 方案 B: Cloudflare Pages（备选，免费额度更大）

```bash
npx wrangler pages deploy out --project-name=trading-copilot
```

---

## 方案 C: 纯静态托管（最简单）

`out/` 目录就是完整的静态网站，可以直接放到任何静态托管：
- GitHub Pages
- Netlify (拖拽上传)
- 任何 nginx/Apache 服务器

---

## 方案 D: GitHub Pages（零配置 CI/CD）

1. **创建 repo + push**
```bash
gh auth login
gh repo create trading-copilot --public --source=. --push
```

2. **GitHub 自动部署** — `.github/workflows/deploy.yml` 已配置好
   - 每次 push 到 main 自动构建+部署
   - 访问 `https://<username>.github.io/trading-copilot`

3. **如果用子路径**，设环境变量：
```bash
# 在 GitHub repo Settings → Secrets → Actions
NEXT_PUBLIC_BASE_PATH=/trading-copilot
```

4. **如果绑自定义域名**（如 copilot.slowman.cc），不需要 basePath

---

## 当前状态
- ✅ 静态导出完成 (`out/` 目录)
- ✅ 多币种支持 (BTC/ETH/SOL)
- ✅ SEO/中文元数据
- ✅ Git 初始化
- ✅ 入门课程 5 课（/learn）
- ✅ 资金曲线组件（/history）
- ✅ GitHub Actions CI/CD 配置
- ⏳ 等老大 `gh auth login` 一步搞定
