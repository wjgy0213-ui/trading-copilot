'use client';

import { ShieldAlert } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import FeatureLanding from '@/components/FeatureLanding';

export default function GuardianFeatureClient() {
  const { t } = useI18n();

  return (
    <FeatureLanding
      icon={<ShieldAlert className="w-8 h-8 text-orange-400" />}
      title={t('fl.guardian.title')}
      subtitle={t('fl.guardian.subtitle')}
      description={t('fl.guardian.description')}
      color="orange"
      ctaHref="/guardian"
      ctaText={t('fl.guardian.ctaText')}
      benefits={[
        t('fl.guardian.b1'),
        t('fl.guardian.b2'),
        t('fl.guardian.b3'),
        t('fl.guardian.b4'),
        t('fl.guardian.b5'),
        t('fl.guardian.b6'),
        t('fl.guardian.b7'),
        t('fl.guardian.b8'),
      ]}
      howItWorks={[
        { step: '1', title: t('fl.guardian.s1.title'), desc: t('fl.guardian.s1.desc') },
        { step: '2', title: t('fl.guardian.s2.title'), desc: t('fl.guardian.s2.desc') },
        { step: '3', title: t('fl.guardian.s3.title'), desc: t('fl.guardian.s3.desc') },
      ]}
      relatedFeatures={[
        { name: t('fl.guardian.r1.name'), href: '/features/review', desc: t('fl.guardian.r1.desc') },
        { name: t('fl.guardian.r2.name'), href: '/features/practice', desc: t('fl.guardian.r2.desc') },
        { name: t('fl.guardian.r3.name'), href: '/features/signals', desc: t('fl.guardian.r3.desc') },
      ]}
    />
  );
}
