"use client";
import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';

export default function TechSpotlight({ articles }: { articles?: Article[] }) {
  if (!articles || articles.length === 0) return null;
  
  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-dark-bg mb-4 border-l-4 border-[#4f46e5] pl-3 dark:text-white transition-colors duration-300">Tech Spotlight</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">

        {/* Large Featured Spotlight */}
        <div className="md:col-span-3 relative rounded-none md:rounded-xl overflow-hidden min-h-[300px] group shadow-md -mx-4 md:mx-0 dark:shadow-none transition-colors duration-300">
          <Link href={`/${mainArticle.category_name?.toLowerCase() || 'tech'}/${mainArticle.slug}`} className="absolute inset-0 block z-10" />
          <div className="absolute inset-0">
            {mainArticle.hero_image ? (
              <Image src={mainArticle.hero_image} alt={mainArticle.title || "Spotlight"} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority className="object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-6 w-full z-20 pointer-events-none">
            <span className="inline-block px-3 py-1 bg-[#4f46e5] text-[10px] font-bold text-white rounded-full mb-3 tracking-wider">{mainArticle.category_name?.toUpperCase() || 'TECH'}</span>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight max-w-[90%]">{mainArticle.title}</h3>
            {mainArticle.ai_summary && (
              <p className="text-gray-300 text-xs md:text-sm mb-4 line-clamp-2 max-w-[90%]">{mainArticle.ai_summary}</p>
            )}
            <Link href={`/${mainArticle.category_name?.toLowerCase() || 'tech'}/${mainArticle.slug}`} className="pointer-events-auto bg-[#4f46e5] hover:bg-[#3730a3] text-white px-5 py-2 rounded-full text-xs md:text-sm font-medium inline-flex items-center gap-1.5 transition-colors shadow-lg">
              Read More
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        
        {/* Side Articles */}
        {sideArticles.length > 0 && (
          <div className="md:col-span-2 flex flex-col gap-4">
            {sideArticles.map(article => (
              <Link href={`/${article.category_name?.toLowerCase() || 'tech'}/${article.slug}`} key={article.id} className="flex gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700 h-full">
                {article.hero_image ? (
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden shrink-0">
                    <Image src={article.hero_image} alt={article.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700" />
                )}
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2 mb-2">{article.title}</h3>
                  <span className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-wider">{article.category_name || 'TECH'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
