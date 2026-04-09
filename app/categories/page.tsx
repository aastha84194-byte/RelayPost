"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getCategories } from "@/lib/articles";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Hash } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow pt-10 pb-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4 block">Discovery Hub</span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-6 uppercase leading-[0.9]">
              Explore by <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Intelligence.</span>
            </h1>
            <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
              Dive deep into specialized editorial channels. From maritime strategy to technological shifts, discover the stories that matter to you.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-[2.5rem] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative h-[320px] bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                       <Hash size={20} />
                    </div>
                  </div>

                  <div className="flex flex-col h-full justify-between relative z-10">
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-3 uppercase group-hover:text-indigo-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed">
                        {cat.description || "The latest intelligence, analysis and community pulse within this vertical."}
                      </p>
                    </div>

                    <Link 
                      href={`/categories/${cat.slug}`}
                      className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-widest uppercase group-hover:gap-4 transition-all"
                    >
                      Browse Channel <ArrowRight size={16} />
                    </Link>
                  </div>
                  
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && categories.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-300">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Intelligence Streams Found</span>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
