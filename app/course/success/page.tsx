'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckCircle, ArrowRight, BookOpen, Shield, Loader2 } from 'lucide-react';

function SuccessContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const activatedRef = useRef(false);

  useEffect(() => {
    if (sessionId && !activatedRef.current) {
      activatedRef.current = true;
      fetch('/api/auth/me').catch(() => {});
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/20">
          <CheckCircle className="w-14 h-14 text-emerald-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">{t('courseSuccess.title')}</h1>
        <p className="text-gray-400 mb-8">{t('courseSuccess.desc')}</p>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">{t('courseSuccess.allCourses')}</div>
              <div className="text-xs text-gray-500">{t('courseSuccess.allCoursesDesc')}</div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
          </div>
          <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <Shield className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">{t('courseSuccess.eliteTrial')}</div>
              <div className="text-xs text-gray-500">{t('courseSuccess.eliteTrialDesc')}</div>
            </div>
            <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
          </div>
        </div>

        <Link href="/learn" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-lg shadow-violet-900/30">
          {t('courseSuccess.startLesson')} <ArrowRight className="w-4 h-4" />
        </Link>
        
        <p className="text-xs text-gray-600 mt-4">{t('courseSuccess.emailSent')}</p>
      </div>
    </div>
  );
}

export default function CourseSuccessPage() {
  const { t } = useI18n();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" role="status" aria-live="polite" aria-label={t('common.loading')}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" aria-hidden="true" />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
