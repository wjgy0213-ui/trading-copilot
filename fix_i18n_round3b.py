#!/usr/bin/env python3
"""Round 3b - Fix remaining pages that need useI18n import and text replacements"""
import re, os

BASE = os.path.dirname(os.path.abspath(__file__))

def ensure_i18n_import(filepath):
    """Ensure useI18n is imported"""
    full = os.path.join(BASE, filepath)
    with open(full, 'r') as f:
        c = f.read()
    if "useI18n" not in c:
        c = c.replace("'use client';", "'use client';\n\nimport { useI18n } from '@/lib/i18n';", 1)
    with open(full, 'w') as f:
        f.write(c)
    return c

def add_t_to_component(filepath, after_pattern, needs_locale=False):
    """Add const { t, locale } = useI18n(); to component"""
    full = os.path.join(BASE, filepath)
    with open(full, 'r') as f:
        c = f.read()
    hook_call = "const { t, locale } = useI18n();" if needs_locale else "const { t } = useI18n();"
    if hook_call not in c and "const { t } = useI18n();" not in c and "const { t, locale } = useI18n();" not in c:
        if after_pattern in c:
            c = c.replace(after_pattern, after_pattern + "\n  " + hook_call, 1)
    with open(full, 'w') as f:
        f.write(c)

def replace_all(filepath, replacements):
    """Replace strings in file"""
    full = os.path.join(BASE, filepath)
    with open(full, 'r') as f:
        c = f.read()
    count = 0
    for old, new in replacements:
        if old in c:
            c = c.replace(old, new)
            count += 1
    with open(full, 'w') as f:
        f.write(c)
    print(f"  {filepath}: {count}/{len(replacements)} replacements")

# ====== SNIPER PAGE ======
print("=== app/sniper/page.tsx ===")
ensure_i18n_import('app/sniper/page.tsx')

# Need to add useI18n to the ModeSelector, LiveConnect, SniperDashboard, and SniperPage components
# Since there are multiple sub-components, we add useI18n to each that has Chinese
sniper_path = os.path.join(BASE, 'app/sniper/page.tsx')
with open(sniper_path, 'r') as f:
    sc = f.read()

# Add t to ModeSelector
sc = sc.replace(
    "function ModeSelector({ onSelect }: { onSelect: (mode: SniperMode) => void }) {\n  return (",
    "function ModeSelector({ onSelect }: { onSelect: (mode: SniperMode) => void }) {\n  const { t } = useI18n();\n  return ("
)

# Add t to LiveConnect
sc = sc.replace(
    "function LiveConnect({ onBack, onConnect }: { onBack: () => void; onConnect: (exchange: LiveExchange) => void }) {\n  const router = useRouter();",
    "function LiveConnect({ onBack, onConnect }: { onBack: () => void; onConnect: (exchange: LiveExchange) => void }) {\n  const { t } = useI18n();\n  const router = useRouter();"
)

# Add t to SniperDashboard
sc = sc.replace(
    "function SniperDashboard({ mode, onBack }: { mode: 'paper' | 'live'; onBack: () => void }) {\n  const [data, setData",
    "function SniperDashboard({ mode, onBack }: { mode: 'paper' | 'live'; onBack: () => void }) {\n  const { t } = useI18n();\n  const [data, setData"
)

# Add t to OfficialLabStats  
sc = sc.replace(
    "function OfficialLabStats() {\n  const [stats",
    "function OfficialLabStats() {\n  const { t } = useI18n();\n  const [stats"
)

