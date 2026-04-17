import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { getServerT } from '@/lib/server-i18n';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

// Generate static paths for all blog posts
export function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { t } = await getServerT();
  const post = getPostBySlug(slug);
  if (!post) return {};
  
  return {
    title: `${post.title} | ${t('blog.seoTitleSuffix')}`,
    description: post.description,
    alternates: {
      canonical: `https://www.tradingcopilot.app/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} | ${t('blog.ogTitle')}`,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [post.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${t('blog.ogTitle')}`,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { t } = await getServerT();
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getAllPosts().filter(p => p.slug !== slug).slice(0, 3);

  return (
    <>
      <BlogPostClient post={post} relatedPosts={relatedPosts} />

      {/* JSON-LD for SEO (server-rendered) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: { '@type': 'Organization', name: post.author },
            publisher: { '@type': 'Organization', name: t('app.name') },
          }),
        }}
      />
    </>
  );
}
