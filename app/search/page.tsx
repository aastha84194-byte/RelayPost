"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowRight, Clock, User, Hash, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { API_BASE } from "@/lib/config";
import { getCategorySlugForArticle } from "@/lib/categoryMapping";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/public/articles/search?q=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        setResults(data);
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
        {/* Search Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest">
              <Search size={14} /> Universal Intel Search
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Results for <span className="text-indigo-500">"{query}"</span>
            </h1>
            <p className="text-slate-400 max-w-xl font-medium">
              Intelligence matches found across our strategic reports and editorial deep-dives.
            </p>
          </div>
          <div className="bg-slate-800/40 border border-white/5 px-6 py-4 rounded-[2rem] shadow-xl">
             <span className="text-2xl font-black text-indigo-400">{results.length}</span>
             <span className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Reports Found</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-slate-800/20 rounded-[2.5rem] animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <Link href={`/${getCategorySlugForArticle(article.category_name)}/${article.slug}`} className="block bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all duration-500 shadow-xl hover:shadow-indigo-500/10">
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
                       <span className="flex items-center gap-1.5"><Hash size={12} /> {article.template_type}</span>
                    </div>
                    <h3 className="text-xl font-black leading-tight text-white group-hover:text-indigo-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-2 font-medium leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="pt-4 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-600/20 rounded-full flex items-center justify-center">
                             <User size={12} className="text-indigo-400" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Editorial Team</span>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ArrowRight size={14} />
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
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
      </main>
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
