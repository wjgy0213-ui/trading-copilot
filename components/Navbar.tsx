'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import {
  BarChart3, BookOpen, History, Home, Zap, LineChart, TrendingUp, Newspaper,
  Sparkles, CreditCard, UserCircle, LogIn, Shield, Activity, Crosshair,
  Fish, Gamepad2, Brain, ShieldAlert, Radio, ChevronDown, Menu, X
} from 'lucide-react';
import { TrialCountdown } from './Paywall';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  premium?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const MAIN_ITEMS: NavItem[] = [
  { href: '/', label: '首页', icon: Home },
  { href: '/dashboard', label: '仪表盘', icon: LineChart },
  { href: '/health', label: '体检', icon: Activity },
  { href: '/signals', label: '信号', icon: Radio, premium: true },
  { href: '/news', label: '资讯', icon: Newspaper },
];

const GROUPS: NavGroup[] = [
  {
    label: '交易',
    items: [
      { href: '/trade', label: '实时交易', icon: Zap },
      { href: '/practice', label: '模拟陪练', icon: Gamepad2 },
      { href: '/sniper', label: 'Meme Sniper', icon: Crosshair },
      { href: '/whales', label: '鲸鱼追踪', icon: Fish },
      { href: '/backtest', label: '策略回测', icon: TrendingUp },
      { href: '/history', label: '交易历史', icon: History },
    ],
  },
  {
    label: 'Pro',
    items: [
      { href: '/strategy', label: '策略工坊', icon: Sparkles, premium: true },
      { href: '/ai-strategy', label: 'AI策略', icon: Sparkles, premium: true },
      { href: '/review', label: 'AI复盘', icon: Brain, premium: true },
      { href: '/guardian', label: '风控守门员', icon: ShieldAlert, premium: true },
      { href: '/elite', label: 'Elite控制台', icon: Shield, premium: true },
    ],
  },
  {
    label: '更多',
    items: [
      { href: '/blog', label: 'Blog', icon: BookOpen },
      { href: '/learn', label: '免费课程', icon: BookOpen },
      { href: '/course', label: '购买课程', icon: BookOpen, premium: true },
      { href: '/pricing', label: '定价', icon: CreditCard },
      { href: '/account', label: '账户设置', icon: UserCircle },
    ],
  },
];

function Dropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = group.items.some(i => i.href === pathname);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
          isActive ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/50'
        }`}
      >
        {group.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-1 z-50">
          {group.items.map(({ href, label, icon: Icon, premium }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs transition-all ${
                  active
                    ? premium ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-white'
                    : premium ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/5' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: authSession, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-[1400px] mx-auto px-3">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-100 tracking-tight">交易陪练</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {MAIN_ITEMS.map(({ href, label, icon: Icon, premium }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? premium ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-800 text-white'
                      : premium ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
            {GROUPS.map(g => <Dropdown key={g.label} group={g} />)}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Auth */}
          <div className="shrink-0 flex items-center gap-2">
            <TrialCountdown />
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

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800/50 max-h-[80vh] overflow-y-auto">
          <div className="px-3 py-2 space-y-1">
            {MAIN_ITEMS.map(({ href, label, icon: Icon, premium }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${
                  pathname === href
                    ? premium ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50'
                }`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            {GROUPS.map(g => (
              <div key={g.label}>
                <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-3 pt-3 pb-1">{g.label}</div>
                {g.items.map(({ href, label, icon: Icon, premium }) => (
                  <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${
                      pathname === href
                        ? premium ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-white'
                        : premium ? 'text-emerald-500/60' : 'text-gray-400 hover:bg-gray-800/50'
                    }`}>
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
