"use client";

import React, { useState } from 'react';
import { NewsCard } from '../../../components/NewsCard';
import { Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NewsArticle } from '@/lib/types';
import { getNewsByCategory } from '@/lib/articles';
import { HARDCODED_CATEGORIES } from '@/lib/categoryMapping';

import { useRouter } from 'next/navigation';

interface Props {
  initialArticles: NewsArticle[];
  decodedCategory: string;
  slug: string;
}

export default function NewsCategoryClient({ initialArticles, decodedCategory, slug }: Props) {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [skip, setSkip] = useState(20);
  const [hasMore, setHasMore] = useState(initialArticles.length === 20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);


  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await getNewsByCategory(decodedCategory, 20, skip);
      const newArticles = res.items || [];
      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles(prev => {
          const merged = [...prev, ...newArticles];
          return Array.from(new Map(merged.map(item => [item.id, item])).values());
        });
        setSkip(prev => prev + 20);
        if (newArticles.length < 20) setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more news:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const categoryMapping = HARDCODED_CATEGORIES.find(
    c => c.name.toLowerCase() === decodedCategory.toLowerCase() || 
         c.slug === decodedCategory.toLowerCase() || 
         c.backendSlugs.includes(decodedCategory.toLowerCase())
  );
  const IconComponent = categoryMapping ? categoryMapping.icon : Layers;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            Back to News
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <IconComponent size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {decodedCategory.toLowerCase().endsWith('news') ? decodedCategory : `${decodedCategory} News`}
            </h1>
          </div>
        </div>
      </div>

      {/* Article grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No news article found for this category.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(item => <NewsCard key={item.id} article={item} />)}
          </div>
          {hasMore && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-md hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />Loading...</>
                ) : 'Load More News'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
