# Elite 功能快速启动 🚀

## 1️⃣ 生成加密密钥（1分钟）

```bash
# 生成32字节（64位hex）加密密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出，添加到 `.env.local`：

```env
EXCHANGE_ENCRYPTION_KEY=你复制的64位hex字符串
TELEGRAM_BOT_TOKEN=你的telegram_bot_token（可选）
```

## 2️⃣ 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:3000

## 3️⃣ 获取 Binance API Key（5分钟）

1. 登录 [Binance](https://www.binance.com)
2. 账户 → API Management
3. 创建 API Key
4. **权限设置：**
   - ✅ Enable Reading
   - ✅ Enable Futures
   - ❌ Enable Withdrawals（❗️不要勾选）
5. 保存 API Key 和 Secret

## 4️⃣ 获取 Telegram Chat ID（2分钟）

1. 打开 Telegram
2. 搜索：`@userinfobot`
3. 点击 **Start**
4. 复制返回的数字（你的 Chat ID）

## 5️⃣ 使用 Elite 功能

### 连接交易所
1. 访问 http://localhost:3000/elite
2. 输入 Binance API Key 和 Secret
3. 点击"连接交易所"
4. ✅ 看到余额即为成功

### 查看持仓
- 在 Binance 开一个小仓位（如 0.001 BTC）
- Elite 页面会自动显示
- 每10秒自动刷新

### 一键平仓
- 点击持仓右侧的"平仓"按钮
- 确认后立即市价平仓

### 风控监控
- 查看红绿灯状态
- 监控单笔风险、日亏损、杠杆

### Telegram 通知
- 输入你的 Chat ID
- 点击"连接 Telegram"
- 检查 Telegram 收到测试消息

## 🎉 完成！

你现在可以：
- ✅ 实时监控持仓
- ✅ 一键平仓
- ✅ 查看风控状态
- ✅ 接收 Telegram 通知

## 📚 更多文档

- [完整实现文档](./ELITE_IMPLEMENTATION.md)
- [测试指南](./ELITE_TESTING.md)

## ⚠️ 安全提醒

1. **永远不要**启用 API 提币权限
2. **不要**在公共网络使用
3. **定期更换** API Key
4. **使用测试账户**先测试
5. **小仓位**开始使用

## 🆘 遇到问题？

### 连接失败
- 检查 API Key 是否正确
- 确认 API 权限已启用
- 检查服务器时间是否同步

### Telegram 不工作
- 确认 `TELEGRAM_BOT_TOKEN` 已设置
- 检查 Chat ID 是否正确
- 确保已经给 bot 发过 `/start`

### 持仓不显示
- 确认 Binance 有开仓
- 检查 API 权限（Enable Futures）
- 刷新页面或等待10秒

---

**开始交易，科学管理风险！** 💪
