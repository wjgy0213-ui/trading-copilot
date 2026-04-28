'use client';

import { useState } from 'react';
import { BarChart3, Users, Eye, CreditCard, TrendingUp, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface LeadItem {
  id: string;
  email?: string | null;
  wechat?: string | null;
  source?: string | null;
  status?: string | null;
  priority?: string | null;
  notes?: string | null;
  paid_plan?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  trial_started_at?: string | null;
  converted_at?: string | null;
}

interface DayStat {
  date: string;
  pageviews?: number;
  signups?: number;
  checkouts?: number;
  trials?: number;
  [key: string]: unknown;
}

export default function AdminPage() {
  const { t, locale } = useI18n();
  const [stats, setStats] = useState<DayStat[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);

  const fetchStats = async (key: string) => {
    setLoading(true);
    try {
      const [statsRes, leadsRes] = await Promise.all([
        fetch(`/api/analytics?key=${key}&days=14`),
        fetch(`/api/admin/leads?key=${key}&limit=20`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || []);
        setAuthed(true);
      } else {
        setAuthed(false);
      }

      if (leadsRes.ok) {
        const leadData = await leadsRes.json();
        setLeads(leadData.leads || []);
      } else {
        setLeads([]);
      }
    } catch {
      setAuthed(false);
      setLeads([]);
    }
    setLoading(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-sm w-full">
          <h1 className="text-xl font-bold text-white mb-4">🔐 {t('elite.adminAccess')}</h1>
          <input
            type="password"
            placeholder={t('elite.adminSecret')}
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStats(secret)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4"
          />
          <button
            onClick={() => fetchStats(secret)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition"
          >
            {t('elite.loginButton')}
          </button>
        </div>
      </div>
    );
  }

  const total = (key: string) => stats.reduce((s, d) => s + (Number(d[key]) || 0), 0);
  const today = stats[0] || {};

  // Extract page breakdown from today's stats
  const pages = Object.entries(today)
    .filter(([k]) => k.startsWith('page:'))
    .map(([k, v]) => ({ page: k.replace('page:', ''), views: Number(v) }))
    .sort((a, b) => b.views - a.views);

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">📊 {t('elite.adminDashboard')}</h1>
          <button
            onClick={() => fetchStats(secret)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {t('elite.refreshButton')}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Eye, label: t('admin.totalViews14d'), value: total('pageviews'), color: 'text-blue-400' },
            { icon: Users, label: t('admin.waitlists'), value: total('waitlists'), color: 'text-emerald-400' },
            { icon: TrendingUp, label: t('admin.trialStarts'), value: total('trials'), color: 'text-amber-400' },
            { icon: CreditCard, label: t('admin.checkoutSuccess'), value: total('checkout_successes'), color: 'text-violet-400' },
          ].map((card, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-gray-500">{card.label}</span>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Daily Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> {t('elite.dailyBreakdown')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">{t('admin.thDate')}</th>
                  <th className="text-right py-2 px-3">{t('admin.thViews')}</th>
                  <th className="text-right py-2 px-3">{t('admin.thWaitlists')}</th>
                  <th className="text-right py-2 px-3">{t('admin.thTrials')}</th>
                  <th className="text-right py-2 px-3">{t('admin.thCheckoutOk')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((d, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-gray-300">{d.date}</td>
                    <td className="py-2 px-3 text-right">{Number(d.pageviews) || 0}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">{Number(d.waitlists) || 0}</td>
                    <td className="py-2 px-3 text-right text-amber-400">{Number(d.trials) || 0}</td>
                    <td className="py-2 px-3 text-right text-violet-400">{Number(d.checkout_successes) || 0}</td>
                  </tr>
                ))}
                {stats.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-600">{t('elite.noDataYet')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Page Breakdown */}
        {pages.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">📄 {t('elite.todaysPages')}</h2>
            <div className="space-y-2">
              {pages.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <span className="text-gray-300 text-sm font-mono">{p.page}</span>
                  <span className="text-gray-400 text-sm">{p.views} {t('elite.views')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Snapshot */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">🧾 {t('elite.latestLeads')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">{t('admin.thContact')}</th>
                  <th className="text-left py-2 px-3">{t('admin.thSource')}</th>
                  <th className="text-left py-2 px-3">{t('admin.thStatus')}</th>
                  <th className="text-left py-2 px-3">{t('admin.thPlan')}</th>
                  <th className="text-left py-2 px-3">{t('admin.thCreated')}</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-gray-300">{lead.email || lead.wechat || t('admin.emptyValue')}</td>
                    <td className="py-2 px-3 text-gray-400">{lead.source || t('admin.emptyValue')}</td>
                    <td className="py-2 px-3 text-emerald-400">{lead.status || t('admin.statusNew')}</td>
                    <td className="py-2 px-3 text-violet-400">{lead.paid_plan || t('admin.emptyValue')}</td>
                    <td className="py-2 px-3 text-gray-500">{lead.created_at ? new Date(lead.created_at).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US') : t('admin.emptyValue')}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-600">{t('elite.noLeadsYet')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