# Now do all the text replacements in sniper
sniper_replacements = [
    (">AI驱动的链上Meme自动狙击系统<", ">{t('sniper.aiDesc')}<"),
    (">5维评分 · 自动买卖 · 风控止损<", ">{t('sniper.scoring')}<"),
    (">模拟盘<", ">{t('sniper.paper')}<"),
    (">10 SOL 虚拟资金起步，零风险体验AI狙击策略<", ">{t('sniper.paperDesc')}<"),
    (">免费</span>", ">{t('sniper.free')}</span>"),
    (">实时数据</span>", ">{t('sniper.realtime')}</span>"),
    (">零风险</span>", ">{t('sniper.zeroRisk')}</span>"),
    ("\n              立即开始 →\n", "\n              {t('sniper.startNow')}\n"),
    (">实盘交易<", ">{t('sniper.live')}<"),
    (">连接交易所或钱包，真金白银自动执行<", ">{t('sniper.liveDesc')}<"),
    ("\n              连接钱包 →\n", "\n              {t('sniper.connectWallet')}\n"),
    (">官方实验盘 · 实时运行中<", ">{t('sniper.officialLab')}<"),
    (">加载中...</", ">{t('sniper.loading')}</"),
    (">累计收益</", ">{t('sniper.cumReturn')}</"),
    (">总交易</", ">{t('sniper.totalTrades')}</"),
    (">胜率</", ">{t('sniper.winRate')}</"),
    (">运行天数</", ">{t('sniper.runDays')}</"),
    # LiveConnect
    ("← 返回\n", "{t('sniper.back')}\n"),
    (">⚡ 连接交易账户<", ">{t('sniper.connectTitle')}<"),
    (">选择你的交易所或钱包<", ">{t('sniper.connectDesc')}<"),
    ("{ setError('请填写 API Key 和 Secret')", "{ setError(t('sniper.fillApiKey'))"),
    ("throw new Error(data.error || '连接失败')", "throw new Error(data.error || t('sniper.connectFail'))"),
    (">币安 Binance<", ">Binance<"),
    (">API Key 连接 · 支持现货交易<", ">{t('sniper.binanceDesc')}<"),
    (">Phantom 钱包<", ">Phantom Wallet<"),
    ("'连接中...' :", "t('sniper.phantomConnecting') :"),
    ("'未检测到 Phantom，请先安装扩展' :", "t('sniper.phantomNotFound') :"),
    ("'链上直连 · Solana DEX 交易'", "t('sniper.phantomDesc')"),
    (">下载 Phantom 钱包 →<", ">{t('sniper.downloadPhantom')}<"),
    (">API Key 连接 · 需要 Passphrase<", ">{t('sniper.okxDesc')}<"),
    (">API Key 连接 · Unified 账户<", ">{t('sniper.bybitDesc')}<"),
    (">钱包地址直连 · 无需 API Key<", ">{t('sniper.hlDesc')}<"),
    ("⚠️ 实盘交易涉及真实资金风险。建议先在模拟盘验证策略，确认稳定后再接入实盘。", "{t('sniper.liveWarning')}"),
    # Paper mode labels  
    (">输入你的 Binance API Key\"", ">{t('sniper.apiKeyPlaceholder')}\"" if False else None),
    # SniperDashboard labels
    ("← 返回选择\n", "{t('sniper.backSelect')}\n"),
    (">📊 模拟盘<", ">{t('sniper.paperTitle')}<"),
    (">零风险体验AI Meme狙击策略<", ">{t('sniper.paperSubtitle')}<"),
    (">准备就绪<", ">{t('sniper.ready')}<"),
    (">系统将分配 10 SOL 虚拟资金，AI 自动扫描并执行交易<", ">{t('sniper.readyDesc')}<"),
    (">起始资金</", ">{t('sniper.startFund')}</"),
    (">选币算法</", ">{t('sniper.algorithm')}</"),
    (">买卖执行</", ">{t('sniper.execution')}</"),
    (">策略参数<", ">{t('sniper.strategyParams')}<"),
    (">• 扫描频率: 每5分钟</", ">{t('sniper.scanFreq')}</"),
    (">• 买入门槛: ≥65分</", ">{t('sniper.buyThreshold')}</"),
    (">• 单笔仓位: 5%</", ">{t('sniper.posSize')}</"),
    (">• 最大持仓: 10个</", ">{t('sniper.maxPos')}</"),
    (">• 止损: -30%</", ">{t('sniper.stopLoss')}</"),
    (">• 止盈: +100%半仓 / +200%全平</", ">{t('sniper.takeProfit')}</"),
    (">🚀 启动模拟盘<", ">{t('sniper.launchPaper')}<"),
    (">• 模拟盘使用实时市场数据，不涉及真实资金<", ">{t('sniper.paperNote1')}<"),
    (">• 验证策略后可升级至实盘（需 Elite 订阅）<", ">{t('sniper.paperNote2')}<"),
    (">• 交易记录自动保存，支持导出复盘<", ">{t('sniper.paperNote3')}<"),
    (">Meme Sniper 准备中<", ">{t('sniper.preparing')}<"),
    (">AI正在扫描市场，请稍候...<", ">{t('sniper.scanning')}<"),
    ("'模拟盘 · 虚拟资金' : '实盘 · 真实交易'", "t('sniper.paperMode') : t('sniper.liveMode')"),
    ("'📊 模拟盘' : '⚡ 实盘'", "t('sniper.paperBadge') : t('sniper.liveBadge')"),
    ("label=\"余额\"", "label={t('sniper.balance')}"),
    ("label=\"持仓数\"", "label={t('sniper.posCount')}"),
    ("label=\"胜率\"", "label={t('sniper.winRate')}"),
    ("label=\"最大回撤\"", "label={t('sniper.maxDrawdown')}"),
    (">准备好了？升级到实盘<", ">{t('sniper.upgradeTitle')}<"),
    (">连接币安或Phantom钱包，用真实资金自动执行<", ">{t('sniper.upgradeDesc')}<"),
    (">连接钱包<", ">{t('sniper.connectWallet')}<"),
    ("📊 持仓 (", "{t('sniper.positions')} ("),
    ("📜 交易记录 (", "{t('sniper.tradeHistory')} ("),
    (">暂无持仓 — 等待狙击机会<", ">{t('sniper.noPositions')}<"),
    (">部分止盈<", ">{t('sniper.partialTP')}<"),
    (">入场价</", ">{t('sniper.entryPrice')}</"),
    (">现价</", ">{t('sniper.currentPrice')}</"),
    (">仓位</", ">{t('sniper.positionSize')}</"),
    (">持仓时间</", ">{t('sniper.holdTime')}</"),
    (">止损 -30%<", ">{t('sniper.slLabel')}<"),
    (">入场<", ">{t('sniper.entryLabel')}<"),
    (">止盈 +200%<", ">{t('sniper.tpLabel')}<"),
    (">暂无交易记录<", ">{t('sniper.noTrades')}<"),
    (">🔫 每5分钟自动扫描 · 5维评分≥65自动买入 · 止损-30% / 止盈+200%<", ">{t('sniper.footerScan')}<"),
    ("'模拟盘 · 不涉及真实资金' : '实盘 · 真实资金交易'", "t('sniper.paperFooter') : t('sniper.liveFooter')"),
    # Days unit
    ("running: `${days}天`,", "running: `${days}`,"),
    # Binance-specific text in form
    ("placeholder=\"输入你的 Binance API Key\"", "placeholder={t('sniper.apiKeyPlaceholder')}"),
    ("placeholder=\"输入你的 Binance API Secret\"", "placeholder={t('sniper.apiSecretPlaceholder')}"),
    (">💡 建议只开启「现货读取+交易」权限，关闭提币权限。<br/>\n                  API Key 使用 AES-256 加密存储，不以明文保存。", ">{t('sniper.securityTip').split('\\n')[0]}<br/>\n                  {t('sniper.securityTip').split('\\n')[1]}"),
    ("{connecting ? '连接中...' : '🔗 连接币安'}", "{connecting ? t('sniper.connecting') : t('sniper.connectBinance')}"),
    # label props (these are StatCard props)
]

