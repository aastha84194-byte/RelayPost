import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getNewsBySlug, getNewsByCategory } from '@/lib/articles';
import { Metadata } from 'next';
import Image from 'next/image';
import { Clock, Globe, ArrowLeft, Share2, Bookmark, Layers } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsActionButtons from '../../components/NewsActionButtons';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    return {
      title: 'News Not Found | RelayPost',
    };
  }

  return {
    title: `${article.meta_title || article.title} | RelayPost News`,
    description: article.meta_description || article.ai_summary || article.description,
    keywords: (article.keywords || []).filter(Boolean),
    alternates: {
      canonical: `https://relaypost.com/news/${article.slug}`
    },
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.ai_summary || article.description,
      images: article.image_url ? [{ url: article.image_url }] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedNewsRes = await getNewsByCategory(article.category || 'general', 5);
  const relatedNews = relatedNewsRes.items.filter(n => n.id !== article.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.meta_title || article.title,
    "description": article.meta_description || article.ai_summary || article.description,
    "image": article.image_url ? [article.image_url] : [],
    "datePublished": article.published_at,
    "author": [{
      "@type": "Organization",
      "name": article.source_name || "RelayPost",
      "url": "https://relay-post.vercel.app"
    }]
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Navigation / Actions */}
        <div className="flex items-center justify-between mb-12">
          <Link 
            href="/news"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Intel
          </Link>

          <NewsActionButtons />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Article Header */}
            <header className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest">
                  {article.category || 'Intelligence'}
                </span>
                <div className="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Globe size={12} /> {article.source_name || 'Global Stream'}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-8">
                {article.title}
              </h1>

              <div className="flex items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                       <Globe size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Source Entity</p>
                       <p className="text-xs font-bold text-slate-500">{article.author || article.source_name || 'RelayPost Intelligence'}</p>
                    </div>
                 </div>
                 <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Clock size={16} className="text-indigo-600" />
                    {new Date(article.published_at || '').toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                 </div>
              </div>
            </header>

            {/* Hero Image */}
            {article.image_url && (
              <div className="relative h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden mb-12 shadow-2xl">
                <Image 
                  src={article.image_url} 
                  alt={article.title} 
                  fill 
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* AI Summary Callout */}
            <div className="p-8 md:p-12 bg-indigo-600 rounded-[3rem] text-white mb-12 shadow-xl shadow-indigo-100 dark:shadow-none">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                    <Globe size={20} className="text-white" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Intelligence Synthesis</p>
                    <p className="text-sm font-bold text-white">AI-Generated Core Insights</p>
                 </div>
              </div>
              <p className="text-xl md:text-2xl font-bold leading-relaxed">
                {article.ai_summary || article.description}
              </p>
            </div>

            {/* Full Analysis Snippet if exists */}
            {article.full_analysis ? (
               <div className="mb-12 [&>p:first-of-type]:first-letter:text-6xl md:[&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:text-indigo-600 dark:[&>p:first-of-type]:first-letter:text-indigo-400 [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:float-left">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mt-12 mb-6 tracking-tight" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-10 mb-4 tracking-tight" {...props} />,
                      p: ({node, ...props}) => <p className="text-[17px] md:text-xl text-slate-700 dark:text-slate-300 leading-[1.8] mb-6 md:mb-8" {...props} />,
                      ul: ({node, ...props}) => <ul className="space-y-4 mb-8 pl-6 list-disc text-[17px] md:text-xl text-slate-700 dark:text-slate-300" {...props} />,
                      li: ({node, ...props}) => <li className="pl-2" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-6 my-8 italic text-xl text-slate-800 dark:text-slate-200" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />
                    }}
                  >
                    {article.full_analysis}
                  </ReactMarkdown>
               </div>
            ) : article.content ? (
               <div className="mb-12 [&>p:first-of-type]:first-letter:text-6xl md:[&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:text-indigo-600 dark:[&>p:first-of-type]:first-letter:text-indigo-400 [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:float-left">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mt-12 mb-6 tracking-tight" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-10 mb-4 tracking-tight" {...props} />,
                      p: ({node, ...props}) => <p className="text-[17px] md:text-xl text-slate-700 dark:text-slate-300 leading-[1.8] mb-6 md:mb-8" {...props} />,
                      ul: ({node, ...props}) => <ul className="space-y-4 mb-8 pl-6 list-disc text-[17px] md:text-xl text-slate-700 dark:text-slate-300" {...props} />,
                      li: ({node, ...props}) => <li className="pl-2" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-6 my-8 italic text-xl text-slate-800 dark:text-slate-200" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />
                    }}
                  >
                    {article.content}
                  </ReactMarkdown>
               </div>
            ) : null}

            {/* Related Sources */}
            {article.related_sources && article.related_sources.length > 0 && (
              <div className="mb-12 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <Layers size={14} /> Multiple Citing Sources
                </p>
                <div className="flex flex-wrap gap-3">
                  {article.related_sources.map(source => (
                    <a 
                      key={source.id} 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Globe size={12} />
                      {source.source_name || new URL(source.url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* External Call to Action */}
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Verification Required?</p>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Read the full report from the primary source</h3>
               <a 
                 href={article.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
               >
                 Go to {article.source_name || 'Source'}
                 <Share2 size={16} />
               </a>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 sticky top-8">
               <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                  <span className="w-4 h-0.5 bg-indigo-600" />
                  Related News
               </h3>
               <div className="space-y-6">
                  {relatedNews.length > 0 ? relatedNews.map((item, i) => (
                    <Link 
                      key={i} 
                      href={`/news/${item.slug || item.id}`} 
                      className="flex gap-4 group cursor-pointer"
                    >
                       <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md dark:shadow-none transition-colors duration-300 relative">
                          <Image src={item.image_url || "https://images.unsplash.com/photo-1544411047-c491574abb46?w=400&q=80"} alt="Thumb" fill unoptimized className="object-cover group-hover:scale-110 transition-all duration-500" />
                       </div>
                       <div className="space-y-1 flex-1">
                          <p className="text-[9px] font-black text-indigo-600 tracking-widest uppercase">{item.category || 'INTELLIGENCE'}</p>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{item.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">News Update</p>
                       </div>
                    </Link>
                  )) : (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">No related news found.</p>
                  )}
               </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
