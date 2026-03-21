'use client';

import { Gamepad2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import FeatureLanding from '@/components/FeatureLanding';

export default function PracticeFeatureClient() {
  const { t } = useI18n();

  return (
    <FeatureLanding
      icon={<Gamepad2 className="w-8 h-8 text-emerald-400" />}
      title={t('fl.practice.title')}
      subtitle={t('fl.practice.subtitle')}
      description={t('fl.practice.description')}
      color="emerald"
      ctaHref="/practice"
      ctaText={t('fl.practice.ctaText')}
      benefits={[
        t('fl.practice.b1'),
        t('fl.practice.b2'),
        t('fl.practice.b3'),
        t('fl.practice.b4'),
        t('fl.practice.b5'),
        t('fl.practice.b6'),
        t('fl.practice.b7'),
        t('fl.practice.b8'),
      ]}
      howItWorks={[
        { step: '1', title: t('fl.practice.s1.title'), desc: t('fl.practice.s1.desc') },
        { step: '2', title: t('fl.practice.s2.title'), desc: t('fl.practice.s2.desc') },
        { step: '3', title: t('fl.practice.s3.title'), desc: t('fl.practice.s3.desc') },
      ]}
      relatedFeatures={[
        { name: t('fl.practice.r1.name'), href: '/features/review', desc: t('fl.practice.r1.desc') },
        { name: t('fl.practice.r2.name'), href: '/features/health', desc: t('fl.practice.r2.desc') },
        { name: t('fl.practice.r3.name'), href: '/features/guardian', desc: t('fl.practice.r3.desc') },
      ]}
    />
  );
}