# Filter out None entries
sniper_replacements = [(o, n) for o, n in sniper_replacements if o is not None and n is not None]

for old, new in sniper_replacements:
    if old in sc:
        sc = sc.replace(old, new)

with open(sniper_path, 'w') as f:
    f.write(sc)
print(f"  app/sniper/page.tsx: done")

# ====== ELITE PAGE ======
print("=== app/elite/page.tsx ===")
ensure_i18n_import('app/elite/page.tsx')

elite_path = os.path.join(BASE, 'app/elite/page.tsx')
with open(elite_path, 'r') as f:
    ec = f.read()

# Add t to component
ec = ec.replace(
    "export default function ElitePage() {\n  const { data: session }",
    "export default function ElitePage() {\n  const { t } = useI18n();\n  const { data: session }"
)

elite_reps = [
    ("if (!confirm(`确认平仓 ${position.symbol} ${position.side}？`))", "if (!confirm(`${t('elite.confirmClose')} ${position.symbol} ${position.side}?`))"),
    ("setSuccess(`✅ ${position.symbol} 已平仓`)", "setSuccess(`✅ ${position.symbol} ${t('elite.closed')}`)"),
    (">请先登录<", ">{t('elite.loginRequired')}<"),
    (">Elite功能需要登录账户<", ">{t('elite.loginDesc')}<"),
    (">Elite 控制台<", ">{t('elite.title')}<"),
    (">实盘交易 · 风控监控 · 自动化<", ">{t('elite.subtitle')}<"),
    ("\n              交易所连接\n", "\n              {t('elite.exchangeConnect')}\n"),
    (">交易所</label>", ">{t('elite.exchangeLabel')}</label>"),
    ("{exchange === 'hyperliquid' ? '钱包地址 (0x...)' : 'API Key'}", "{exchange === 'hyperliquid' ? t('elite.walletAddress') : t('elite.apiKeyLabel')}"),
    ("placeholder={exchange === 'hyperliquid' ? '0x...' : '输入你的API Key'}", "placeholder={exchange === 'hyperliquid' ? '0x...' : t('elite.apiKeyPlaceholder')}"),
    (">API Secret</label>", ">{t('elite.apiKeyLabel')}</label>" if False else None),  # skip - already English
    ("placeholder=\"输入你的API Secret\"", "placeholder={t('elite.apiSecretPlaceholder')}"),
    ("placeholder=\"输入你的OKX Passphrase\"", "placeholder={t('elite.passphrasePlaceholder')}"),
    ("\n                      连接中...\n", "\n                      {t('elite.connecting')}\n"),
    ("\n                    '连接交易所'\n", "\n                    t('elite.connectExchange')\n"),
    ("⚠️ 请确保API权限包含：读取持仓、交易（平仓）。不需要提币权限。", "{t('elite.apiPermNotice')}"),
    (">已连接</span>", ">{t('elite.connected')}</span>"),
    (">账户余额</span>", ">{t('elite.balance')}</span>"),
    (">断开连接<", ">{t('elite.disconnect')}<"),
    ("placeholder=\"输入你的Telegram Chat ID\"", "placeholder={t('elite.chatIdPlaceholder')}"),
    ("\n                      连接中...\n", "\n                      {t('elite.telegramConnecting')}\n"),  # second occurrence
    ("\n                    '连接 Telegram'\n", "\n                    t('elite.connectTelegram')\n"),
    (">💡 如何获取Chat ID：<", ">{t('elite.telegramGuide')}<"),
    (">1. 打开 Telegram，搜索 @userinfobot<", ">{t('elite.telegramStep1')}<"),
    (">2. 点击 Start，机器人会回复你的 Chat ID<", ">{t('elite.telegramStep2')}<"),
    (">持仓变化通知<", ">{t('elite.posChangeNotif')}<"),
    (">风控警报<", ">{t('elite.riskAlerts')}<"),
    (">平仓确认<", ">{t('elite.closeConfirm')}<"),
    ("\n              风控仪表盘\n", "\n              {t('elite.riskDashboard')}\n"),
    ("riskData.status === 'green' ? '安全' : riskData.status === 'yellow' ? '警告' : '危险'",
     "riskData.status === 'green' ? t('elite.safe') : riskData.status === 'yellow' ? t('elite.warning') : t('elite.danger')"),
    (">单笔风险</span>", ">{t('elite.singleRisk')}</span>"),
    (">当日亏损</span>", ">{t('elite.dailyLoss')}</span>"),
    (">最高杠杆</span>", ">{t('elite.maxLeverage')}</span>"),
    ("\n                持仓监控\n", "\n                {t('elite.posMonitor')}\n"),
    (">每10秒自动刷新<", ">{t('elite.autoRefresh')}<"),
    (">当前无持仓<", ">{t('elite.noPositions')}<"),
    (">币种</th>", ">{t('elite.symbol')}</th>"),
    (">方向</th>", ">{t('elite.directionLabel')}</th>"),
    (">大小</th>", ">{t('elite.size')}</th>"),
    (">入场价</th>", ">{t('elite.entryPrice')}</th>"),
    (">当前价</th>", ">{t('elite.markPrice')}</th>"),
    (">盈亏</th>", ">{t('elite.pnlLabel')}</th>"),
    (">杠杆</th>", ">{t('elite.leverage')}</th>"),
    (">操作</th>", ">{t('elite.action')}</th>"),
    ("\n                            平仓\n", "\n                            {t('elite.closePos')}\n"),
]

