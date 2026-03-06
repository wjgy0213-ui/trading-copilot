import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

// Generate static paths for all blog posts
export function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  
  return {
    title: `${post.title} | Trading Copilot Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [post.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

// Simple markdown to HTML (no external deps needed for basic rendering)
function renderMarkdown(content: string): string {
  let html = content;
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-gray-800">$1</h2>');
  html = html.replace(/^# (.+)$/gm, ''); // Remove h1 (we render title separately)
  
  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-gray-900 border border-gray-800 rounded-lg p-4 my-4 overflow-x-auto text-sm"><code class="text-emerald-300">$2</code></pre>');
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
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-2 my-4 text-gray-300 italic">$1</blockquote>');
  
  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300 mb-1">• $1</li>');
  
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-gray-300 mb-1 list-decimal">$1</li>');
  
  // Links - internal
  html = html.replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, '<a href="/$2" class="text-emerald-400 hover:text-emerald-300 underline">$1</a>');
  // Links - external
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 underline">$1</a>');
  
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const htmlContent = renderMarkdown(post.content);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8">
          <Link href="/blog" className="hover:text-gray-300 transition">← Back to Blog</Link>
        </div>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            <span>·</span>
            <span>{Math.ceil(post.content.split(/\s+/).length / 200)} min read</span>
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
          <h3 className="text-xl font-bold mb-2">Try Trading Copilot</h3>
          <p className="text-gray-400 mb-4">AI-powered market analysis with 15+ real indicators. Free trial, no credit card required.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/pricing" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl transition">
              Start Free Trial →
            </Link>
            <Link href="/dashboard" className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition">
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold mb-4">More Articles</h3>
          <div className="grid gap-4">
            {getAllPosts().filter(p => p.slug !== slug).slice(0, 3).map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`}
                className="border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-all">
                <div className="text-xs text-gray-500 mb-1">{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="font-medium text-gray-200 hover:text-emerald-400 transition">{p.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </article>

      {/* JSON-LD for SEO */}
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
            publisher: { '@type': 'Organization', name: 'Trading Copilot' },
          }),
        }}
      />
    </div>
  );
}
