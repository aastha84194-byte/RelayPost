"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/types";
import { Heart } from "lucide-react";
import { getCategorySlugForArticle } from "@/lib/categoryMapping";

export default function FavoritesPage() {
  const [favArticles, setFavArticles] = useState<Article[]>([]);

  useEffect(() => {
    // MOCK data matching the subset seen on the dashboard
    setFavArticles([
      {
        id: "4",
        title: "The Automation Paradox: Human Labor in the Age of LLMs",
        status: "published",
        slug: "automation",
        hero_image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800",
        created_at: new Date().toISOString(),
      } as unknown as Article,
      {
        id: "5",
        title: "Rethinking the Ivy League: The Rise of Specialized Intelligence Hubs",
        status: "published",
        slug: "ivy-league",
        hero_image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800",
        created_at: new Date().toISOString(),
      } as unknown as Article,
    ]);
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">Favorite Articles</h1>
          <p className="text-slate-500 dark:text-slate-400">Articles you've liked and endorsed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favArticles.map(article => (
          <Link href={`/${getCategorySlugForArticle(article.category_name)}/${article.slug}`} key={article.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow relative">
            
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 z-10 transition-transform group-hover:scale-110">
              <Heart size={18} className="text-rose-500 fill-rose-500" />
            </div>

            <div className="w-32 h-32 shrink-0 rounded-xl overflow-hidden relative border border-slate-100 dark:border-slate-800">
              <Image src={article.hero_image || ""} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
            </div>
            
            <div className="flex flex-col justify-center flex-1 pr-4">
              <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors mb-3">
                {article.title}
              </h3>
              <div className="flex gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <span>Published Dec 2023</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
