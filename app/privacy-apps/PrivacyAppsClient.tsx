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
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#e5e7eb', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>{t('privacy.title')}</h1>
      <p style={{ color: '#94a3b8', marginBottom: 32 }}>{t('privacy.subtitle')}</p>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>{t('privacy.lastUpdated')}</p>

      {sections.map((section, i) => (
        <div key={i}>
          <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 12 }}>{section.title}</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 16 }}>{section.text}</p>
        </div>
      ))}
    </div>
  );
}
