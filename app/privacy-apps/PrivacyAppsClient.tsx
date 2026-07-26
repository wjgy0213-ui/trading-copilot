'use client';

import { useI18n } from '@/lib/i18n';

export default function PrivacyAppsClient() {
  const { t } = useI18n();
  const navItemAria = (title: string) => t('privacy.navItemAria').replace('{title}', title);

  const sections = [
    { id: 'overview', title: t('privacy.overviewTitle'), text: t('privacy.overviewText') },
    { id: 'data', title: t('privacy.dataTitle'), text: t('privacy.dataText') },
    { id: 'local', title: t('privacy.localTitle'), text: t('privacy.localText') },
    { id: 'third', title: t('privacy.thirdTitle'), text: t('privacy.thirdText') },
    { id: 'perm', title: t('privacy.permTitle'), text: t('privacy.permText') },
    { id: 'child', title: t('privacy.childTitle'), text: t('privacy.childText') },
    { id: 'changes', title: t('privacy.changesTitle'), text: t('privacy.changesText') },
    { id: 'contact', title: t('privacy.contactTitle'), text: t('privacy.contactText') },
  ];

  const highlights = [
    { title: t('privacy.highlight1Title'), text: t('privacy.highlight1Text') },
    { title: t('privacy.highlight2Title'), text: t('privacy.highlight2Text') },
    { title: t('privacy.highlight3Title'), text: t('privacy.highlight3Text') },
  ];

  return (
    <div id="top" className="min-h-screen bg-gray-950 text-gray-200">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
          <div className="border-b border-gray-800 px-6 py-8 sm:px-8">
            <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              {t('privacy.summaryBadge')}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{t('privacy.title')}</h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">{t('privacy.subtitle')}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gray-500">{t('privacy.lastUpdated')}</p>
          </div>

          <div className="grid gap-4 border-b border-gray-800 px-6 py-6 sm:grid-cols-3 sm:px-8">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">{t('privacy.quickNav')}</div>
                <div className="mt-3 space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      aria-label={navItemAria(section.title)}
                      className="block rounded-xl px-3 py-2 text-sm text-gray-300 transition hover:bg-gray-800 hover:text-white"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-4">
              {sections.map((section, i) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-gray-800 bg-gray-900/50 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-white sm:text-2xl">{section.title}</h2>
                    <span className="rounded-full border border-gray-700 px-2.5 py-1 text-xs text-gray-500">0{i + 1}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-gray-300 sm:text-base">{section.text}</p>
                  <div className="mt-4">
                    <a href="#top" aria-label={t('privacy.backToTopAria')} className="text-xs font-medium text-emerald-300 hover:text-emerald-200">{t('privacy.backToTop')}</a>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
