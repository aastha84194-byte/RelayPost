"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Clock, Globe } from 'lucide-react';
import Link from 'next/link';
import { NewsArticle } from '@/lib/types';
import { getNewsLive } from '@/lib/articles';
import NewsQuickReadModal from './NewsQuickReadModal';

export default function LiveInsightsSidebar({
  news: initialNews,
  isLoading: initialLoading
}: {
  news?: NewsArticle[];
  isLoading?: boolean;
} = {}) {
  const [news, setNews] = useState<NewsArticle[]>(initialNews || []);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(initialLoading !== undefined ? initialLoading : true);

  useEffect(() => {
    if (initialNews !== undefined) {
      setNews(initialNews);
    }
  }, [initialNews]);

  useEffect(() => {
    if (initialLoading !== undefined) {
      setIsLoading(initialLoading);
    }
  }, [initialLoading]);

  useEffect(() => {
    if (initialNews === undefined && initialLoading === undefined) {
      const fetchNews = async () => {
        setIsLoading(true);
        const data = await getNewsLive(5);
        setNews(data);
        setIsLoading(false);
      };
      fetchNews();
    }
  }, [initialNews, initialLoading]);

  const openModal = (article: NewsArticle) => {
    setSelectedNews(article);
    setIsModalOpen(true);
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-8">


      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gathering Intel...</p>
            </div>
          ) : news.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Recent Updates</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {news.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => openModal(item)}
                  className={`flex flex-col gap-2 p-5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${
                    index !== news.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      {item.category || 'General'}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-600">
                      <Clock size={10} />
                      {getTimeAgo(item.published_at)}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe size={10} className="text-slate-300" />
                    <span className="text-[9px] font-bold text-slate-400 truncate">{item.source_name || 'Global News'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Link 
          href="/news"
          className="flex items-center justify-center gap-2 py-4 bg-slate-50/50 dark:bg-slate-800/20 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-t border-slate-100 dark:border-slate-800"
        >
          Explore All News
          <ArrowRight size={12} />
        </Link>
      </div>

      <NewsQuickReadModal 
        article={selectedNews}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
