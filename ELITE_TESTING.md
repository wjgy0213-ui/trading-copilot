# Elite 功能测试指南

## 🧪 测试步骤

### 前置准备

1. **确保环境变量已设置**
```bash
# 检查 .env.local
grep EXCHANGE_ENCRYPTION_KEY .env.local
grep TELEGRAM_BOT_TOKEN .env.local
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **登录账户**
- 访问 http://localhost:3000/login
- 使用 Google OAuth 登录

---

### Test Case 1: 导航栏 Elite 入口

✅ **测试步骤：**
1. 登录后查看顶部导航栏
2. 找到 "Elite" 链接（带 Shield 图标）
3. 点击进入 Elite 控制台

🎯 **预期结果：**
- Elite 链接显示为绿色高亮（premium 样式）
- 点击后跳转到 `/elite` 页面

---

### Test Case 2: 交易所连接

✅ **测试步骤：**
1. 在 Elite 页面找到"交易所连接"区域
2. 选择 Binance（默认选中）
3. 输入 API Key 和 API Secret
4. 点击"连接交易所"

🎯 **预期结果：**
- ✅ 成功：显示绿色提示 + 账户余额
- ❌ 失败：显示红色错误消息（如凭证无效）

📝 **测试数据：**
```
API Key: [你的Binance Futures API Key]
API Secret: [你的API Secret]
```

---

### Test Case 3: 持仓监控

✅ **测试步骤：**
1. 连接交易所成功后
2. 在 Binance 开一个小仓位（测试用）
3. 等待 10 秒或刷新页面
4. 查看持仓监控表格

🎯 **预期结果：**
- 表格显示当前持仓
- 字段正确：币种、方向、大小、入场价、当前价、盈亏、杠杆
- 做多显示绿色，做空显示红色
- 盈利显示绿色，亏损显示红色
- 每10秒自动刷新

---

### Test Case 4: 一键平仓

✅ **测试步骤：**
1. 在持仓表格中找到任意持仓
2. 点击右侧"平仓"按钮
3. 在弹出的确认框点击"确定"

🎯 **预期结果：**
- 浏览器弹出确认框：`确认平仓 BTCUSDT LONG？`
- 点击确认后：
  - 显示绿色成功提示
  - 该持仓从列表中消失
  - Binance 账户显示对应平仓订单

---

### Test Case 5: 风控仪表盘

✅ **测试步骤：**
1. 确保有持仓（可开多个测试）
2. 查看"风控仪表盘"区域
3. 观察红绿灯状态和进度条

🎯 **预期结果：**
- 显示大圆形红绿灯指示器：
  - 🟢 绿色：风险低
  - 🟡 黄色：中等风险
  - 🔴 红色：高风险
- 三个进度条显示：
  - 单笔风险 %
  - 当日亏损 %
  - 最高杠杆
- 颜色根据阈值自动变化

**测试阈值：**
```
Green:  单笔<3%, 日亏<5%, 杠杆<10x
Yellow: 单笔3-5%, 日亏5-8%, 杠杆10-20x
Red:    单笔>5%, 日亏>8%, 杠杆>20x
```

---

### Test Case 6: Telegram 通知

✅ **测试步骤：**
1. 获取 Telegram Chat ID（@userinfobot）
2. 在 Elite 页面找到"Telegram 通知"区域
3. 输入 Chat ID
4. 点击"连接 Telegram"

🎯 **预期结果：**
- Telegram 收到测试消息：
  ```
  ✅ Trading Copilot Elite 通知已连接！
  
  您将收到：
  • 持仓变化通知
  • 风控状态警报
  • 平仓确认
  ```
- 页面显示"已连接"状态
- 三个通知开关显示（功能待后续实现）

---

## 🔍 API 端点测试

### 使用 curl 测试 (需要先在浏览器登录获取 cookie)

#### 1. 连接交易所
```bash
curl -X POST http://localhost:3000/api/exchange/connect \
  -H "Content-Type: application/json" \
  -H "Cookie: tc-session=YOUR_SESSION_COOKIE" \
  -d '{
    "exchange": "binance",
    "apiKey": "YOUR_API_KEY",
    "apiSecret": "YOUR_API_SECRET"
  }'
```

#### 2. 获取持仓
```bash
curl http://localhost:3000/api/exchange/positions \
  -H "Cookie: tc-session=YOUR_SESSION_COOKIE; exchange-creds=YOUR_ENCRYPTED_CREDS"
