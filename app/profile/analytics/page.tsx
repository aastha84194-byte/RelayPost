"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BarChart2, Activity, PieChart, TrendingUp, Sparkles, 
  Lock, BookOpen, Clock, RefreshCw, AlertCircle, ArrowUpRight
} from "lucide-react";
import Cookies from "js-cookie";
import { API_BASE } from "@/lib/config";
import { useTier } from "@/components/TierProvider";

interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

interface ActivityVolume {
  day: string;
  reads: number;
}

interface TrendTopic {
  topic: string;
  rank: number;
  score: number;
}

interface AnalyticsData {
  category_distribution: CategoryStat[];
  activity_volume: ActivityVolume[];
  global_trends: TrendTopic[];
  total_reads: number;
  total_reading_minutes?: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tier, isLoading: tierLoading } = useTier();

  useEffect(() => {
    if (tier === "free" || tierLoading) return;
    const token = Cookies.get("access_token") || localStorage.getItem("auth_token");
    if (!token) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/profile/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setData(await res.json());
        } else {
          setError("Failed to fetch intelligence reports.");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [tier, tierLoading]);

  // ── 1. Locked State for Free Tier ──
  if (!tierLoading && tier === "free") {
    return (
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-md mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-6">
          <Lock size={24} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Analytics Gated</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Upgrade to <strong className="font-bold text-slate-700 dark:text-slate-300">Plus</strong> or <strong className="font-bold text-slate-700 dark:text-slate-300">Pro</strong> to unlock reading insights, category analytics, topic trends, and personalized reading meters.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-2xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none text-sm"
        >
          View Plans & Upgrade
        </Link>
      </div>
    );
  }

  // ── 2. Loading State ──
  if (loading || tierLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <RefreshCw size={24} className="animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Assembling analytics dashboard…</p>
      </div>
    );
  }

  // ── 3. Error State ──
  if (error || !data) {
    return (
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-md mx-auto">
        <AlertCircle size={32} className="text-rose-500 mx-auto mb-4" />
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Failed to Load</h3>
        <p className="text-sm text-slate-400 mb-4">{error || "No data received from intelligence module."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black dark:text-white mb-1 flex items-center gap-2">
          <Activity size={22} className="text-indigo-500" /> Analytics & Trends
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Reading analytics and topic velocity dashboard.</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Publications Read</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{data.total_reads}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Reading Time</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{data.total_reading_minutes || 0} minutes</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category distribution */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <PieChart size={14} className="text-indigo-500" /> Category Affinity
          </h3>
          <div className="space-y-3">
            {data.category_distribution.map((cat, idx) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{cat.category}</span>
                  <span className="text-slate-400">{cat.percentage}%</span>
                </div>
                {/* Horizontal bar mimic chart */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      idx === 0 ? "bg-indigo-500" : idx === 1 ? "bg-violet-500" : "bg-sky-400"
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly activity chart */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Activity size={14} className="text-indigo-500" /> Weekly Reading Activity
          </h3>
          <div className="flex items-end justify-between h-40 pt-4 px-2">
            {data.activity_volume.map((vol) => (
              <div key={vol.day} className="flex flex-col items-center gap-2 group w-8">
                {/* Tooltip */}
                <span className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] py-1 px-1.5 rounded-lg absolute -translate-y-8 transition-opacity font-bold">
                  {vol.reads} reads
                </span>
                {/* Bar */}
                <div 
                  className="w-5 bg-indigo-500/25 group-hover:bg-indigo-500 rounded-t-lg transition-all duration-300"
                  style={{ height: `${vol.reads > 0 ? Math.max(10, Math.min(100, (vol.reads / 10) * 100)) : 0}px` }}
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{vol.day}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Global trending topics */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-indigo-500" /> Global Topic Trends
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.global_trends.map((t) => (
            <div key={t.topic} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-indigo-600 shrink-0">#{t.rank}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.topic}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                  Spike score: {t.score}%
                </span>
                <ArrowUpRight size={14} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
