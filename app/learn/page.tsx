'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Clock, ChevronRight, ChevronDown, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { COURSE_CHAPTERS, Chapter, Lesson, QuizQuestion } from '@/lib/courseData';
import { isProUser, activatePro } from '@/lib/paywall';

function PaywallBanner({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleActivate = () => {
    if (activatePro(code)) {
      onUnlock();
    } else {
      setError('激活码无效');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-8 border border-purple-500/20 mb-8"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">解锁完整课程</h3>
          <p className="text-gray-400 text-sm mb-4">
            高级课程包含偏向判定系统、顶底信号评分、波段交易6步系统、情绪指标等核心内容。
            由经历过多轮周期的实战交易者编写，每一课都是真金白银换来的经验。
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            {['4大章节', '10+课时', '实战策略', '评分体系', '终身访问'].map((tag) => (
              <span key={tag} className="text-xs bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          
          {!showInput ? (
            <div className="flex gap-3">
              <button
                onClick={() => setShowInput(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              >
                输入激活码
              </button>
              <a
                href="https://t.me/SlowManJW"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-gray-700"
              >
                获取激活码 →
              </a>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                placeholder="输入激活码..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleActivate}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                激活
              </button>
            </div>
          )}
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </motion.div>
  );
}

function LessonCard({ lesson, index, locked }: { lesson: Lesson; index: number; locked: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border transition-all ${
        locked
          ? 'bg-gray-900/50 border-gray-800/50 opacity-70'
          : 'bg-gray-900 border-gray-800 hover:border-gray-700'
      }`}
    >
      <button
        onClick={() => !locked && setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left"
        disabled={locked}
      >
        <span className="text-2xl">{lesson.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{lesson.title}</h4>
            {locked && <Lock className="w-3.5 h-3.5 text-gray-600" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{lesson.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lesson.duration}
          </span>
          {!locked && (
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>
      
      {expanded && !locked && (
        <div className="px-5 pb-5 border-t border-gray-800">
          <div className="prose prose-invert prose-sm max-w-none mt-4">
            <LessonContent content={lesson.content} />
          </div>
          {lesson.homework && (
            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
              <div className="text-sm font-semibold text-blue-400 mb-2">📝 课后作业</div>
              <p className="text-sm text-gray-300">{lesson.homework}</p>
            </div>
          )}
          {lesson.quiz && lesson.quiz.length > 0 && (
            <div className="mt-6">
              <QuizSection quiz={lesson.quiz} lessonId={lesson.id} />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function LessonContent({ content }: { content: string }) {
  // 简单的markdown渲染
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inCode = false;
  let codeLines: string[] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                {tableRows[0].map((cell, i) => (
                  <th key={i} className="text-left py-2 px-3 text-gray-400 font-medium">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(2).map((row, ri) => (
                <tr key={ri} className="border-b border-gray-800/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 text-gray-300">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre key={`code-${i}`} className="bg-gray-800 rounded-lg p-4 text-sm overflow-x-auto my-3">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCode = false;
      } else {
        flushTable();
        inCode = true;
      }
      return;
    }
    if (inCode) { codeLines.push(line); return; }

    if (line.startsWith('|')) {
      inTable = true;
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
      if (!cells.every(c => /^[-:]+$/.test(c))) {
        tableRows.push(cells);
      } else {
        tableRows.push(cells); // separator row
      }
      return;
    } else if (inTable) {
      inTable = false;
      flushTable();
    }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-bold mt-5 mb-2 text-blue-400">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-blue-500 pl-4 my-3 text-gray-300 italic">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 ml-2 my-1">
          <span className="text-blue-400 mt-1">•</span>
          <span className="text-gray-300 text-sm">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === '') {
      // skip
    } else {
      elements.push(<p key={i} className="text-gray-300 text-sm leading-relaxed my-2">{renderInline(line)}</p>);
    }
  });
  flushTable();

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Bold
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function QuizSection({ quiz, lessonId }: { quiz: QuizQuestion[]; lessonId: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const score = Object.entries(answers).filter(([qIdx, optIdx]) => quiz[parseInt(qIdx)].correctIndex === optIdx).length;

  return (
    <div className="border border-gray-800 rounded-xl p-5 bg-gray-900/50">
      <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
        📋 小测试（{quiz.length}题）
        {showResults && <span className={`text-xs px-2 py-0.5 rounded-full ${score === quiz.length ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>{score}/{quiz.length}</span>}
      </h4>
      <div className="space-y-5">
        {quiz.map((q, qi) => (
          <div key={qi}>
            <p className="text-sm font-medium mb-2">{qi + 1}. {q.question}</p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = q.correctIndex === oi;
                let cls = 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600';
                if (showResults && selected && isCorrect) cls = 'bg-green-600/20 border-green-500/30 text-green-300';
                else if (showResults && selected && !isCorrect) cls = 'bg-red-600/20 border-red-500/30 text-red-300';
                else if (showResults && isCorrect) cls = 'bg-green-600/10 border-green-500/20 text-green-400';
                else if (selected) cls = 'bg-blue-600/20 border-blue-500/30 text-blue-300';
                return (
                  <button key={oi} onClick={() => handleAnswer(qi, oi)} className={`w-full text-left text-sm p-3 rounded-lg border transition ${cls}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResults && answers[qi] !== undefined && (
              <p className="text-xs text-gray-400 mt-2 pl-2 border-l-2 border-gray-700">{q.explanation}</p>
            )}
          </div>
        ))}
      </div>
      {!showResults ? (
        <button
          onClick={() => Object.keys(answers).length === quiz.length && setShowResults(true)}
          disabled={Object.keys(answers).length < quiz.length}
          className={`mt-4 px-5 py-2 rounded-lg text-sm font-medium transition ${Object.keys(answers).length === quiz.length ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
        >
          提交答案
        </button>
      ) : (
        <button onClick={() => { setAnswers({}); setShowResults(false); }} className="mt-4 px-5 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition">
          重新答题
        </button>
      )}
    </div>
  );
}

function ChapterSection({ chapter, isPro, chapterIndex }: { chapter: Chapter; isPro: boolean; chapterIndex: number }) {
  const locked = chapter.tier === 'pro' && !isPro;
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-10"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{chapter.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{chapter.title}</h2>
            {chapter.tier === 'pro' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isPro ? 'bg-green-600/20 text-green-400' : 'bg-purple-600/20 text-purple-400'
              }`}>
                {isPro ? '✓ 已解锁' : '🔒 PRO'}
              </span>
            )}
            {chapter.comingSoon && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-600/20 text-yellow-400">
                🔄 更新中
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{chapter.description}</p>
        </div>
      </div>
      <div className="space-y-2 ml-2">
        {chapter.lessons.map((lesson, i) => (
          <LessonCard key={lesson.id} lesson={lesson} index={i} locked={locked} />
        ))}
      </div>
    </motion.section>
  );
}

export default function LearnPage() {
  const [isPro, setIsPro] = useState(() => {
    if (typeof window !== 'undefined') return isProUser();
    return false;
  });

  const totalLessons = COURSE_CHAPTERS.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const freeLessons = COURSE_CHAPTERS.filter(ch => ch.tier === 'free').reduce((acc, ch) => acc + ch.lessons.length, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            📚 交易课程
          </h1>
          <p className="text-gray-400">
            从零基础到系统化交易者。{totalLessons}节课，{freeLessons}节免费，持续更新中。
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              {freeLessons}节免费
            </span>
            <span className="flex items-center gap-1">
              {isPro ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-purple-400" />}
              {totalLessons - freeLessons}节高级
            </span>
          </div>
        </motion.div>

        {/* Paywall */}
        {!isPro && <PaywallBanner onUnlock={() => setIsPro(true)} />}

        {/* Chapters */}
        {COURSE_CHAPTERS.map((chapter, i) => (
          <ChapterSection key={chapter.id} chapter={chapter} isPro={isPro} chapterIndex={i} />
        ))}

        {/* Bottom CTA */}
        {!isPro && (
          <div className="text-center py-12 border-t border-gray-800 mt-12">
            <h3 className="text-2xl font-bold mb-3">准备好升级了吗？</h3>
            <p className="text-gray-400 mb-6">解锁全部高级课程，系统化提升你的交易能力</p>
            <a
              href="https://t.me/SlowManJW"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105"
            >
              获取激活码
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