elite_reps = [(o, n) for o, n in elite_reps if o is not None and n is not None]

for old, new in elite_reps:
    if old in ec:
        ec = ec.replace(old, new, 1)

with open(elite_path, 'w') as f:
    f.write(ec)
print(f"  app/elite/page.tsx: done")

# ====== AI-STRATEGY PAGE ======
print("=== app/ai-strategy/page.tsx ===")
ensure_i18n_import('app/ai-strategy/page.tsx')

ai_path = os.path.join(BASE, 'app/ai-strategy/page.tsx')
with open(ai_path, 'r') as f:
    ac = f.read()

# Find the component and add t
if "const { t } = useI18n();" not in ac:
    ac = ac.replace("export default function", "// @i18n\nexport default function")
    ac = re.sub(
        r'export default function (\w+)\([^)]*\)\s*\{',
        lambda m: m.group(0) + "\n  const { t } = useI18n();",
        ac, 1
    )

ai_reps = [
    ("{ text: '我想做趋势跟踪，激进一点', icon: '🚀' },", "{ textKey: 'aiStrategy.prompt1', icon: '🚀' },"),
    ("{ text: '保守的均值回归策略', icon: '🛡️' },", "{ textKey: 'aiStrategy.prompt2', icon: '🛡️' },"),
    ("{ text: '用MACD配合成交量做动量交易', icon: '📊' },", "{ textKey: 'aiStrategy.prompt3', icon: '📊' },"),
    ("{ text: '海龟突破策略，20周期', icon: '🐢' },", "{ textKey: 'aiStrategy.prompt4', icon: '🐢' },"),
    ("{ text: '布林带反转，适合震荡市', icon: '📉' },", "{ textKey: 'aiStrategy.prompt5', icon: '📉' },"),
    ("{ text: '短线RSI超卖反弹', icon: '⚡' },", "{ textKey: 'aiStrategy.prompt6', icon: '⚡' },"),
    ("alert(e.message || '生成失败')", "alert(e.message || t('aiStrategy.genFail'))"),
    ("> AI 策略生成器<", ">{t('aiStrategy.badge')}<" if False else None),  # spans have spaces
    (">用自然语言创建交易策略<", ">{t('aiStrategy.title')}<"),
    (">描述你的交易想法，AI帮你转化为可回测的策略<", ">{t('aiStrategy.desc')}<"),
    ("feature=\"AI策略生成器 — 自然语言创建交易策略\"", "feature={t('aiStrategy.paywallLabel')}"),
    (">描述你想要的策略</label>", ">{t('aiStrategy.inputLabel')}</label>"),
    ("placeholder=\"例如：我想做一个保守的趋势跟踪策略，用50周期EMA确认方向，RSI过滤入场时机...\"", "placeholder={t('aiStrategy.placeholder')}"),
    (">⌘+Enter 生成</span>", ">{t('aiStrategy.hint')}</span>"),
    ("'生成中...' : '生成策略'", "t('aiStrategy.generating') : t('aiStrategy.generate')"),
    (">或试试这些：<", ">{t('aiStrategy.tryLabel')}<"),
    (">AI 生成的策略<", ">{t('aiStrategy.resultTitle')}<"),
    (">应用为模板<", ">{t('aiStrategy.applyTemplate')}<"),
    (">直接回测<", ">{t('aiStrategy.backtest')}<"),
    (">或者从模板开始<", ">{t('aiStrategy.orManual')}<"),
    (">预制策略模板，一键加载参数<", ">{t('aiStrategy.templateDesc')}<"),
]

