'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// AI教练预设回答（V1离线版，不依赖API）
const COACH_KNOWLEDGE: Record<string, string> = {
  '止损': `**止损是交易生存的第一法则。**

没有止损 = 让市场决定你亏多少。这是最危险的事。

**设置止损的原则：**
1. 入场前就确定止损位，不要边走边看
2. 止损放在你的交易逻辑"失效"的位置
3. 单笔亏损不超过总资金的2-5%
4. 永远不要移动止损让亏损变大

**常见错误：**
- 不设止损（最致命）
- 止损太近被扫（需要给价格波动空间）
- 止损太远（单笔风险过大）
- 到了止损位不执行（心态问题）

记住：好的交易者不是不亏钱，而是亏得少、亏得可控。`,

  '仓位': `**仓位管理决定你的生死。**

不管你分析得多对，仓位错了一样会死。

**核心公式：**
仓位 = (总资金 × 可承受亏损%) ÷ (入场价 - 止损价)

**举例：**
- 账户 $500，风险容忍 2%（$10）
- BTC 入场 $65,000，止损 $64,000（距离 $1,000）
- 仓位 = $10 ÷ $1,000 = 0.01 BTC

**分级建议：**
| 经验 | 单笔风险 | 最大杠杆 |
|------|---------|---------|
| 新手 | 1-2% | 1-2x |
| 进阶 | 2-3% | 3-5x |
| 老手 | 3-5% | 5-10x |

**金句：永远不要让一笔交易决定你的生死。**`,

  '情绪': `**情绪是交易最大的敌人。**

FOMO（害怕错过）→ 追高买入
恐惧 → 恐慌抛售
贪婪 → 不止盈，利润回吐
报仇 → 亏损后加仓想回本

**如何管理情绪：**
1. **写交易计划** — 入场前写下：为什么买、在哪止损、在哪止盈
2. **按计划执行** — 计划是理性时做的决策，执行时不要改
3. **设冷静期** — 大亏后停止交易24小时
4. **记交易日志** — 每笔交易记录当时的情绪状态
5. **接受亏损** — 亏损是交易的成本，不是失败

**检测情绪化交易的信号：**
- 频繁交易（1小时内多次开平仓）
- 亏损后立刻开新仓
- 加仓加杠杆想"回本"
- 凌晨还在盯盘不睡觉`,

  '趋势': `**顺势而为是交易最基本的原则。**

"Don't fight the trend" — 不要跟趋势作对。

**判断趋势的方法：**
1. **均线** — 价格在20/50均线上方 = 上升趋势
2. **高低点** — 高点越来越高 + 低点越来越高 = 上涨
3. **成交量** — 放量突破 = 趋势确认

**交易规则：**
- 上升趋势中：只做多，回调买入
- 下降趋势中：只做空或观望
- 震荡中：减少交易，降低仓位

**新手最常犯的错：**
在下跌趋势中"抄底" → 接飞刀 → 越抄越深`,

  '杠杆': `**杠杆是双刃剑，用不好会加速死亡。**

**杠杆的真相：**
- 2x杠杆：赚2%变4%，亏2%变4%
- 10x杠杆：赚2%变20%，亏2%变20%
- 10x + 10%波动 = 爆仓

**正确使用杠杆：**
1. 先用1x练习，连续盈利3个月再加
2. 最高不超过5x（新手不超过3x）
3. 杠杆越高，仓位越小
4. 永远设止损

**错误示范：**
$500本金 → 20x杠杆 → $10,000仓位 → 5%波动 → 爆仓
这不是交易，是赌博。

**记住：活得久比赚得多重要。**`,
};

// 匹配用户问题到预设知识
function matchKnowledge(input: string): string | null {
  const lower = input.toLowerCase();
  const keywords: Record<string, string[]> = {
    '止损': ['止损', 'stop loss', 'stoploss', '割肉', '止亏'],
    '仓位': ['仓位', 'position size', '资金管理', '风控', '风险管理', '多少钱'],
    '情绪': ['情绪', 'fomo', '恐惧', '贪婪', '心态', '冲动', '报仇', '回本'],
    '趋势': ['趋势', 'trend', '方向', '均线', '牛熊', '多空'],
    '杠杆': ['杠杆', 'leverage', '倍数', '合约', '爆仓'],
  };

  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) {
      return COACH_KNOWLEDGE[topic];
    }
  }
  return null;
}

export default function AICoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 我是你的AI交易教练。\n\n你可以问我关于**止损、仓位管理、情绪控制、趋势判断、杠杆使用**等交易问题。\n\n每一笔模拟交易后，我也会给你评分和建议。有什么想问的？',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      const knowledge = matchKnowledge(userMsg.content);
      const response = knowledge || 
        `这是个好问题！目前我的知识库覆盖以下话题：

• **止损** — 怎么设、设在哪
• **仓位管理** — 该投多少钱
• **情绪控制** — 如何避免冲动交易
• **趋势判断** — 怎么看市场方向
• **杠杆使用** — 多少倍合适

试着问我这些方面的问题吧！后续版本会支持更多话题和个性化建议。`;

      const assistantMsg: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
        <Bot className="w-5 h-5 text-blue-400" />
        <span className="font-semibold">AI 交易教练</span>
        <span className="text-xs text-gray-500 ml-auto">V1 · 离线版</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-200'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-700 rounded-lg px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="问我关于交易的问题..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-3 py-2 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          {['止损怎么设？', '仓位该多大？', '怎么控制情绪？'].map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded-full px-3 py-1 transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
