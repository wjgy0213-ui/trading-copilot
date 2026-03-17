'use client';

import { useState, useEffect } from 'react';
import { X, Zap, Shield, Brain, TrendingUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function WelcomeModal() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('tc-welcome-seen');
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('tc-welcome-seen', '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-300">
        <button onClick={dismiss} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">{t('welcome.title')}</h2>
          <p className="text-gray-400 mt-2">{t('welcome.subtitle')}</p>
        </div>

        <div className="space-y-4 mb-8">
          <Feature icon={<TrendingUp className="w-5 h-5 text-green-400" />} title={t('welcome.feat_realtime')} desc={t('welcome.feat_realtime_desc')} />
          <Feature icon={<Brain className="w-5 h-5 text-blue-400" />} title={t('welcome.feat_ai')} desc={t('welcome.feat_ai_desc')} />
          <Feature icon={<Shield className="w-5 h-5 text-yellow-400" />} title={t('welcome.feat_risk')} desc={t('welcome.feat_risk_desc')} />
        </div>

        <button
          onClick={dismiss}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-lg transition-all"
        >
          {t('welcome.start')}
        </button>

        <p className="text-center text-xs text-gray-600 mt-4">
          {t('welcome.disclaimer')}
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
    </div>
  );
}
