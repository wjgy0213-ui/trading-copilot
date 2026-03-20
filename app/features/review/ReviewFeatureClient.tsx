'use client';

import { Brain } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import FeatureLanding from '@/components/FeatureLanding';

export default function ReviewFeatureClient() {
  const { t } = useI18n();

  return (
    <FeatureLanding
      icon={<Brain className="w-8 h-8 text-rose-400" />}
      title={t('fl.review.title')}
      subtitle={t('fl.review.subtitle')}
      description={t('fl.review.description')}
      color="rose"
      ctaHref="/review"
      benefits={[
        t('fl.review.b1'),
        t('fl.review.b2'),
        t('fl.review.b3'),
        t('fl.review.b4'),
        t('fl.review.b5'),
        t('fl.review.b6'),
        t('fl.review.b7'),
        t('fl.review.b8'),
      ]}
      howItWorks={[
        { step: '1', title: t('fl.review.s1.title'), desc: t('fl.review.s1.desc') },
        { step: '2', title: t('fl.review.s2.title'), desc: t('fl.review.s2.desc') },
        { step: '3', title: t('fl.review.s3.title'), desc: t('fl.review.s3.desc') },
      ]}
      relatedFeatures={[
        { name: t('fl.review.r1.name'), href: '/features/practice', desc: t('fl.review.r1.desc') },
        { name: t('fl.review.r2.name'), href: '/features/guardian', desc: t('fl.review.r2.desc') },
        { name: t('fl.review.r3.name'), href: '/features/health', desc: t('fl.review.r3.desc') },
      ]}
    />
  );
}
