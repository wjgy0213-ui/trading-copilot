'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { getAIScores } from '@/lib/storage';

interface ChatMessage {
  type: 'ai' | 'system';
  score?: number;
  text: string;
  timestamp: number;
  variant?: 'success' | 'warning' | 'info' | 'error';
}

export default function AICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始欢迎消息
    const welcome: ChatMessage[] = [
      {
        type: 'ai',
        text: '👋 我是你的AI交易教练！每笔交易我都会实时评分并给出建议。准备好了吗？',
        timestamp: Date.now() - 10000,
        variant: 'info',
      },
    ];

    // 从存储加载历史评分（最近5条）
    const scoresRecord = getAIScores();
    const scores = Object.values(scoresRecord);
    const scoreMessages: ChatMessage[] = scores.slice(-5).map((s) => ({
      type: 'ai' as const,
      score: s.entryScore,
      text: s.feedback.entry.join(' '),
      timestamp: Date.now(), // 使用当前时间作为占位符
      variant: s.entryScore >= 70 ? 'success' as const : s.entryScore >= 40 ? 'warning' as const : 'error' as const,
    }));

    setMessages([...welcome, ...scoreMessages]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const variantStyles: Record<string, string> = {
    success: 'bg-green-600/10 border-green-500/20',
    warning: 'bg-yellow-600/10 border-yellow-500/20',
    info: 'bg-blue-600/10 border-blue-500/20',
    error: 'bg-red-600/10 border-red-500/20',
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold">AI 教练</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
            在线
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 border text-sm ${variantStyles[msg.variant || 'info']}`}
          >
            {msg.score !== undefined && (
              <div className={`font-bold mb-1 flex items-center gap-2 ${scoreColor(msg.score)}`}>
                <Sparkles className="w-4 h-4" />
                评分: {msg.score}/100
              </div>
            )}
            <p className="text-gray-300 leading-relaxed">{msg.text}</p>
            <div className="text-xs text-gray-600 mt-2">
              {new Date(msg.timestamp).toLocaleTimeString('zh-CN')}
            </div>
          </div>
        ))}
        {messages.length <= 1 && (
          <div className="text-center text-gray-600 text-sm py-8">
            开始交易后，这里会显示AI教练的实时评分和建议 💡
          </div>
        )}
      </div>
    </div>
  );
}
