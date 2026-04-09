"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getAllArticles } from "@/lib/articles";
import { Article } from "@/lib/types";
import { motion } from "framer-motion";
import TrendingNow from "../../components/TrendingNow";
import { Sparkles } from "lucide-react";

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      getAllArticles(slug as string).then((data) => {
        setArticles(data);
        setIsLoading(false);
      });
    }
  }, [slug]);

  const categoryName = (slug as string)?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="min-h-full flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow pb-24">
        {/* Hero Header */}
        <div className="bg-slate-900 overflow-hidden relative py-24 mb-16">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,#4f46e5,transparent)]"></div>
             <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,#7c3aed,transparent)]"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400"
            >
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Stream</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase mb-4">
               {categoryName}
            </h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium">
               A curated intelligence stream focused on the critical shifts and innovations within the {categoryName} ecosystem.
            </p>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
           {isLoading ? (
             <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
                Accessing Intelligence Repository...
             </div>
           ) : articles.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {articles.map((article, idx) => (
                 <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                 >
                    <Link href={`/article/${article.slug}`} className="group block">
                       <div className="aspect-[16/10] bg-slate-100 rounded-[2rem] overflow-hidden mb-6 relative shadow-lg">
                          <img 
                            src={article.hero_image || "/placeholder-article.jpg"} 
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                       </div>
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 block">{categoryName}</span>
                       <h3 className="text-2xl font-black leading-tight text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight uppercase">
                          {article.title}
                       </h3>
                       <p className="mt-4 text-slate-500 text-sm leading-relaxed font-medium line-clamp-2 italic">
                          {article.excerpt}
                       </p>
                    </Link>
                 </motion.div>
               ))}
             </div>
           ) : (
             <div className="text-center py-32 rounded-[3rem] bg-slate-50 border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No articles found in this corridor.</p>
                <Link href="/categories" className="mt-6 inline-block text-indigo-600 font-bold uppercase tracking-widest text-[10px] hover:underline">
                  Return to Discovery
                </Link>
             </div>
           )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
