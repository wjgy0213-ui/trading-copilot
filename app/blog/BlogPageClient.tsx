'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { estimateReadingMinutes } from '@/lib/readingTime';
import { formatLocaleDate } from '@/lib/i18n-helpers';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
      {tag}
    </span>
  );
}

export default function BlogPageClient({ posts }: { posts: BlogPost[] }) {
  const { t, locale } = useI18n();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">{t('blog.pageTitle')}</h1>
          <p className="text-gray-400 text-lg">
            {t('blog.pageSubtitle')}
          </p>
        </div>

        {/* Posts Grid */}
        <div className="space-y-8">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="block group border border-gray-800 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-900/50 transition-all">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <time>{formatLocaleDate(post.date, locale, { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                <span>·</span>
                <span>{estimateReadingMinutes(post.content, locale)} {t('blog.minRead')}</span>
              </div>
              
              <h2 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2">
                {post.title}
              </h2>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {post.description}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                {post.tags.slice(0, 4).map(tag => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <p className="text-6xl mb-4">📝</p>
            <p>{t('blog.comingSoon')}</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 border border-emerald-500/20 rounded-xl p-8 bg-emerald-500/5 text-center">
          <h3 className="text-xl font-bold mb-2">{t('blog.ctaTitle')}</h3>
          <p className="text-gray-400 mb-4">{t('blog.ctaDesc')}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl transition">
              {t('blog.ctaGetStarted')}
            </Link>
            <Link href="/features/health" className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition">
              {t('blog.ctaExplore')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
