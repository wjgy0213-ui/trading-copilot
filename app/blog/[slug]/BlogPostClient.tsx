'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { estimateReadingMinutes } from '@/lib/readingTime';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  content: string;
  image?: string;
}

// Simple markdown to HTML (no external deps needed for basic rendering)
function renderMarkdown(content: string): string {
  let html = content;
  
  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold text-gray-200 mt-6 mb-2">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-gray-800">$1</h2>');
  html = html.replace(/^# (.+)$/gm, ''); // Remove h1 (we render title separately)
  
  // Images (before links to avoid conflict)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-6"><img src="$2" alt="$1" class="rounded-xl border border-gray-800 w-full" loading="lazy" /><figcaption class="text-center text-xs text-gray-500 mt-2">$1</figcaption></figure>');
  // Remove empty figcaptions
  html = html.replace(/<figcaption[^>]*><\/figcaption>/g, '');
  
  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Code blocks with language label
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langLabel = lang ? `<div class="text-[10px] text-gray-500 font-mono mb-2 uppercase">${lang}</div>` : '';
    return `<pre class="bg-gray-900 border border-gray-800 rounded-lg p-4 my-4 overflow-x-auto text-sm">${langLabel}<code class="text-emerald-300">${code}</code></pre>`;
  });
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-300 text-sm">$1</code>');
  
  // Tables
  html = html.replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g, (_, header, body) => {
    const ths = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th class="px-4 py-2 text-left text-xs font-medium text-gray-400 border-b border-gray-700">${c.trim()}</th>`).join('');
    const rows = body.trim().split('\n').map((row: string) => {
      const tds = row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td class="px-4 py-2 text-sm border-b border-gray-800">${c.trim()}</td>`).join('');
      return `<tr class="hover:bg-gray-900/50">${tds}</tr>`;
    }).join('');
    return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse"><thead><tr class="bg-gray-900">${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });
  
  // Multi-line blockquotes (consecutive > lines become one blockquote)
  html = html.replace(/(^> .+\n?)+/gm, (match) => {
    const lines = match.trim().split('\n').map((l: string) => l.replace(/^>\s?/, '')).join('<br/>');
    return `<blockquote class="border-l-4 border-emerald-500/60 pl-4 py-3 my-5 bg-emerald-500/5 rounded-r-lg text-gray-300 italic">${lines}</blockquote>`;
  });
  
  // Unordered lists - wrap consecutive items in <ul>
  html = html.replace(/(^- .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map((l: string) => {
      const text = l.replace(/^- /, '');
      return `<li class="text-gray-300 mb-1.5 pl-1">${text}</li>`;
    }).join('');
    return `<ul class="list-disc list-outside ml-5 my-4 space-y-0.5">${items}</ul>`;
  });
  
  // Numbered lists - wrap consecutive items in <ol>
  html = html.replace(/(^\d+\. .+\n?)+/gm, (match) => {
    const items = match.trim().split('\n').map((l: string) => {
      const text = l.replace(/^\d+\.\s/, '');
      return `<li class="text-gray-300 mb-1.5 pl-1">${text}</li>`;
    }).join('');
    return `<ol class="list-decimal list-outside ml-5 my-4 space-y-0.5">${items}</ol>`;
  });
  
  // Links - internal
  html = html.replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, '<a href="/$2" class="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">$1</a>');
  // Links - external
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors">$1</a>');
  
  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-gray-800 my-8" />');
  
  // Paragraphs (wrap remaining lines)
  html = html.split('\n\n').map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return trimmed;
    return `<p class="text-gray-300 leading-relaxed mb-4">${trimmed}</p>`;
  }).join('\n');
  
  return html;
}

export default function BlogPostClient({ post, relatedPosts }: { post: BlogPost; relatedPosts: BlogPost[] }) {
  const { t, locale } = useI18n();
  const htmlContent = renderMarkdown(post.content);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-gray-300 transition">← {t('blog.backToBlog')}</Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <time>{new Date(post.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            <span>·</span>
            <span>{estimateReadingMinutes(post.content, locale)} {t('blog.minRead')}</span>
            <span>·</span>
            <span>{post.author}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          
          <p className="text-lg text-gray-400">
            {post.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap mt-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Content */}
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* CTA */}
        <div className="mt-16 border border-emerald-500/20 rounded-xl p-8 bg-emerald-500/5 text-center">
          <h3 className="text-xl font-bold mb-2">{t('blog.postCtaTitle')}</h3>
          <p className="text-gray-400 mb-4">{t('blog.postCtaDesc')}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl transition">
              {t('blog.ctaGetStarted')}
            </Link>
            <Link href="/dashboard" className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition">
              {t('blog.viewDashboard')}
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">{t('blog.moreArticles')}</h3>
          <div className="grid gap-4">
            {relatedPosts.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`}
                className="border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-all">
                <div className="text-xs text-gray-500 mb-1">{new Date(p.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="font-medium text-gray-200 hover:text-emerald-400 transition">{p.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