ai_reps = [(o, n) for o, n in ai_reps if o is not None and n is not None]

# Fix the EXAMPLE_PROMPTS usage - need to use textKey instead of text
# The prompts use p.text - change to t(p.textKey)
for old, new in ai_reps:
    if old in ac:
        ac = ac.replace(old, new, 1)

# Fix prompt text references: p.text → t(p.textKey)
ac = ac.replace("setPrompt(p.text)", "setPrompt(t(p.textKey))")
ac = ac.replace("{p.text}", "{t(p.textKey)}")

# Fix the inline " AI 策略生成器" with space
ac = ac.replace('<Sparkles className="w-3.5 h-3.5" /> AI 策略生成器', '<Sparkles className="w-3.5 h-3.5" /> {t(\'aiStrategy.badge\')}')

with open(ai_path, 'w') as f:
    f.write(ac)
print(f"  app/ai-strategy/page.tsx: done")

# ====== COURSE PAGE ======
print("=== app/course/page.tsx ===")
ensure_i18n_import('app/course/page.tsx')

course_path = os.path.join(BASE, 'app/course/page.tsx')
with open(course_path, 'r') as f:
    cc = f.read()

# Add t to component
if "const { t } = useI18n();" not in cc:
    cc = cc.replace(
        "const { session, hasCourse } = useSession();",
        "const { t } = useI18n();\n  const { session, hasCourse } = useSession();"
    )

