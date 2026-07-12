"use client";

import React, { useEffect, useState } from "react";
import { Clock, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { getUserHistory } from "@/lib/articles";
import Image from "next/image";

interface HistoryItem {
  id: string;
  source_type: "article" | "news";
  read_at: string;
  duration_seconds: number;
  article?: {
    id: string;
    title: string;
    slug: string;
    category_name: string;
    image_url?: string;
  };
  news?: {
    id: number;
    title: string;
    slug: string;
  };
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const loadHistory = async (currentOffset: number, isLoadMore = false) => {
    const token = Cookies.get("access_token") || localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    if (isLoadMore) setLoadingMore(true);

    try {
      const data = await getUserHistory(token, LIMIT, currentOffset);
      if (data.length < LIMIT) {
        setHasMore(false);
      }
      
      if (isLoadMore) {
        setItems(prev => [...prev, ...data]);
      } else {
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadHistory(0);
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    loadHistory(newOffset, true);
  };

  const groupItemsByDate = (items: HistoryItem[]) => {
    const groups: { [dateStr: string]: HistoryItem[] } = {};
    
    items.forEach(item => {
      if (!item.read_at) return;
      
      const date = new Date(item.read_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateStr = "";
      if (date.toDateString() === today.toDateString()) {
        dateStr = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateStr = "Yesterday";
      } else {
        dateStr = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      }
      
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    
    return groups;
  };

  const grouped = groupItemsByDate(items);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <RefreshCw className="animate-spin mb-4 text-indigo-500" size={32} />
        <p>Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
          <Clock size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reading History</h1>
          <p className="text-slate-500 text-sm mt-1">Articles and news you've recently viewed.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
          <Clock className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">No history yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto">Start reading articles and news to build up your history timeline.</p>
          <Link href="/" className="inline-block mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm">
            Discover Articles
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([date, dateItems]) => (
            <div key={date}>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                {date}
              </h3>
              <div className="space-y-3">
                {dateItems.map(item => {
                  const isArticle = item.source_type === "article" && item.article;
                  const isNews = item.source_type === "news" && item.news;
                  
                  if (!isArticle && !isNews) return null;
                  
                  const title = isArticle ? item.article!.title : item.news!.title;
                  const url = isArticle ? `/${item.article!.category_name.toLowerCase()}/${item.article!.slug}` : `/news/${item.news!.slug}`;
                  const label = isArticle ? "Article" : "News";
                  
                  return (
                    <Link href={url} key={item.id} className="block group">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                        <div className="flex flex-col flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isArticle 
                                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            }`}>
                              {label}
                            </span>
                            {item.duration_seconds > 0 && (
                              <span className="text-[10px] font-medium text-slate-400">
                                {Math.ceil(item.duration_seconds / 60)} min read
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {title}
                          </h4>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0">
                          <ExternalLink size={16} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          
          {hasMore && (
            <div className="pt-4 text-center">
              <button 
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                {loadingMore && <RefreshCw size={16} className="animate-spin" />}
                {loadingMore ? "Loading..." : "Load Older"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
