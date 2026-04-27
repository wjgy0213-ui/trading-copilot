import { getServerT } from '@/lib/server-i18n';

export default async function JsonLd() {
  const { t } = await getServerT();

  const data = {
    '@context': 'https://schema.org',
    '@type': t('seo.schema.softwareApplicationType'),
    name: t('app.name'),
    applicationCategory: t('seo.schema.financeApplicationCategory'),
    operatingSystem: t('seo.schema.webOperatingSystem'),
    url: 'https://www.tradingcopilot.app',
    description: t('seo.jsonLd.description'),
    offers: [
      {
        '@type': t('seo.schema.offerType'),
        price: '0',
        priceCurrency: 'USD',
        name: t('seo.jsonLd.offer.free.name'),
        description: t('seo.jsonLd.offer.free.description'),
      },
      {
        '@type': t('seo.schema.offerType'),
        price: '39.99',
        priceCurrency: 'USD',
        name: t('seo.jsonLd.offer.pro.name'),
        description: t('seo.jsonLd.offer.pro.description'),
      },
      {
        '@type': t('seo.schema.offerType'),
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
      '@type': t('seo.schema.personType'),
      name: 'SlowManJW',
      url: 'https://x.com/SlowManJW',
    },
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': t('seo.schema.faqPageType'),
    mainEntity: [
      {
        '@type': t('seo.schema.questionType'),
        name: t('seo.faq.1.q'),
        acceptedAnswer: {
          '@type': t('seo.schema.answerType'),
          text: t('seo.faq.1.a'),
        },
      },
      {
        '@type': t('seo.schema.questionType'),
        name: t('seo.faq.2.q'),
        acceptedAnswer: {
          '@type': t('seo.schema.answerType'),
          text: t('seo.faq.2.a'),
        },
      },
      {
        '@type': t('seo.schema.questionType'),
        name: t('seo.faq.3.q'),
        acceptedAnswer: {
          '@type': t('seo.schema.answerType'),
          text: t('seo.faq.3.a'),
        },
      },
      {
        '@type': t('seo.schema.questionType'),
        name: t('seo.faq.4.q'),
        acceptedAnswer: {
          '@type': t('seo.schema.answerType'),
          text: t('seo.faq.4.a'),
        },
      },
      {
        '@type': t('seo.schema.questionType'),
        name: t('seo.faq.5.q'),
        acceptedAnswer: {
          '@type': t('seo.schema.answerType'),
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
