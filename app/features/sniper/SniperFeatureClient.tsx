'use client';

import { Crosshair } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import FeatureLanding from '@/components/FeatureLanding';

export default function SniperFeatureClient() {
  const { t } = useI18n();

  return (
    <FeatureLanding
      icon={<Crosshair className="w-8 h-8 text-amber-400" />}
      title={t('fl.sniper.title')}
      subtitle={t('fl.sniper.subtitle')}
      description={t('fl.sniper.description')}
      color="amber"
      ctaHref="/sniper"
      ctaText={t('fl.sniper.ctaText')}
      benefits={[
        t('fl.sniper.b1'),
        t('fl.sniper.b2'),
        t('fl.sniper.b3'),
        t('fl.sniper.b4'),
        t('fl.sniper.b5'),
        t('fl.sniper.b6'),
        t('fl.sniper.b7'),
        t('fl.sniper.b8'),
      ]}
      howItWorks={[
        { step: '1', title: t('fl.sniper.s1.title'), desc: t('fl.sniper.s1.desc') },
        { step: '2', title: t('fl.sniper.s2.title'), desc: t('fl.sniper.s2.desc') },
        { step: '3', title: t('fl.sniper.s3.title'), desc: t('fl.sniper.s3.desc') },
      ]}
      relatedFeatures={[
        { name: t('fl.sniper.r1.name'), href: '/features/whales', desc: t('fl.sniper.r1.desc') },
        { name: t('fl.sniper.r2.name'), href: '/features/health', desc: t('fl.sniper.r2.desc') },
        { name: t('fl.sniper.r3.name'), href: '/features/signals', desc: t('fl.sniper.r3.desc') },
      ]}
    />
  );
}
