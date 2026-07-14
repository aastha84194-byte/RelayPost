"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Globe, ArrowRight } from 'lucide-react';
import { NewsArticle } from '@/lib/types';

export function NewsCard({ article, onClick }: { article: NewsArticle, onClick?: (article: NewsArticle) => void }) {
  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 w-full overflow-hidden">
        {article.image_url ? (
          <Image 
            src={article.image_url} 
            alt={article.title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500" 
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
             <Globe size={40} className="text-indigo-300 dark:text-indigo-700" />
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <span className="flex items-center gap-1 shrink-0"><Clock size={12} /> {getTimeAgo(article.published_at)}</span>
           <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
           <span className="truncate">{article.source_name || 'Global News'}</span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3">
          {article.title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 flex-grow">
          {article.ai_summary || article.description}
        </p>
        
        <button 
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick(article);
            }
          }}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 group-hover:gap-3 transition-all"
        >
          Quick Insight
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={() => onClick(article)} className="cursor-pointer h-full">{content}</div>;
  }

  return (
    <Link href={`/news/${article.slug}`} className="h-full">
      {content}
    </Link>
  );
}

export function NewsSpotlight({ articles, onQuickRead }: { articles: NewsArticle[], onQuickRead: (article: NewsArticle) => void }) {
  if (articles.length === 0) return null;
  const main = articles[0];
  const side = articles.slice(1, 4);

  return (
    <section className="mb-16">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-12 h-1 bg-indigo-600 rounded-full" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Intelligence Spotlight</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feature */}
        <div className="lg:col-span-8">
          <div className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-indigo-100 dark:bg-indigo-900/20 h-[500px]" onClick={() => onQuickRead(main)}>
            {main.image_url ? (
              <Image 
                src={main.image_url} 
                alt={main.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                 <Globe size={80} className="text-indigo-300 dark:text-indigo-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <span className="inline-block px-3 py-1 mb-6 rounded-full bg-indigo-600 text-[10px] font-black text-white uppercase tracking-[0.2em]">
                Live: {main.category || 'General'}
              </span>
              <h3 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
                {main.title}
              </h3>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-300 max-w-[150px] md:max-w-[250px]">
                  <Globe size={14} className="text-indigo-400 shrink-0" />
                  <span className="truncate">{main.source_name || 'Global News'}</span>
                </span>
                <span className="flex items-center gap-2 text-xs font-bold text-slate-300">
                   <Clock size={14} className="text-indigo-400" />
                   {new Date(main.published_at || '').toLocaleDateString()}
                </span>
                <button 
                  className="ml-auto w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 transition-transform group-hover:bg-indigo-500 group-hover:text-white"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Mini-Features */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {side.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onQuickRead(item)}
              className="flex gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden">
                {item.image_url ? (
                   <Image src={item.image_url} alt={item.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Globe size={16} className="text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 mb-1">{item.category}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-indigo-600">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