course_reps = [
    ("name: '课程基础版',", "name: '课程基础版', nameEn: 'Course Basic',"),
    ("eliteLabel: '1个月Pro',", "eliteLabel: '1个月Pro', eliteLabelEn: '1 month Pro',"),
    ("features: ['全部课程终身访问', '8大策略模板库', '课程进度追踪', '社区讨论权限', '1个月Pro体验'],", 
     "features: ['全部课程终身访问', '8大策略模板库', '课程进度追踪', '社区讨论权限', '1个月Pro体验'],\n    featuresEn: ['Lifetime access to all courses', '8 strategy template library', 'Course progress tracking', 'Community access', '1 month Pro trial'],"),
    ("name: '课程+工具包',", "name: '课程+工具包', nameEn: 'Course + Toolkit',"),
    ("eliteLabel: '3个月Elite',", "eliteLabel: '3个月Elite', eliteLabelEn: '3 months Elite',"),
    ("features: ['全部课程终身访问', '8大策略模板库', '实战案例集（20+真实交易）', '蒙特卡洛回测模板', '课程进度追踪', '3个月Elite体验'],",
     "features: ['全部课程终身访问', '8大策略模板库', '实战案例集（20+真实交易）', '蒙特卡洛回测模板', '课程进度追踪', '3个月Elite体验'],\n    featuresEn: ['Lifetime access to all courses', '8 strategy template library', 'Case studies (20+ real trades)', 'Monte Carlo backtest templates', 'Course progress tracking', '3 months Elite trial'],"),
    ("name: '全家桶VIP',", "name: '全家桶VIP', nameEn: 'All-in-One VIP',"),
    ("eliteLabel: '6个月Elite',", "eliteLabel: '6个月Elite', eliteLabelEn: '6 months Elite',"),
    ("features: ['全部课程终身访问', '8大策略模板库', '实战案例集（20+真实交易）', '蒙特卡洛回测模板', '1v1策略复盘（月度）', '专属VIP交流群', '6个月Elite体验', '新课程优先体验'],",
     "features: ['全部课程终身访问', '8大策略模板库', '实战案例集（20+真实交易）', '蒙特卡洛回测模板', '1v1策略复盘（月度）', '专属VIP交流群', '6个月Elite体验', '新课程优先体验'],\n    featuresEn: ['Lifetime access to all courses', '8 strategy template library', 'Case studies (20+ real trades)', 'Monte Carlo backtest templates', '1v1 strategy review (monthly)', 'Exclusive VIP group', '6 months Elite trial', 'Early access to new courses'],"),
    (">你已拥有课程<", ">{t('course.owned')}<"),
    (">所有课程内容已解锁，开始学习吧！<", ">{t('course.ownedDesc')}<"),
    ("\n            继续学习 <ArrowRight", "\n            {t('course.continueLearning')} <ArrowRight"),
    ("> 早鸟优惠 · 限前100名<", "> {t('course.earlyBird')}<"),
    ("从韭菜到<span", "{t('course.heroTitle1')}<span"),
    (">系统化交易者</span>", ">{t('course.heroTitle2')}</span>"),
    ("完整的交易学习路径。不是教你发财，是教你不再亏钱。", "{t('course.heroDesc')}"),
    ("label: '学员'", "label: t('course.students')"),
    ("label: '评分'", "label: t('course.rating')"),
    ("label: '章节'", "label: t('course.chapters')"),
    ("label: '时长'", "label: t('course.duration')"),
    ("placeholder=\"输入邮箱开始购买\"", "placeholder={t('course.emailPlaceholder')}"),
    (">最受欢迎<", ">{t('course.mostPopular')}<"),
    (">送{plan.eliteLabel}<", ">{t('course.includes')}{plan.eliteLabel}<"),
    (">一次付清 · 终身访问<", ">{t('course.oneTime')}<"),
    ("<><Loader2 className=\"w-4 h-4 animate-spin\" />处理中...</>", "<><Loader2 className=\"w-4 h-4 animate-spin\" />{t('course.processing')}</>"),
    ("<>立即购买 <ArrowRight", "<>{t('course.buyNow')} <ArrowRight"),
    (">课程大纲<", ">{t('course.outlineTitle')}<"),
    ("module: '模块一', title: '交易基础', chapters: '6章', desc: '市场结构、K线、趋势识别'",
     "module: t('course.module1'), title: t('course.module1Title'), chapters: '6 ' + t('course.chapUnit'), desc: t('course.module1Desc')"),
    ("module: '模块二', title: '技术分析', chapters: '6章', desc: '支撑阻力、指标体系、形态分析'",
     "module: t('course.module2'), title: t('course.module2Title'), chapters: '6 ' + t('course.chapUnit'), desc: t('course.module2Desc')"),
    ("module: '模块三', title: '策略构建', chapters: '6章', desc: '回测方法、参数优化、风险管理'",
     "module: t('course.module3'), title: t('course.module3Title'), chapters: '6 ' + t('course.chapUnit'), desc: t('course.module3Desc')"),
    ("module: '模块四', title: '心态与纪律', chapters: '6章', desc: '情绪管理、交易日志、持续进化'",
     "module: t('course.module4'), title: t('course.module4Title'), chapters: '6 ' + t('course.chapUnit'), desc: t('course.module4Desc')"),
    (">一次付清 · 终身受益<", ">{t('course.guarantee')}<"),
    ("没有订阅费，没有隐藏收费。买一次，永久访问所有课程内容和未来更新。", "{t('course.guaranteeDesc')}"),
]

