"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, History, TrendingUp, ArrowRight, FileText, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE, NEWS_API_BASE } from "@/lib/config";
import { getCategorySlugForArticle } from "@/lib/categoryMapping";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_TRENDING = [
  "India's Economic Tightrope",
  "India's AI & Election Era",
  "Streaming War Shifts",
  "Global Supply Chain Pressure",
  "The Quantum Threat",
  "Lithium's New Frontier"
];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>(DEFAULT_TRENDING);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));
    
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/articles/trending?limit=3`);
        const data = await res.json();
        setFeaturedArticles(data);
      } catch (e) {
        console.error("Featured fetch error", e);
      }
    };
    
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${NEWS_API_BASE}/live?limit=6`);
        if (res.ok) {
           const data = await res.json();
           if (data && data.length > 0) {
             const dynamicTrends = data.map((d: any) => {
                const title = d.title;
                return title.length > 40 ? title.substring(0, 40) + '...' : title;
             });
             setTrendingSearches(dynamicTrends);
           }
        }
      } catch (e) {
        console.error("Trending fetch error", e);
      }
    };

    fetchFeatured();
    fetchTrending();

    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const [articleRes, newsRes] = await Promise.all([
          fetch(`${API_BASE}/public/articles/search?q=${encodeURIComponent(query)}&limit=3`).catch(() => null),
          fetch(`${NEWS_API_BASE}/live?search=${encodeURIComponent(query)}&limit=3`).catch(() => null)
        ]);
        
        let results: any[] = [];
        
        if (articleRes && articleRes.ok) {
          const articleData = await articleRes.json();
          results = [...results, ...articleData.map((a: any) => ({ ...a, isNews: false }))];
        }
        
        if (newsRes && newsRes.ok) {
           const newsData = await newsRes.json();
           results = [...results, ...newsData.map((n: any) => ({ 
             ...n, 
             isNews: true, 
             hero_image: n.image_url, 
             category_name: n.category || 'Live News' 
           }))];
        }
        
        setSuggestions(results);
      } catch (e) {
        console.error("Search fetch error", e);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    // Save to recent
    const updatedRecents = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updatedRecents);
    localStorage.setItem("recent_searches", JSON.stringify(updatedRecents));
    
    onClose();
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-xl">
      {/* Header Container */}
      <div className="w-full bg-slate-900/50 border-b border-white/10 px-4 py-4 md:py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search intelligence reports..."
              className="w-full bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none transition-all shadow-2xl"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                 <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-10">
          
          {/* Recent Searches */}
          {recentSearches.length > 0 && !query && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> Recent Searches
                </h3>
                <button onClick={clearRecent} className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center gap-1">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button 
                    key={s} 
                    onClick={() => handleSearch(s)}
                    className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-full text-sm text-slate-300 transition-all flex items-center gap-2 group"
                  >
                    <Clock size={12} className="text-slate-500 group-hover:text-indigo-400" /> {s}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending Searches */}
          {!query && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} /> Trending Intelligence
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trendingSearches.map((s) => (
                  <button 
                    key={s} 
                    onClick={() => handleSearch(s)}
                    className="flex items-center justify-between p-4 bg-slate-900/40 hover:bg-indigo-600/10 border border-white/5 rounded-2xl group transition-all"
                  >
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white">{s}</span>
                    <ArrowRight size={16} className="text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Featured Insights (Empty State) */}
          {!query && featuredArticles.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} /> Featured Strategic Insights
              </h3>
              <div className="space-y-3">
                {featuredArticles.map((article) => (
                  <Link 
                    key={article.id} 
                    href={`/${getCategorySlugForArticle(article.category_name)}/${article.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 bg-slate-900/40 hover:bg-slate-800 border border-white/5 rounded-2xl group transition-all"
                  >
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                      {article.hero_image ? (
                        <img src={article.hero_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 font-black text-xl">R</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{article.category_name || 'Strategic'}</p>
                      <h4 className="text-sm font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors line-clamp-2">{article.title}</h4>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Live Suggestions */}
          {query && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Suggested Reports</h3>
              <div className="space-y-2">
                {suggestions.length > 0 ? (
                  <>
                    {suggestions.map((item) => (
                      <Link 
                        key={`${item.isNews ? 'news' : 'article'}-${item.id}`} 
                        href={item.isNews ? `/news/${item.slug}` : `/${getCategorySlugForArticle(item.category_name)}/${item.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-4 bg-slate-900/40 hover:bg-slate-800 border border-white/5 rounded-2xl group transition-all"
                      >
                        <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                          {item.hero_image ? (
                            <img src={item.hero_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600"><FileText size={20} /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                          <p className="text-xs text-slate-400 truncate">{item.category_name || 'Strategic Report'}</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </Link>
                    ))}
                    <button 
                      onClick={() => handleSearch(query)}
                      className="w-full p-4 flex items-center justify-center gap-2 text-sm font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                    >
                      Show all results for "{query}" <ArrowRight size={16} />
                    </button>
                  </>
                ) : !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No reports matched your query.</p>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
