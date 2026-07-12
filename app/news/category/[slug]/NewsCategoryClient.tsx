"use client";

import React, { useState, useCallback } from 'react';
import { NewsCard } from '../../../components/NewsCard';
import { Layers, ArrowLeft, Sparkles, ChevronDown, ChevronUp, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { NewsArticle } from '@/lib/types';
import { getNewsByCategory } from '@/lib/articles';
import { useTier } from '@/components/TierProvider';
import { API_BASE } from '@/lib/config';
import Cookies from 'js-cookie';

interface Props {
  initialArticles: NewsArticle[];
  decodedCategory: string;
  slug: string;
}

interface WeeklyReportData {
  topic_cluster: string;
  week_label: string;
  report: string;
  article_count: number;
}

export default function NewsCategoryClient({ initialArticles, decodedCategory, slug }: Props) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [skip, setSkip] = useState(20);
  const [hasMore, setHasMore] = useState(initialArticles.length === 20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Weekly Intelligence Report state
  const { tier } = useTier();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<WeeklyReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const res = await getNewsByCategory(decodedCategory, skip, 20);
      const newArticles = res.items || [];
      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles(prev => {
          const merged = [...prev, ...newArticles];
          return Array.from(new Map(merged.map(item => [item.id, item])).values());
        });
        setSkip(prev => prev + 20);
        if (newArticles.length < 20) setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more news:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const fetchWeeklyReport = useCallback(async () => {
    if (reportData) { setReportOpen(o => !o); return; }
    const token = Cookies.get('access_token');
    if (!token) { setReportError('Please log in to access Weekly Reports.'); setReportOpen(true); return; }

    setReportLoading(true);
    setReportError(null);
    setReportOpen(true);
    try {
      const topic = encodeURIComponent(decodedCategory);
      const res = await fetch(`${API_BASE}/premium/weekly-report/${topic}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        const d = await res.json();
        setReportError(d.detail?.message || 'Weekly Reports require a Plus subscription.');
      } else if (!res.ok) {
        throw new Error('Failed to fetch report');
      } else {
        setReportData(await res.json());
      }
    } catch {
      setReportError('Failed to load the weekly report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  }, [decodedCategory, reportData]);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-4">
          <Link
            href="/news"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors w-fit"
          >
            <ArrowLeft size={16} />
            Back to News
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <Layers size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {decodedCategory.toLowerCase().endsWith('news') ? decodedCategory : `${decodedCategory} News`}
            </h1>
          </div>
        </div>

        {/* Weekly Intelligence Report toggle */}
        <button
          onClick={fetchWeeklyReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors text-sm font-bold"
        >
          <Sparkles size={14} />
          Weekly Report
          {reportOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* ── Weekly Intelligence Report panel ── */}
      {reportOpen && (
        <div className="mb-10 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600">
            <Sparkles size={16} className="text-white/80" />
            <div>
              <h2 className="font-black text-white text-base">Weekly Intelligence Report</h2>
              <p className="text-white/60 text-[11px]">{decodedCategory} · {reportData?.week_label ?? 'This week'}</p>
            </div>
          </div>

          <div className="p-6">
            {reportLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={22} className="animate-spin text-indigo-500" />
              </div>
            ) : reportError ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">{reportError}</p>
                {(reportError.includes('Plus') || reportError.includes('subscription')) && (
                  <Link href="/pricing" className="inline-flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    <ExternalLink size={12} /> Upgrade to Plus
                  </Link>
                )}
              </div>
            ) : reportData ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {reportData.report.split('\n').map((line, i) => {
                  const t = line.trim();
                  if (!t) return null;
                  if (t.startsWith('## ')) return (
                    <p key={i} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 pt-4 pb-1">{t.slice(3)}</p>
                  );
                  if (t.startsWith('- ') || t.startsWith('• ')) return (
                    <p key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="text-indigo-400 shrink-0">•</span><span>{t.slice(2)}</span>
                    </p>
                  );
                  return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{t}</p>;
                })}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Article grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No news article found for this category.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(item => <NewsCard key={item.id} article={item} />)}
          </div>
          {hasMore && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-sm hover:shadow-md hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />Loading...</>
                ) : 'Load More News'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
