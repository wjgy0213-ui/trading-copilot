'use client';

import { Radio } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import FeatureLanding from '@/components/FeatureLanding';

export default function SignalsFeatureClient() {
  const { t } = useI18n();

  return (
    <FeatureLanding
      icon={<Radio className="w-8 h-8 text-cyan-400" />}
      title={t('fl.signals.title')}
      subtitle={t('fl.signals.subtitle')}
      description={t('fl.signals.description')}
      color="cyan"
      ctaHref="/signals"
      ctaText={t('fl.signals.ctaText')}
      benefits={[
        t('fl.signals.b1'),
        t('fl.signals.b2'),
        t('fl.signals.b3'),
        t('fl.signals.b4'),
        t('fl.signals.b5'),
        t('fl.signals.b6'),
        t('fl.signals.b7'),
        t('fl.signals.b8'),
      ]}
      howItWorks={[
        { step: '1', title: t('fl.signals.s1.title'), desc: t('fl.signals.s1.desc') },
        { step: '2', title: t('fl.signals.s2.title'), desc: t('fl.signals.s2.desc') },
        { step: '3', title: t('fl.signals.s3.title'), desc: t('fl.signals.s3.desc') },
      ]}
      relatedFeatures={[
        { name: t('fl.signals.r1.name'), href: '/features/health', desc: t('fl.signals.r1.desc') },
        { name: t('fl.signals.r2.name'), href: '/features/sniper', desc: t('fl.signals.r2.desc') },
        { name: t('fl.signals.r3.name'), href: '/features/whales', desc: t('fl.signals.r3.desc') },
      ]}
    />
  );
}