for old, new in course_reps:
    if old in cc:
        cc = cc.replace(old, new, 1)

with open(course_path, 'w') as f:
    f.write(cc)
print(f"  app/course/page.tsx: done")

# ====== MISSION CONTROL PAGE ======
print("=== app/mission-control/page.tsx ===")
ensure_i18n_import('app/mission-control/page.tsx')

mc_path = os.path.join(BASE, 'app/mission-control/page.tsx')
with open(mc_path, 'r') as f:
    mc = f.read()

# Find the default export component and add t
if "const { t } = useI18n();" not in mc:
    mc = re.sub(
        r'(export default function \w+\([^)]*\)\s*\{)',
        lambda m: m.group(0) + "\n  const { t } = useI18n();",
        mc, 1
    )

mc_reps = [
    (">任务控制中心<", ">{t('missionControl.title')}<"),
    ("按左侧 tab 组织任务流，当前先聚焦 Mission Control / Factory 的执行界面。", "{t('missionControl.desc')}"),
    (">1. 左侧 tab 固定导航<", ">{t('missionControl.note1Title')}<"),
    ("先把页面结构做成更像操作系统 / 控制中心，而不是普通 dashboard。", "{t('missionControl.note1Desc')}"),
    (">2. 中间多列任务流<", ">{t('missionControl.note2Title')}<"),
    ("用 Backlog / Building / QA 三列承接任务推进感，更接近你给的参考图。", "{t('missionControl.note2Desc')}"),
    (">3. 为后续模块预留壳<", ">{t('missionControl.note3Title')}<"),
    ("现在先把 shell 和观感拉齐，后面再把 approvals、content、agents 等真实数据逐步接进来。", "{t('missionControl.note3Desc')}"),
    ("当前这版适合作为任务控制中心 V2 外观底板", "{t('missionControl.currentNote')}"),
]

for old, new in mc_reps:
    if old in mc:
        mc = mc.replace(old, new, 1)

with open(mc_path, 'w') as f:
    f.write(mc)
print(f"  app/mission-control/page.tsx: done")

# ====== DASHBOARD PAGE - path guidance section ======
print("=== app/dashboard/page.tsx (paths) ===")
dash_path = os.path.join(BASE, 'app/dashboard/page.tsx')
with open(dash_path, 'r') as f:
    dc = f.read()

dash_reps = [
    ("title: '新手起步',", "title: t('dashboard.path.beginner.title'),"),
    ("subtitle: '先看结构，再练手，再做策略。',", "subtitle: t('dashboard.path.beginner.subtitle'),"),
    ("fit: '适合刚注册、还不知道先点哪里的人'", "fit: t('dashboard.path.beginner.fit')"),
    ("ctaLabel: '从市场体检开始',", "ctaLabel: t('dashboard.path.beginner.cta'),"),
    ("title: '进阶交易者',", "title: t('dashboard.path.intermediate.title'),"),
    ("subtitle: '先确认风险环境，再去 Practice 校准执行。',", "subtitle: t('dashboard.path.intermediate.subtitle'),"),
    ("fit: '适合已有交易经验，但想提升一致性的人'", "fit: t('dashboard.path.intermediate.fit')"),
    ("ctaLabel: '直接进入 Practice',", "ctaLabel: t('dashboard.path.intermediate.cta'),"),
    ("title: '高频研究者',", "title: t('dashboard.path.advanced.title'),"),
    ("subtitle: '先筛掉坏环境，再把想法送进策略工坊。',", "subtitle: t('dashboard.path.advanced.subtitle'),"),
    ("fit: '适合有策略基础、想做系统化回测和优化的人'", "fit: t('dashboard.path.advanced.fit')"),
    ("ctaLabel: '进入策略工坊',", "ctaLabel: t('dashboard.path.advanced.cta'),"),
]

