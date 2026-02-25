'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart3, BookOpen, History, Home, Zap, LineChart, TrendingUp, Newspaper, Sparkles, CreditCard, UserCircle, LogIn } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '首页', icon: Home },
  { href: '/trade', label: '交易', icon: Zap },
  { href: '/dashboard', label: '仪表盘', icon: LineChart },
  { href: '/backtest', label: '回测', icon: TrendingUp },
  { href: '/news', label: '资讯', icon: Newspaper },
  { href: '/strategy', label: '策略工坊', icon: Sparkles, premium: true },
  { href: '/ai-strategy', label: 'AI策略', icon: Sparkles, premium: true },
  { href: '/pricing', label: '定价', icon: CreditCard, premium: true },
  { href: '/learn', label: '课程', icon: BookOpen },
  { href: '/history', label: '历史', icon: History },
  { href: '/account', label: '账户', icon: UserCircle, premium: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: authSession, status } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-[1400px] mx-auto px-3">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-100 tracking-tight">交易陪练</span>
          </Link>

          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide flex-1 justify-center">
            {NAV_ITEMS.map(({ href, label, icon: Icon, premium }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? premium ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-800 text-white'
                      : premium ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth */}
          <div className="shrink-0">
            {status === 'authenticated' && authSession?.user ? (
              <Link href="/account" className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-gray-800/50 transition">
                {authSession.user.image ? (
                  <img src={authSession.user.image} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <UserCircle className="w-5 h-5 text-emerald-400" />
                )}
                <span className="text-xs text-gray-400 hidden sm:inline">{authSession.user.name?.split(' ')[0]}</span>
              </Link>
            ) : status !== 'loading' ? (
              <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium transition border border-emerald-700/30">
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">登录</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
