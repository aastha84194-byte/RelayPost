"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getPublicKeywords, getArticlesByKeyword, toggleFollow, getUserFollows, getUserIdentifier } from "@/lib/articles";
import { Article } from "@/lib/types";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Zap, Bookmark, BookmarkCheck } from "lucide-react";

export default function KeywordDetailPage() {
  const { tag } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [keyword, setKeyword] = useState<any>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  const rotateX = useTransform(smoothY, [0, 1], [4, -4]);
  const rotateY = useTransform(smoothX, [0, 1], [-4, 4]);

  useEffect(() => {
    if (!tag) return;
    const id = getUserIdentifier();
    setUserId(id);

    // Using decodeURIComponent because tags can have spaces/special chars in URL
    const decodedTag = decodeURIComponent(tag as string);

    Promise.all([
      getPublicKeywords(),
      getArticlesByKeyword(decodedTag, 1, 50),
      getUserFollows(id)
    ]).then(([kws, artData, follows]) => {
      const currentKw = kws.find((k: any) => k.tag.toLowerCase() === decodedTag.toLowerCase());
      setKeyword(currentKw);
      setArticles(artData.items || []);
      if (currentKw) {
        setIsFollowed(follows.some((f: any) => f.target_id === currentKw.id));
      }
      setIsLoading(false);
    });
  }, [tag]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleToggleFollow = async () => {
    if (!keyword) return;
    const res = await toggleFollow(userId, keyword.id, 'keyword');
    setIsFollowed(!!res);
  };

  const displayName = keyword?.tag || decodeURIComponent(tag as string);

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen flex flex-col font-['Inter']">
      <Navbar />
      
      <main className="flex-grow pb-32">
        {/* Topic Hero Header */}
        <div className="relative bg-indigo-950 py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-40">
             <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/20 blur-[150px] rounded-full -translate-y-1/2 -translate-x-1/2"></div>
             <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2"></div>
          </div>

          <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-8 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300"
              >
                <Zap size={14} className="fill-current" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Knowledge Node</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase leading-[0.8] mb-8"
              >
                #{displayName}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-xl font-medium max-w-xl italic leading-relaxed"
              >
                {keyword?.description || `Live intelligence stream capturing the latest shifts, research, and expert signals within the ${displayName} corridor.`}
              </motion.p>
            </div>

            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col items-start md:items-end gap-6"
            >
               <button 
                onClick={handleToggleFollow}
                className={`group flex items-center gap-3 px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl ${isFollowed ? 'bg-white text-slate-900' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'}`}
               >
                 {isFollowed ? 'Node Followed' : 'Follow Node'}
                 {isFollowed ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
               </button>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent"></div>
        </div>

        {/* Intelligence Grid */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="max-w-7xl mx-auto px-8 mt-20"
          style={{ perspective: "1500px" }}
        >
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
               {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[16/10] bg-slate-50 dark:bg-slate-900 animate-pulse rounded-[2.5rem]" />)}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12" style={{ transformStyle: "preserve-3d" }}>
              {articles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  style={{ rotateX: rotateX, rotateY: rotateY, transformStyle: "preserve-3d" }}
                  whileHover={{ z: 50, scale: 1.02 }}
                  className="group relative"
                >
                  <Link href={`/article/${article.slug}`} className="block">
                    <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] overflow-hidden mb-8 relative shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-white/5">
                      <img
                        src={article.hero_image || `https://images.unsplash.com/photo-${1600000000000 + idx * 1000}?auto=format&fit=crop&q=80&w=800`}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    
                    <div className="px-2" style={{ transform: "translateZ(30px)" }}>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4 block">#{displayName}</span>
                      <h3 className="text-2xl font-black leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors tracking-tighter uppercase mb-4">
                        {article.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium line-clamp-2 italic">
                        {article.excerpt}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40 rounded-[4rem] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-white/10">
              <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-8xl mb-8">category</span>
              <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-lg mb-8">No articles found in this knowledge node.</p>
              <Link href="/categories" className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                Access Discovery Corridors
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
