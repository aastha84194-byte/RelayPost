"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CategoryArticleSectionProps {
  title: string;
  slug: string;
  articles: Article[];
}

export default function CategoryArticleSection({ title, slug, articles }: CategoryArticleSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 324;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (articles.length === 0) return null;

  // Duplication logic to ensure the content exceeds screen width for marquee
  let marqueeArticles = [...articles];
  // We need enough items to fill a large screen (e.g., at least 12 items)
  while (marqueeArticles.length > 0 && marqueeArticles.length < 12) {
    marqueeArticles = [...marqueeArticles, ...articles];
  }
  // Duplicate the entire sequence once more to create a seamless loop for the 0% -> -50% animation
  const displayArticles = [...marqueeArticles, ...marqueeArticles];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-6 pause-on-hover"
    >
      <div className="flex items-end justify-between mb-3 md:mb-6 px-1">
        <div>
           {/* <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-indigo-600 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Intelligence Cluster</span>
           </div> */}
           <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{title}</h2>
        </div>
        
        <div className="flex items-center gap-4">
           <Link 
            href={`/categories/${slug}`}
            className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
           >
            Explore More <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
           </Link>
           <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:shadow-none"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:shadow-none"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="relative group/scroll overflow-hidden w-full pb-2 scroll-smooth">
        <div 
          className="flex gap-6 animate-marquee-slow"
        >
          {displayArticles.map((item, i) => (
            <Link 
              key={`${item.id}-${i}`} 
              href={`/${item.category_name?.toLowerCase().replace(/ /g, '-') || 'general'}/${item.slug}`}
              className="w-[260px] md:w-[300px] shrink-0 bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="h-52 relative overflow-hidden">
                <Image 
                  src={item.hero_image || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60"} 
                  alt={item.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-white rounded-full">
                      {new Date(item.published_at || "").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-black text-slate-800 dark:text-white text-lg mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.excerpt || item.subtitle}
                </p>
                <div className="mt-6 flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Read Intelligence</span>
                   <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowUpRight size={14} />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
