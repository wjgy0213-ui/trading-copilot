'use client';

import { Activity } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import FeatureLanding from '@/components/FeatureLanding';

export default function HealthFeatureClient() {
  const { t } = useI18n();

  return (
    <FeatureLanding
      icon={<Activity className="w-8 h-8 text-blue-400" />}
      title={t('fl.health.title')}
      subtitle={t('fl.health.subtitle')}
      description={t('fl.health.description')}
      color="blue"
      ctaHref="/health"
      benefits={[
        t('fl.health.b1'),
        t('fl.health.b2'),
        t('fl.health.b3'),
        t('fl.health.b4'),
        t('fl.health.b5'),
        t('fl.health.b6'),
        t('fl.health.b7'),
        t('fl.health.b8'),
      ]}
      howItWorks={[
        { step: '1', title: t('fl.health.s1.title'), desc: t('fl.health.s1.desc') },
        { step: '2', title: t('fl.health.s2.title'), desc: t('fl.health.s2.desc') },
        { step: '3', title: t('fl.health.s3.title'), desc: t('fl.health.s3.desc') },
      ]}
      relatedFeatures={[
        { name: t('fl.health.r1.name'), href: '/features/signals', desc: t('fl.health.r1.desc') },
        { name: t('fl.health.r2.name'), href: '/features/sniper', desc: t('fl.health.r2.desc') },
        { name: t('fl.health.r3.name'), href: '/features/whales', desc: t('fl.health.r3.desc') },
      ]}
    />
  );
}
