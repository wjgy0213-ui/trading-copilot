import { getServerT } from '@/lib/server-i18n';

export default async function JsonLd() {
  const { t } = await getServerT();

  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t('app.name'),
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: 'https://www.tradingcopilot.app',
    description: t('seo.jsonLd.description'),
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: t('seo.jsonLd.offer.free.name'),
        description: t('seo.jsonLd.offer.free.description'),
      },
      {
        '@type': 'Offer',
        price: '39.99',
        priceCurrency: 'USD',
        name: t('seo.jsonLd.offer.pro.name'),
        description: t('seo.jsonLd.offer.pro.description'),
      },
      {
        '@type': 'Offer',
        price: '79.99',
        priceCurrency: 'USD',
        name: t('seo.jsonLd.offer.elite.name'),
        description: t('seo.jsonLd.offer.elite.description'),
      },
    ],
    featureList: [
      t('seo.jsonLd.feature.1'),
      t('seo.jsonLd.feature.2'),
      t('seo.jsonLd.feature.3'),
      t('seo.jsonLd.feature.4'),
      t('seo.jsonLd.feature.5'),
      t('seo.jsonLd.feature.6'),
      t('seo.jsonLd.feature.7'),
      t('seo.jsonLd.feature.8'),
    ],
    author: {
      '@type': 'Person',
      name: 'SlowManJW',
      url: 'https://x.com/SlowManJW',
    },
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: t('seo.faq.1.q'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('seo.faq.1.a'),
        },
      },
      {
        '@type': 'Question',
        name: t('seo.faq.2.q'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('seo.faq.2.a'),
        },
      },
      {
        '@type': 'Question',
        name: t('seo.faq.3.q'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('seo.faq.3.a'),
        },
      },
      {
        '@type': 'Question',
        name: t('seo.faq.4.q'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('seo.faq.4.a'),
        },
      },
      {
        '@type': 'Question',
        name: t('seo.faq.5.q'),
        acceptedAnswer: {
          '@type': 'Answer',
          text: t('seo.faq.5.a'),
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