for old, new in dash_reps:
    if old in dc:
        dc = dc.replace(old, new, 1)

# Check remaining Chinese in dashboard
with open(dash_path, 'w') as f:
    f.write(dc)
print(f"  app/dashboard/page.tsx: done")

# ====== STRATEGY PAGE ======
print("=== app/strategy/page.tsx ===")
ensure_i18n_import('app/strategy/page.tsx')

strat_page_path = os.path.join(BASE, 'app/strategy/page.tsx')
with open(strat_page_path, 'r') as f:
    spc = f.read()

# Check if t is already extracted — strategy page might use 't' as variable name for trades
# Look for const { t } pattern
if "const { t: translate } = useI18n();" not in spc and "const { t } = useI18n();" not in spc:
    # Strategy page uses `t` for trade items in map. We need to use a different name
    # Actually let's check...
    if ".map((t," in spc or ".map((t)" in spc:
        # Uses `t` as iteration variable. We need to rename our translation function
        # Add as `tr` instead
        spc = re.sub(
            r'(export default function \w+\([^)]*\)\s*\{)',
            lambda m: m.group(0) + "\n  const { t: tr, locale } = useI18n();",
            spc, 1
        )
        T = "tr"
    else:
        spc = re.sub(
            r'(export default function \w+\([^)]*\)\s*\{)',
            lambda m: m.group(0) + "\n  const { t, locale } = useI18n();",
            spc, 1
        )
        T = "t"
else:
    T = "t"

strat_reps = [
    ("/>当前</span>", f"/>{{{T}('strategy.current')}}</span>"),
    ("交易明细（{trades.length}笔）", f"{{{T}('strategy.tradeDetails')}} ({{trades.length}}{{{T}('strategy.tradeCount')}})"),
    (">时间</th>", f">{{{T}('strategy.time')}}</th>"),
    (">方向</th>", f">{{{T}('strategy.direction')}}</th>"),
    (">入场</th>", f">{{{T}('strategy.entry')}}</th>"),
    (">出场</th>", f">{{{T}('strategy.exit')}}</th>"),
    (">盈亏</th>", f">{{{T}('strategy.pnl')}}</th>"),
    (">盈亏%</th>", f">{{{T}('strategy.pnlPct')}}</th>"),
    (">原因</th>", f">{{{T}('strategy.reason')}}</th>"),
    ("'做多' : '做空'", f"{T}('strategy.long') : {T}('strategy.short')"),
    ("'止损'", f"{T}('strategy.exitStopLoss')"),
    ("'止盈'", f"{T}('strategy.exitTakeProfit')"),
    ("'信号'", f"{T}('strategy.exitSignal')"),
    ("label: '总收益'", f"label: {T}('strategy.totalReturn')"),
    ("label: '胜率'", f"label: {T}('strategy.winRateLabel')"),
    ("label: '盈亏比'", f"label: {T}('strategy.profitFactor')"),
    ("label: '最大回撤'", f"label: {T}('strategy.maxDrawdown')"),
    ("label: '夏普比率'", f"label: {T}('strategy.sharpeRatio')"),
    ("label: '总交易'", f"label: {T}('strategy.totalTrades')"),
    ("}笔`", f"}}{{{T}('strategy.tradeUnit')}}` " if False else None),
    (">指标</th>", f">{{{T}('strategy.metric')}}</th>"),
]

strat_reps = [(o, n) for o, n in strat_reps if o is not None and n is not None]

for old, new in strat_reps:
    if old in spc:
        spc = spc.replace(old, new)

with open(strat_page_path, 'w') as f:
    f.write(spc)
print(f"  app/strategy/page.tsx: done (using {T} for translations)")

print("\n✅ Round 3b complete!")