```

#### 3. 平仓
```bash
curl -X POST http://localhost:3000/api/exchange/close \
  -H "Content-Type: application/json" \
  -H "Cookie: tc-session=YOUR_SESSION_COOKIE; exchange-creds=YOUR_ENCRYPTED_CREDS" \
  -d '{
    "symbol": "BTCUSDT",
    "side": "LONG",
    "quantity": 0.001
  }'
```

#### 4. 风控监控
```bash
curl http://localhost:3000/api/risk/monitor \
  -H "Cookie: tc-session=YOUR_SESSION_COOKIE; exchange-creds=YOUR_ENCRYPTED_CREDS"
```

#### 5. Telegram 设置
```bash
curl -X POST http://localhost:3000/api/telegram/setup \
  -H "Content-Type: application/json" \
  -H "Cookie: tc-session=YOUR_SESSION_COOKIE" \
  -d '{
    "chatId": "YOUR_CHAT_ID"
  }'
```

---

## 🐛 常见问题排查

### 1. "No exchange connected" 错误
- **原因**：Cookie 中没有加密的凭证
- **解决**：先调用 `/api/exchange/connect` 连接交易所

### 2. Binance API 签名错误
- **原因**：时间戳不同步或签名算法错误
- **解决**：检查服务器时间，确保与 Binance 同步

### 3. Telegram 测试消息发送失败
- **原因**：Chat ID 错误或 bot token 无效
- **解决**：
  1. 重新获取 Chat ID
  2. 检查环境变量 `TELEGRAM_BOT_TOKEN`
  3. 确保已经给 bot 发过消息（/start）

### 4. 持仓不显示
- **原因**：
  - Binance 账户没有持仓
  - API 权限不足
- **解决**：
  1. 在 Binance 开一个小仓位测试
  2. 确认 API Key 有 "Enable Reading" 和 "Enable Futures" 权限

### 5. 加密错误
- **原因**：`EXCHANGE_ENCRYPTION_KEY` 不是64位hex
- **解决**：
```bash
# 重新生成
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ 完整测试清单

### 功能测试
- [ ] Elite 导航链接可见并可点击
- [ ] 登录验证（未登录显示登录提示）
- [ ] 交易所连接（成功 + 失败场景）
- [ ] 持仓列表显示正确
- [ ] 持仓自动刷新（10秒）
- [ ] 一键平仓功能
- [ ] 风控仪表盘数据正确
- [ ] 红绿灯状态切换
- [ ] Telegram 连接成功
- [ ] Telegram 测试消息收到

### 安全测试
- [ ] 未登录无法访问 API
- [ ] API 凭证正确加密存储
- [ ] Cookie 为 httpOnly
- [ ] 生产环境 Cookie 为 secure
- [ ] 敏感信息不在前端暴露

### UI/UX 测试
- [ ] 深色主题一致
- [ ] 响应式设计（手机/平板/桌面）
- [ ] 加载状态显示
- [ ] 错误消息清晰
- [ ] 成功提示及时
- [ ] 图标正确显示
- [ ] 表格可读性好

### 性能测试
- [ ] 页面加载速度 < 2秒
- [ ] API 响应速度 < 1秒
- [ ] 自动刷新不卡顿
- [ ] 构建无错误/警告

---

## 📊 测试报告模板

```markdown
## Elite 功能测试报告

**测试日期**：YYYY-MM-DD
**测试人员**：XXX
**环境**：Dev / Production

### 测试结果汇总
- 总测试用例：15
- 通过：__
- 失败：__
- 跳过：__

### 详细结果

#### ✅ 通过的功能
1. Elite 导航链接
2. 交易所连接
3. ...

#### ❌ 失败的功能
1. 问题描述
   - 重现步骤：
   - 预期结果：
   - 实际结果：
   - 截图/日志：

### 建议
- [ ] 建议1
- [ ] 建议2

### 总体评价
□ 可以部署
□ 需要修复后部署
□ 不建议部署
```

---

## 🚀 部署前检查

- [ ] 所有测试用例通过
- [ ] `npm run build` 无错误
- [ ] 环境变量已在生产环境配置
- [ ] API 速率限制已考虑
- [ ] 错误日志系统已配置
- [ ] 备份策略已就绪
- [ ] 用户文档已更新

---

**Good luck testing! 🎉**
