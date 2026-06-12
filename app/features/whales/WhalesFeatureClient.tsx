'use client';

import { Fish } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import FeatureLanding from '@/components/FeatureLanding';

export default function WhalesFeatureClient() {
  const { t } = useI18n();

  return (
    <FeatureLanding
      icon={<Fish className="w-8 h-8 text-violet-400" />}
      title={t('fl.whales.title')}
      subtitle={t('fl.whales.subtitle')}
      description={t('fl.whales.description')}
      color="violet"
      ctaHref="/whales"
      ctaText={t('fl.whales.ctaText')}
      benefits={[
        t('fl.whales.b1'),
        t('fl.whales.b2'),
        t('fl.whales.b3'),
        t('fl.whales.b4'),
        t('fl.whales.b5'),
        t('fl.whales.b6'),
        t('fl.whales.b7'),
        t('fl.whales.b8'),
      ]}
      howItWorks={[
        { step: '1', title: t('fl.whales.s1.title'), desc: t('fl.whales.s1.desc') },
        { step: '2', title: t('fl.whales.s2.title'), desc: t('fl.whales.s2.desc') },
        { step: '3', title: t('fl.whales.s3.title'), desc: t('fl.whales.s3.desc') },
      ]}
      relatedFeatures={[
        { name: t('fl.whales.r1.name'), href: '/features/health', desc: t('fl.whales.r1.desc') },
        { name: t('fl.whales.r2.name'), href: '/features/signals', desc: t('fl.whales.r2.desc') },
        { name: t('fl.whales.r3.name'), href: '/features/sniper', desc: t('fl.whales.r3.desc') },
      ]}
    />
  );
}
