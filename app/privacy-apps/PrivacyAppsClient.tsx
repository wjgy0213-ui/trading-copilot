'use client';

import { useI18n } from '@/lib/i18n';

export default function PrivacyAppsClient() {
  const { t } = useI18n();

  const sections = [
    { title: t('privacy.overviewTitle'), text: t('privacy.overviewText') },
    { title: t('privacy.dataTitle'), text: t('privacy.dataText') },
    { title: t('privacy.localTitle'), text: t('privacy.localText') },
    { title: t('privacy.thirdTitle'), text: t('privacy.thirdText') },
    { title: t('privacy.permTitle'), text: t('privacy.permText') },
    { title: t('privacy.childTitle'), text: t('privacy.childText') },
    { title: t('privacy.changesTitle'), text: t('privacy.changesText') },
    { title: t('privacy.contactTitle'), text: t('privacy.contactText') },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 text-gray-200 bg-gray-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">{t('privacy.title')}</h1>
      <p className="text-gray-400 mb-8">{t('privacy.subtitle')}</p>
      <p className="text-gray-400 mb-6">{t('privacy.lastUpdated')}</p>

      {sections.map((section, i) => (
        <div key={i}>
          <h2 className="text-2xl font-semibold mt-8 mb-3">{section.title}</h2>
          <p className="leading-7 mb-4 text-gray-300">{section.text}</p>
        </div>
      ))}
    </div>
  );
}
