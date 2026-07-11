"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getAllArticles, toggleFollow, getUserFollows, getUserIdentifier } from "@/lib/articles";
import { Article } from "@/lib/types";
import { getCategoryMapping, getAllBackendSlugsForFrontendSlug, getCategorySlugForArticle } from "@/lib/categoryMapping";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, Bookmark, BookmarkCheck } from "lucide-react";

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  const rotateX = useTransform(smoothY, [0, 1], [2, -2]);
  const rotateY = useTransform(smoothX, [0, 1], [-2, 2]);

  useEffect(() => {
    if (!slug) return;
    const id = getUserIdentifier();
    setUserId(id);

    const backendSlugs = getAllBackendSlugsForFrontendSlug(slug as string);
    const categoryMapping = getCategoryMapping(slug as string);
    setCategory(categoryMapping);

    Promise.all([
      ...backendSlugs.map(bs => getAllArticles(bs)),
      getUserFollows(id)
    ]).then(results => {
      const follows = results.pop() as any[];
      const allArticlesArrays = results as Article[][];
      
      // Merge and deduplicate articles
      const mergedArticles = allArticlesArrays.flat();
      const uniqueArticles = Array.from(new Map(mergedArticles.map(item => [item.id, item])).values());
      // Sort by publish date descending
      uniqueArticles.sort((a: any, b: any) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());

      setArticles(uniqueArticles);
      setIsFollowed(follows.some((f: any) => f.target_id === categoryMapping?.id));
      setIsLoading(false);
      setSkip(20);
      if (uniqueArticles.length < 20) {
         setHasMore(false);
      }
    });
  }, [slug]);

  const loadMore = async () => {
    if (!slug || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    
    const backendSlugs = getAllBackendSlugsForFrontendSlug(slug as string);
    const newArticlesArrays = await Promise.all(backendSlugs.map(bs => getAllArticles(bs, skip, 20)));
    
    const newArticles = newArticlesArrays.flat();
    if (newArticles.length === 0) {
      setHasMore(false);
      setIsLoadingMore(false);
      return;
    }
    
    setArticles(prev => {
      const merged = [...prev, ...newArticles];
      const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
      unique.sort((a: any, b: any) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
      return unique;
    });
    
    setSkip(prev => prev + 20);
    if (newArticles.length < 20) {
      setHasMore(false);
    }
    setIsLoadingMore(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleToggleFollow = async () => {
    if (!category) return;
    const res = await toggleFollow(userId, category.id, 'category');
    setIsFollowed(!!res);
  };

  const displayName = category?.name || (slug as string)?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen flex flex-col font-['Inter']">
      <Navbar />
      
      <main className="flex-grow pb-32">
        {/* AntiGravity Hero Header */}
        <div className="relative bg-slate-900 py-24 md:py-32 overflow-hidden">
          {/* Background Image & Gradient */}
          <div className="absolute inset-0 z-0">
            {category?.image_url && (
               <img src={category.image_url} alt="" className="w-full h-full object-cover opacity-30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-slate-950/80 to-slate-900/40"></div>
          </div>

          <div className="absolute inset-0 opacity-30 z-0 mix-blend-screen">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black tracking-tight text-white uppercase leading-[0.9] mb-6 drop-shadow-lg"
              >
                {displayName}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-lg md:text-xl font-medium max-w-2xl leading-relaxed"
              >
                {category?.description || `High-density intelligence synthesis focusing on upcoming breakthroughs and critical shifts within the ${displayName} ecosystem.`}
              </motion.p>
            </div>

            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col items-start md:items-end gap-4"
            >
               <div className="flex items-center gap-3">
                 <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Followed by</span>
                 <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-lg">+8K</div>
               </div>
               <button 
                onClick={handleToggleFollow}
                className={`group flex items-center gap-3 px-8 py-4 rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${isFollowed ? 'bg-white text-slate-900 border border-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'}`}
               >
                 {isFollowed ? 'Channel Followed' : 'Follow Channel'}
                 {isFollowed ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
               </button>
            </motion.div>
          </div>
          <div className="absolute -bottom-[2px] left-0 w-full h-[calc(8rem+4px)] bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-10 pointer-events-none"></div>
        </div>

        {/* Content Corridor */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="max-w-7xl mx-auto px-4 md:px-8 mt-8 md:mt-12"
          style={{ perspective: "1500px" }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
               {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[16/10] bg-slate-50 dark:bg-slate-900 animate-pulse rounded-[2.5rem]" />)}
            </div>
          ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12" style={{ transformStyle: "preserve-3d" }}>
              {articles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  style={{ rotateX: rotateX, rotateY: rotateY, transformStyle: "preserve-3d" }}
                  whileHover={{ y: -6 }}
                  className="group relative"
                >
                  <Link href={`/${getCategorySlugForArticle(article.category_name)}/${article.slug}`} className="block h-full">
                    <div className="flex flex-col h-full bg-white dark:bg-slate-900/50 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={article.hero_image || `https://images.unsplash.com/photo-${1600000000000 + idx * 1000}?auto=format&fit=crop&q=80&w=800`}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      
                      <div className="p-6 md:p-8 flex flex-col flex-grow">
                        <h3 className="text-xl md:text-2xl font-black leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors tracking-tighter uppercase mb-4">
                          {article.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium line-clamp-3 italic">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            {articles.length > 0 && hasMore && (
              <div className="mt-16 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-md hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Intelligence'
                  )}
                </button>
              </div>
            )}
          </>
          ) : (
            <div className="text-center py-40 rounded-[4rem] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-white/10">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-8xl mb-8">dashboard_customize</span>
              <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-lg mb-8">No intelligence found in this node.</p>
              <Link href="/categories" className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                Return to Discover more Categories
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
