"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/types";
import { BookmarkMinus } from "lucide-react";

export default function SavedArticlesPage() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);

  useEffect(() => {
    // MOCK data matching the subset seen on the dashboard
    setSavedArticles([
      {
        id: "1",
        title: "The Quantum Leap: Why Space Tech is the New Frontier for Private Equity",
        status: "published",
        slug: "quantum-leap",
        hero_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800",
        created_at: new Date().toISOString(),
      } as unknown as Article,
      {
        id: "2",
        title: "Digital Fortresses: Navigating the 2024 Cybersecurity Landscape",
        status: "published",
        slug: "cyber-landscape",
        hero_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800",
        created_at: new Date().toISOString(),
      } as unknown as Article,
      // Add more items here...
    ]);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Saved for Later</h1>
          <p className="text-slate-500 dark:text-slate-400">Articles you have bookmarked to read.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedArticles.map(article => (
          <div key={article.id} className="group relative flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300">
            <Link href={`/article/${article.slug}`} className="relative aspect-[16/9] w-full block overflow-hidden">
              <Image src={article.hero_image || ""} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </Link>
            
            <button className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 text-slate-700 hover:text-rose-500 dark:text-slate-300 p-2 rounded-full shadow-sm transition-colors z-10">
              <BookmarkMinus size={18} />
            </button>

            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <Link href={`/article/${article.slug}`} className="font-bold text-lg leading-tight lg:leading-snug dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-3 mb-2">
                  {article.title}
                </Link>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-4">
                Saved 2 days ago
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
