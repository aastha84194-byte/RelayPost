"use client";
import React, { useEffect, useState, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { NewsArticle } from '@/lib/types';
import { getNewsLive, getNewsCategories, getNewsByCategory } from '@/lib/articles';
import { NewsSpotlight, NewsCard } from '../components/NewsCard';
import NewsQuickReadModal from '../components/NewsQuickReadModal';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';

function NewsContent() {
  const [spotlight, setSpotlight] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorydata, setCategoryData] = useState<Record<string, NewsArticle[]>>({});
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const MAIN_CATEGORIES = ['World News', 'Politics', 'Business', 'Technology', 'Science', 'Health', 'Sports', 'Entertainment'];
        const liveNews = await getNewsLive(10);
        
        setSpotlight(liveNews.slice(0, 4));
        setCategories(MAIN_CATEGORIES);

        // Fetch first few articles for each category
        const catMap: Record<string, NewsArticle[]> = {};
        await Promise.all(MAIN_CATEGORIES.map(async (cat) => {
          const res = await getNewsByCategory(cat, 6);
          if (res.items && res.items.length > 0) {
            catMap[cat] = res.items;
          }
        }));
        setCategoryData(catMap);
      } catch (err) {
        console.error("Failed to load news page data", err);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const openModal = (article: NewsArticle) => {
    setSelectedNews(article);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Stream Syncing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}


        {/* Spotlight */}
        <NewsSpotlight articles={spotlight} onQuickRead={openModal} />

        {/* Categories Section */}
        {categories.map((cat) => (
          categorydata[cat] && categorydata[cat].length > 0 && (
            <section key={cat} className="mb-20">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <Layers size={18} className="text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{cat}</h2>
                </div>
                <Link href={`/news/category/${encodeURIComponent(cat.toLowerCase().replace(/\s+/g, '-'))}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                  View Full Feed
                  <ArrowRight size={14} />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categorydata[cat].map((item) => (
                  <NewsCard key={item.id} article={item} onClick={openModal} />
                ))}
              </div>
            </section>
          )
        ))}
      </main>

      <Footer />
      
      <NewsQuickReadModal 
        article={selectedNews}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsContent />
    </Suspense>
  );
}
