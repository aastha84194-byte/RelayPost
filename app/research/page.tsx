"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTier } from "@/components/TierProvider";
import { UsageMeter } from "@/components/UsageMeter";
import { API_BASE } from "@/lib/config";
import Cookies from "js-cookie";
import {
  FlaskConical, BookOpen, Send, Loader2, Sparkles, X, ChevronDown,
  ChevronUp, Lock, Zap, ExternalLink, Plus, Minus, BarChart2, FileText
} from "lucide-react";

interface SavedBookmark {
  id: string;
  title?: string;
  slug?: string;
  article_id?: string;
  source_type: string;
}

interface ResearchResult {
  report: string;
  sources_used: number;
}

const PROMPT_TEMPLATES = [
  "What are the major economic risks emerging from recent events?",
  "Summarise the geopolitical developments of this week.",
  "What technology trends are accelerating across industries?",
  "How are supply chain disruptions evolving globally?",
];

export default function ResearchPage() {
  const { tier, isLoading: tierLoading } = useTier();

  const [prompt, setPrompt] = useState("");
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  const [refPickerOpen, setRefPickerOpen] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const isProUser = tier === "pro";

  const fetchBookmarks = useCallback(async () => {
    const token = Cookies.get("access_token");
    if (!token) return;
    setBookmarksLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookmarks?source_type=article&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.bookmarks ?? []);
      }
    } catch {}
    finally { setBookmarksLoading(false); }
  }, []);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const toggleRef = (id: string) => {
    setSelectedRefs(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || researchLoading) return;
    const token = Cookies.get("access_token");
    if (!token) return;

    setResearchLoading(true);
    setError(null);
    setResult(null);

    const selectedBms = bookmarks.filter(b => selectedRefs.has(b.id));
    const article_ids = selectedBms.map(b => b.article_id).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE}/premium/ai/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic: prompt, article_ids }),
      });
      if (res.status === 403) {
        const d = await res.json();
        setError(d.detail?.message || "Pro tier required. Upgrade to unlock the Research Lab.");
      } else if (!res.ok) {
        throw new Error("Research failed");
      } else {
        setResult(await res.json());
      }
    } catch {
      setError("Failed to generate research report. Please try again.");
    } finally {
      setResearchLoading(false);
    }
  };

  // ── Locked state for non-Pro users ─────────────────────────────────────────
  if (!tierLoading && !isProUser) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0f1e] font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-24">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-3xl flex items-center justify-center mx-auto">
              <Lock size={32} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Pro Research Lab</h1>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Compile comprehensive, multi-layered research reports by combining your bookmarked articles with AI analysis. Available exclusively for <strong>Pro</strong> members.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-left">
              {["Custom AI research prompts", "Attach bookmarked articles as references", "Structured multi-section reports", "Export and share findings"].map(f => (
                <div key={f} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3">
                  <Zap size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
                </div>
              ))}
            </div>
            <Link href="/pricing" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors shadow-xl shadow-violet-200 dark:shadow-none">
              <ExternalLink size={16} /> Upgrade to Pro
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0f1e] font-sans">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full border border-violet-200 dark:border-violet-800/50">
                <Sparkles size={9} /> Pro Feature
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <FlaskConical size={32} className="text-violet-600 dark:text-violet-400" />
              Research Lab
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm md:text-base">
              Build comprehensive research reports using AI + your saved articles.
            </p>
          </div>
          <UsageMeter feature="research_mode" showBar={true} className="hidden md:flex min-w-[180px]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left panel: Query builder ── */}
          <div className="lg:col-span-3 space-y-4">
            <form onSubmit={handleResearch} className="space-y-4">
              {/* Prompt input */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <div className="px-5 pt-5 pb-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">Research Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Enter your research question or topic…"
                    rows={4}
                    className="w-full bg-transparent text-base text-slate-900 dark:text-white placeholder:text-slate-400 resize-none outline-none leading-relaxed"
                  />
                </div>

                {/* Template picker */}
                <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3">
                  <button type="button" onClick={() => setShowTemplates(s => !s)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <Sparkles size={11} /> Templates
                    {showTemplates ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {showTemplates && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {PROMPT_TEMPLATES.map(t => (
                        <button key={t} type="button" onClick={() => { setPrompt(t); setShowTemplates(false); }}
                          className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-xl transition-colors text-left">
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected refs preview */}
              {selectedRefs.size > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2">{selectedRefs.size} Reference{selectedRefs.size > 1 ? "s" : ""} attached</p>
                  <div className="flex flex-col gap-1.5">
                    {bookmarks.filter(b => selectedRefs.has(b.id)).map(b => (
                      <div key={b.id} className="flex items-center gap-2">
                        <BookOpen size={11} className="text-indigo-400 shrink-0" />
                        <span className="text-xs text-indigo-800 dark:text-indigo-200 line-clamp-1 flex-1">{b.title || "Untitled"}</span>
                        <button type="button" onClick={() => toggleRef(b.id)} className="text-indigo-400 hover:text-red-500 transition-colors shrink-0">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl px-4 py-3 flex items-start gap-2">
                  <span className="flex-1">{error}</span>
                  {error.includes("Pro") && <Link href="/pricing" className="font-bold underline underline-offset-2 shrink-0">Upgrade →</Link>}
                </div>
              )}

              <button type="submit" disabled={!prompt.trim() || researchLoading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black rounded-2xl transition-colors text-sm shadow-xl shadow-violet-200 dark:shadow-none">
                {researchLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Compiling Report…</>
                  : <><Send size={16} /> Generate Research Report</>}
              </button>
            </form>

            {/* Mobile usage meter */}
            <div className="md:hidden">
              <UsageMeter feature="research_mode" showBar={true} />
            </div>
          </div>

          {/* ── Right panel: Reference picker ── */}
          <div className="lg:col-span-2">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden sticky top-6">
              <button
                type="button"
                onClick={() => setRefPickerOpen(s => !s)}
                className="w-full flex items-center justify-between gap-2 px-5 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={15} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Attach References
                    {selectedRefs.size > 0 && <span className="ml-2 text-indigo-600 dark:text-indigo-400">({selectedRefs.size})</span>}
                  </span>
                </div>
                {refPickerOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
              </button>

              {refPickerOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800 max-h-80 overflow-y-auto">
                  {bookmarksLoading ? (
                    <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                  ) : bookmarks.length === 0 ? (
                    <div className="px-5 py-6 text-center">
                      <p className="text-sm text-slate-400 dark:text-slate-500 mb-2">No saved articles yet.</p>
                      <Link href="/news" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Browse articles →</Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bookmarks.filter(b => b.source_type === "article").map(b => (
                        <li key={b.id}>
                          <button
                            type="button"
                            onClick={() => toggleRef(b.id)}
                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${selectedRefs.has(b.id) ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-slate-100 dark:hover:bg-slate-800/60"}`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${selectedRefs.has(b.id) ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-600"}`}>
                              {selectedRefs.has(b.id) && <span className="text-white text-[10px] font-black">✓</span>}
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">{b.title || "Untitled"}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Research Result ── */}
        {result && (
          <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <BarChart2 size={16} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 dark:text-white text-base">Research Report</h2>
                  <p className="text-[11px] text-slate-400">{result.sources_used} source{result.sources_used !== 1 ? "s" : ""} referenced</p>
                </div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(result.report); }}
                className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                <FileText size={13} /> Copy
              </button>
            </div>
            <div className="px-6 py-6 prose prose-slate dark:prose-invert max-w-none space-y-3">
              {result.report.split("\n").map((line, i) => {
                const t = line.trim();
                if (!t) return <div key={i} className="h-2" />;
                if (t.startsWith("## ")) return <h2 key={i} className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider mt-6 mb-2 not-prose">{t.slice(3)}</h2>;
                if (t.startsWith("# ")) return <h1 key={i} className="text-lg font-black text-slate-900 dark:text-white mt-2 mb-3 not-prose">{t.slice(2)}</h1>;
                if (t.startsWith("- ") || t.startsWith("• ")) return <p key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300 not-prose"><span className="text-violet-500 shrink-0 mt-0.5">•</span><span>{t.slice(2)}</span></p>;
                return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed not-prose">{t}</p>;
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
