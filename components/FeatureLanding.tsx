'use client';

import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface FeatureLandingProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  howItWorks: { step: string; title: string; desc: string }[];
  relatedFeatures: { name: string; href: string; desc: string }[];
  ctaText?: string;
  ctaHref?: string;
  color?: string;
}

const primaryButtonMap: Record<string, string> = {
  emerald: 'bg-emerald-600 hover:bg-emerald-500',
  blue: 'bg-blue-600 hover:bg-blue-500',
  cyan: 'bg-cyan-600 hover:bg-cyan-500',
  amber: 'bg-amber-500 hover:bg-amber-400 text-gray-950',
  violet: 'bg-violet-600 hover:bg-violet-500',
  rose: 'bg-rose-600 hover:bg-rose-500',
  orange: 'bg-orange-600 hover:bg-orange-500',
};

export default function FeatureLanding({
  icon,
  title,
  subtitle,
  description,
  benefits,
  howItWorks,
  relatedFeatures,
  ctaText,
  ctaHref = '/pricing',
  color = 'emerald',
}: FeatureLandingProps) {
  const colorMap: Record<string, { bg: string; text: string; border: string; ring: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', ring: 'ring-emerald-500/20' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', ring: 'ring-blue-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', ring: 'ring-cyan-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', ring: 'ring-amber-500/20' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', ring: 'ring-violet-500/20' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', ring: 'ring-rose-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', ring: 'ring-orange-500/20' },
  };
  const c = colorMap[color] || colorMap.emerald;
  const primaryButton = primaryButtonMap[color] || primaryButtonMap.emerald;
  const { t } = useI18n();
  const resolvedCtaText = ctaText || t('featureLanding.ctaText');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${c.bg} rounded-2xl mb-6 border ${c.border}`}>
            {icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl text-gray-300 mb-3">{subtitle}</p>
          <p className="text-gray-500 max-w-2xl mx-auto mb-8">{description}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link href={ctaHref}
              className={`inline-flex items-center justify-center gap-2 ${primaryButton} font-medium px-6 py-3.5 rounded-xl transition text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950`}>
              {resolvedCtaText} <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
            <Link href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3.5 rounded-xl transition text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950">
              {t('featureLanding.viewPricing')}
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">{t('featureLanding.keyBenefits')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-200">
                <Check className={`w-5 h-5 mt-0.5 shrink-0 ${c.text}`} />
                <span className="text-gray-300">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">{t('featureLanding.howItWorks')}</h2>
          <div className="space-y-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-gray-900/40 transition-all duration-200 group">
                <div className={`w-10 h-10 shrink-0 rounded-xl ${c.bg} flex items-center justify-center font-bold ${c.text} group-hover:scale-110 transition-transform duration-200`}>
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={`border ${c.border} rounded-xl p-8 ${c.bg} text-center mb-16`}>
          <h3 className="text-xl font-bold mb-2">{t('featureLanding.readyToTry')}</h3>
          <p className="text-gray-400 mb-4">{t('featureLanding.freeUpgrade')}</p>
          <Link href={ctaHref}
            className={`inline-flex items-center justify-center gap-2 ${primaryButton} font-medium px-6 py-3 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950`}>
            {t('featureLanding.getStartedFree')} <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>

        {/* Related Features */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8">{t('featureLanding.exploreMore')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedFeatures.map((f, i) => (
              <Link key={i} href={f.href}
                className="group border border-gray-800 rounded-xl p-5 hover:border-gray-600 hover:bg-gray-900/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950">
                <h3 className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  {f.name}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
