'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookOpen, History, Home, Zap, LineChart, TrendingUp, Newspaper, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '首页', icon: Home },
  { href: '/trade', label: '交易', icon: Zap },
  { href: '/dashboard', label: '仪表盘', icon: LineChart },
  { href: '/backtest', label: '回测', icon: TrendingUp },
  { href: '/news', label: '资讯', icon: Newspaper },
  { href: '/strategy', label: '策略工坊', icon: Sparkles, premium: true },
  { href: '/learn', label: '课程', icon: BookOpen },
  { href: '/history', label: '历史', icon: History },
];

export default function Navbar() {
  const pathname = usePathname();

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

          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
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
        </div>
      </div>
    </nav>
  );
}
