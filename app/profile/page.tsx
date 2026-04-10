"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit2, Share2, Sparkles, Clock, Users, CreditCard, Plus } from "lucide-react";
import { Article } from "@/lib/types";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";


export default function ProfileDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [favArticles, setFavArticles] = useState<Article[]>([]);

  useEffect(() => {
    // In a real implementation we would fetch the user stats from our new backend routes
    // But since this is a frontend layout built to match the image, we will mock the backend returns
    // for immediate UI parity or fetch if backend is connected
    const fetchDashboardContent = async () => {
      try {
        const token = (await import("js-cookie")).default.get("access_token");
        
        // Example backend call:
        // const statsRes = await fetch(`${API_BASE}/profile/stats`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const statsData = await statsRes.json();
        
        // MOCK data to match image
        setStats({
          articles_curated: 1284,
          history_explored: 42.5,
          followers: "8.9k"
        });

        // Mock saved articles based on image
        setSavedArticles([
          {
            id: "1",
            title: "The Quantum Leap: Why Space Tech is the New Frontier for Private Equity",
            status: "published",
            content_blocks: [],
            media_gallery: [],
            secondary_keywords: [],
            key_takeaways: [],
            faq_section: [],
            created_at: new Date().toISOString(),
            author_id: "alex",
            slug: "quantum-leap",
            hero_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800",
          } as unknown as Article,
          {
            id: "2",
            title: "Digital Fortresses: Navigating the 2024 Cybersecurity Landscape",
            status: "published",
            content_blocks: [],
            media_gallery: [],
            secondary_keywords: [],
            key_takeaways: [],
            faq_section: [],
            created_at: new Date().toISOString(),
            author_id: "alex",
            slug: "cyber-landscape",
            hero_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800",
          } as unknown as Article,
          {
            id: "3",
            title: "The Pivot: Central Bank Strategies in a Decoupling Global Economy",
            status: "published",
            content_blocks: [],
            media_gallery: [],
            secondary_keywords: [],
            key_takeaways: [],
            faq_section: [],
            created_at: new Date().toISOString(),
            author_id: "alex",
            slug: "central-bank",
            hero_image: "https://images.unsplash.com/photo-1611974714451-f4043fbb10e3?auto=format&fit=crop&w=800",
          } as unknown as Article
        ]);

        setFavArticles([
          {
            id: "4",
            title: "The Automation Paradox: Human Labor in the Age of LLMs",
            status: "published",
            content_blocks: [],
            media_gallery: [],
            secondary_keywords: [],
            key_takeaways: [],
            faq_section: [],
            created_at: new Date().toISOString(),
            author_id: "alex",
            slug: "automation",
            hero_image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800",
          } as unknown as Article,
          {
            id: "5",
            title: "Rethinking the Ivy League: The Rise of Specialized Intelligence Hubs",
            status: "published",
            content_blocks: [],
            media_gallery: [],
            secondary_keywords: [],
            key_takeaways: [],
            faq_section: [],
            created_at: new Date().toISOString(),
            author_id: "alex",
            slug: "ivy-league",
            hero_image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800",
          } as unknown as Article
        ]);

      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardContent();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top row cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Profile Card */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-center shadow-sm relative border border-slate-100 dark:border-slate-800">
          <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Member
          </div>

          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden mb-4 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 relative">
            <Image 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" 
              alt="Profile" 
              fill
              className="object-cover bg-slate-200 dark:bg-slate-800"
              unoptimized
            />
          </div>
          
          <h2 className="text-2xl font-bold dark:text-white">Alex Johnson</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Member since: Jan 2022</p>

          <div className="flex gap-4 mt-6 w-full max-w-xs">
            <button className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
              <Edit2 size={16} /> Edit Profile
            </button>
            <button className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        {/* Intelligence Pulse Card */}
        <div className="bg-[#1e2335] dark:bg-[#161a28] rounded-3xl p-8 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
          
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8">Intelligence Pulse</h3>

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <div>
                <p className="text-3xl font-bold">{stats?.articles_curated || "..."}</p>
                <p className="text-xs text-slate-400 mt-1">Articles Curated</p>
              </div>
              <Sparkles size={24} className="text-indigo-400 mb-2" />
            </div>

            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <div>
                <p className="text-3xl font-bold">{stats?.history_explored || "..."}h</p>
                <p className="text-xs text-slate-400 mt-1">History Explored</p>
              </div>
              <Clock size={24} className="text-emerald-400 mb-2" />
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold">{stats?.followers || "..."}</p>
                <p className="text-xs text-slate-400 mt-1">Followers</p>
              </div>
              <Users size={24} className="text-rose-400 mb-2" />
            </div>
          </div>
        </div>
        
      </div>

      {/* Middle row cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Subscription Status Card */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg dark:text-white">Subscription Status</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">Your Plan:</span>
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded">Pro Subscriber</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <CreditCard size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Next Payment</span>
              <span className="font-bold dark:text-white">Feb 12, 2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Amount</span>
              <span className="font-bold dark:text-white">$19.00 / mo</span>
            </div>
          </div>

          <button className="w-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold py-3 rounded-full border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
            Manage Billing
          </button>
        </div>

        {/* Global Topics Card */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg dark:text-white mb-2">My Global Topics</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Your intelligence feeds are currently optimized for these personalized clusters.
          </p>

          <div className="flex flex-wrap gap-2">
            {["#techtrends", "#marketinsights", "#geopolitics", "#sustainability", "#aiethics", "#macroeconomics"].map(tag => (
              <span 
                key={tag}
                className={`px-4 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700/50 dark:bg-slate-800
                  ${tag === '#techtrends' ? 'bg-indigo-50 text-indigo-700 dark:text-indigo-400' : ''}
                  ${tag === '#marketinsights' ? 'bg-purple-50 text-purple-700 dark:text-purple-400' : ''}
                  ${tag === '#geopolitics' ? 'bg-orange-50 text-orange-700 dark:text-orange-400' : ''}
                  ${tag === '#sustainability' ? 'bg-emerald-50 text-emerald-700 dark:text-emerald-400' : ''}
                  ${tag === '#aiethics' ? 'bg-rose-50 text-rose-700 dark:text-rose-400' : ''}
                  ${tag === '#macroeconomics' ? 'bg-cyan-50 text-cyan-700 dark:text-cyan-400' : ''}
                `}
              >
                {tag}
              </span>
            ))}
            <button className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Saved For Later Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Saved for Later</h2>
          <Link href="/profile/saved" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savedArticles.map(article => (
            <Link href={`/article/${article.slug}`} key={article.id} className="group flex flex-col">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                <Image src={article.hero_image || ""} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                  12 min read
                </div>
              </div>
              <h3 className="font-bold text-sm leading-tight group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors mb-2">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Added 2 days ago</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Favorite Articles Section */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Favorite Articles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favArticles.map(article => (
            <Link href={`/article/${article.slug}`} key={article.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-4 hover:shadow-md transition-shadow">
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative border border-slate-100 dark:border-slate-800">
                <Image src={article.hero_image || ""} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-sm leading-tight group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors mb-3">
                  {article.title}
                </h3>
                <div className="flex gap-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span className="text-rose-500 flex items-center gap-1">❤ Top Rated</span>
                  <span>Published Dec 2023</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
