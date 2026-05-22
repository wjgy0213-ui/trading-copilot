'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { getAIScores } from '@/lib/storage';
import { useI18n } from '@/lib/i18n';
import { formatLocaleTime } from '@/lib/i18n-helpers';

interface ChatMessage {
  type: 'coach' | 'system';
  score?: number;
  text: string;
  timestamp: number;
  variant?: 'success' | 'warning' | 'info' | 'error';
}

export default function AICoach() {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for lesson context
    const lessonData = typeof window !== 'undefined' ? localStorage.getItem('tc-lesson-context') : null;
    let lessonMsg: ChatMessage | null = null;
    if (lessonData) {
      try {
        const lesson = JSON.parse(lessonData);
        lessonMsg = {
          type: 'coach',
          text: t('coach.lesson_context')
            .replace('{title}', lesson.lessonTitle)
            .replace('{homework}', lesson.homework),
          timestamp: Date.now() - 5000,
          variant: 'info',
        };
        // Clear after reading
        localStorage.removeItem('tc-lesson-context');
      } catch {}
    }

    // 初始欢迎消息
    const welcome: ChatMessage[] = [
      ...(lessonMsg ? [lessonMsg] : []),
      {
        type: 'coach',
        text: lessonMsg ? t('coach.lesson_welcome') : t('coach.welcome'),
        timestamp: Date.now() - 10000,
        variant: 'info',
      },
    ];

    // 从存储加载历史评分（最近5条）
    const scoresRecord = getAIScores();
    const scores = Object.values(scoresRecord);
    const scoreMessages: ChatMessage[] = scores.slice(-5).map((s) => ({
      type: 'coach' as const,
      score: s.entryScore,
      text: s.feedback.entry.join(' '),
      timestamp: Date.now(),
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
    success: 'bg-green-950/30 border-green-700/30',
    warning: 'bg-yellow-950/30 border-yellow-700/30',
    info: 'bg-blue-950/30 border-blue-700/30',
    error: 'bg-red-950/30 border-red-700/30',
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold">{t('coach.title')}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
            {t('coach.monitoring')}
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
              <div className={`font-mono font-bold mb-1.5 flex items-center gap-2 ${scoreColor(msg.score)}`}>
                <Sparkles className="w-3.5 h-3.5" />
                {msg.score}/100
              </div>
            )}
            <p className="text-gray-300 leading-relaxed">{msg.text}</p>
            <div className="text-xs text-gray-600 mt-2 font-mono">
              {formatLocaleTime(msg.timestamp, locale)}
            </div>
          </div>
        ))}
        {messages.length <= 1 && (
          <div className="text-center text-gray-600 text-sm py-8">
            {t('coach.first_trade')}
          </div>
        )}
      </div>
    </div>
  );
}
