"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowRight, Clock, User, Hash, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_BASE, NEWS_API_BASE } from "@/lib/config";
import { getCategorySlugForArticle } from "@/lib/categoryMapping";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'news' | 'articles'>('all');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [articleRes, newsRes] = await Promise.all([
          fetch(`${API_BASE}/public/articles/search?q=${encodeURIComponent(query)}&limit=20`).catch(() => null),
          fetch(`${NEWS_API_BASE}/live?search=${encodeURIComponent(query)}&limit=20`).catch(() => null)
        ]);
        
        let fetched: any[] = [];
        
        if (articleRes && articleRes.ok) {
          const articleData = await articleRes.json();
          fetched = [...fetched, ...articleData.map((a: any) => ({ ...a, isNews: false }))];
        }
        
        if (newsRes && newsRes.ok) {
           const newsData = await newsRes.json();
           fetched = [...fetched, ...newsData.map((n: any) => ({ 
             ...n, 
             isNews: true, 
             hero_image: n.image_url, 
             category_name: n.category || 'Live News' 
           }))];
        }
        
        setResults(fetched);
      } catch (e) {
        console.error("Search fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {(() => {
          const filteredResults = results.filter(article => {
            if (typeFilter === 'news' && !article.isNews) return false;
            if (typeFilter === 'articles' && article.isNews) return false;
            if (timeFilter !== 'all') {
              const pubDate = new Date(article.published_at || article.created_at);
              const now = new Date();
              const diffHours = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
              if (timeFilter === '24h' && diffHours > 24) return false;
              if (timeFilter === '7d' && diffHours > 24 * 7) return false;
            }
            return true;
          });

          return (
            <>
        {/* Search Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 border-b border-white/5 pb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              {query ? <>Results for <span className="text-indigo-500">"{query}"</span></> : "Search Everything"}
            </h1>
          </div>
          {query && (
            <div className="bg-slate-800/40 border border-white/5 px-6 py-4 rounded-[2rem] shadow-xl">
               <span className="text-2xl font-black text-indigo-400">{filteredResults.length}</span>
               <span className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Reports Found</span>
            </div>
          )}
        </div>

        {/* Filters */}
        {query && (
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex bg-slate-800/40 rounded-full p-1 border border-white/5">
              {(['all', '24h', '7d'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${timeFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {f === 'all' ? 'All Time' : f === '24h' ? 'Last 24h' : 'Last 7 Days'}
                </button>
              ))}
            </div>
            
            <div className="flex bg-slate-800/40 rounded-full p-1 border border-white/5">
              {(['all', 'news', 'articles'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${typeFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {f === 'all' ? 'All Types' : f === 'news' ? 'Live News' : 'Articles'}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-slate-800/20 rounded-[2.5rem] animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResults.map((article, idx) => (
              <motion.div
                key={`${article.isNews ? 'news' : 'article'}-${article.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <Link href={article.isNews ? `/news/${article.slug}` : `/${getCategorySlugForArticle(article.category_name)}/${article.slug}`} className="block bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all duration-500 shadow-xl hover:shadow-indigo-500/10">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {article.hero_image ? (
                      <img 
                        src={article.hero_image} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <Search size={48} className="text-slate-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-4 left-4 py-1.5 px-3 bg-indigo-600/90 backdrop-blur-md rounded-full">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        {article.category_name || "Intel"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-black leading-tight text-white group-hover:text-indigo-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 font-medium leading-relaxed">
                      {article.excerpt || article.ai_summary}
                    </p>
                    <div className="pt-4 flex justify-end">
                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ArrowRight size={14} />
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : !query ? (
          <div className="py-24 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-800/50 rounded-[2rem] flex items-center justify-center border border-white/5">
               <Search size={32} className="text-slate-600" />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black">Search Intelligence</h2>
               <p className="text-slate-400 max-w-md font-medium">
                 Enter a keyword to explore our vast database of strategic reports and live news.
               </p>
            </div>
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-slate-800/50 rounded-[2rem] flex items-center justify-center border border-white/5">
               <AlertTriangle size={32} className="text-slate-600" />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black">No intelligence matches</h2>
               <p className="text-slate-400 max-w-md font-medium">
                 We couldn't find any Strategic reports for "{query}". Try refining your search or explore our popular categories.
               </p>
            </div>
            <Link href="/categories" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-full transition-all shadow-xl shadow-indigo-600/20">
               Browse All Categories
            </Link>
          </div>
        )}
        </>
        );
        })()}
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SearchResults />
    </Suspense>
  );
}
