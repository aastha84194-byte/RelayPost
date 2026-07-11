"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Article } from "@/lib/types";
import { BookmarkMinus } from "lucide-react";
import Cookies from "js-cookie";
import { API_BASE } from "@/lib/config";
import { getCategorySlugForArticle } from "@/lib/categoryMapping";

export default function SavedArticlesPage() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchSavedArticles = async () => {
      const token = Cookies.get("access_token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/profile/saved?limit=50`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSavedArticles(data);
        }
      } catch (err) {
        console.error("Failed to fetch saved articles", err);
      }
    };
    fetchSavedArticles();
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
            <Link href={`/${getCategorySlugForArticle(article.category_name)}/${article.slug}`} className="relative aspect-[16/9] w-full block overflow-hidden">
              <Image src={article.hero_image || ""} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </Link>
            
            <button className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 text-slate-700 hover:text-rose-500 dark:text-slate-300 p-2 rounded-full shadow-sm transition-colors z-10">
              <BookmarkMinus size={18} />
            </button>

            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <Link href={`/${getCategorySlugForArticle(article.category_name)}/${article.slug}`} className="font-bold text-lg leading-tight lg:leading-snug dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-3 mb-2">
                  {article.title}
                </Link>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-4">
                Saved Article
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
