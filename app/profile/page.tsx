"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, TrendingUp, Newspaper, BookOpen, Eye, Calendar,
  ChevronRight, Radio, BarChart2, AlertTriangle, Zap, Lock,
  Edit2, Share2, FileText, RefreshCw, Bell, BellOff, ExternalLink,
  ArrowLeft, ArrowRight
} from "lucide-react";
import { API_BASE, AUTH_BASE } from "@/lib/config";
import Cookies from "js-cookie";
import { useTier } from "@/components/TierProvider";

interface DigestArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  hero_image: string;
  views_count: number;
}

interface DigestNews {
  id: number;
  title: string;
  slug: string;
  source: string;
  category: string;
  image_url: string;
  published_at: string;
}

interface WatchItem {
  title: string;
  description: string;
}

interface Digest {
  id: string;
  week_label: string;
  published_at: string;
  executive_summary: string;
  major_themes: string;
  emerging_signals: string;
  editors_note: string;
  stat_of_week: string;
  top_articles: DigestArticle[];
  top_news: DigestNews[];
  what_to_watch: WatchItem[];
  article_count: number;
  news_count: number;
}

interface PastDigest {
  week_label: string;
  published_at: string;
  article_count: number;
  news_count: number;
}

function parseBullets(text: string): string[] {
  return text
    .split("\n")
    .map(l => l.trim().replace(/^[•\-*]\s*/, ""))
    .filter(l => l && !l.startsWith("#"));
}

// ── Locked state for free users ────────────────────────────────────────────

function DigestLocked() {
  return (
    <div className="rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
      {/* Gradient header — blurred */}
      <div className="relative px-6 py-8 bg-gradient-to-r from-indigo-600 to-violet-700 overflow-hidden">
        <div className="absolute inset-0 backdrop-blur-none" />
        <div className="relative">
          {/* <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/15 text-white px-2.5 py-1 rounded-full border border-white/20 mb-3">
            <Calendar size={11} /> Weekly Digest
          </span> */}
          <h3 className="text-xl font-black text-white">Your Intelligence Brief</h3>
          <p className="text-white/60 text-[12px] mt-1">Published every Sunday</p>
        </div>
      </div>
      {/* Lock CTA */}
      <div className="p-8 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
          <Lock size={24} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h4 className="font-black text-slate-900 dark:text-white text-lg mb-2">Plus & Pro Exclusive</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Get a comprehensive weekly briefing curated from our top articles, breaking news, AI analysis, and much more Personalised according to your preferences — delivered every Sunday.
          </p>
        </div>
        {/* <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-left text-xs">
          {[
            "Executive summary & themes",
            "Top 5 curated articles",
            "Breaking news round-up",
            "What to Watch next week",
            "Stat of the week",
            "Delivered to your inbox",
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Zap size={11} className="text-indigo-500 shrink-0" /> {f}
            </div>
          ))}
        </div> */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3 rounded-2xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-none text-sm"
        >
          <ExternalLink size={14} /> Upgrade to Plus
        </Link>
      </div>
    </div>
  );
}

// ── Digest sections ─────────────────────────────────────────────────────────

function Section({ label, icon, children, bg = "bg-white dark:bg-slate-900" }: { label: string; icon: React.ReactNode; children: React.ReactNode; bg?: string }) {
  return (
    <div className={`${bg} rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden`}>
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <span className="text-indigo-500 dark:text-indigo-400">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Full digest viewer ─────────────────────────────────────────────────────

function DigestViewer({ digest, optedOut, onToggleOptOut }: {
  digest: Digest;
  optedOut: boolean;
  onToggleOptOut: () => void;
}) {
  const statParts = digest.stat_of_week?.split(/—|-/, 2) ?? [];
  const statNum   = statParts[0]?.trim() ?? "";
  const statDesc  = statParts[1]?.trim() ?? "";
  const themes    = parseBullets(digest.major_themes ?? "");
  const signals   = parseBullets(digest.emerging_signals ?? "");

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";
  const fmtShort = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

  return (
    <div className="space-y-4">
      {/* ── Masthead ── */}
      <div className="rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="relative bg-gradient-to-br from-indigo-950 via-violet-900 to-purple-900 px-6 py-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Weekly Intelligence Digest</p>
                <h2 className="text-2xl font-black text-white tracking-tight">RelayPost</h2>
                <p className="text-white/50 text-[12px] mt-1">{fmtDate(digest.published_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/10 text-white/70 px-2.5 py-1.5 rounded-full border border-white/15">
                  <Sparkles size={9} /> {digest.week_label}
                </span>
                <p className="text-[10px] text-white/30 mt-2">{digest.article_count} articles · {digest.news_count} news</p>
              </div>
            </div>
          </div>
        </div>

        {/* Executive summary */}
        {digest.executive_summary && (
          <div className="bg-white dark:bg-slate-900 px-6 py-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">Executive Summary</p>
            <p className="text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed italic border-l-2 border-violet-500 pl-4">
              {digest.executive_summary}
            </p>
          </div>
        )}
      </div>

      {/* ── Stat of the week ── */}
      {statNum && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Stat of the Week</p>
          <p className="text-4xl font-black text-white tracking-tight mb-1">{statNum}</p>
          {statDesc && <p className="text-sm text-white/70 leading-relaxed">{statDesc}</p>}
        </div>
      )}

      {/* ── Top Articles ── */}
      {digest.top_articles?.length > 0 && (
        <Section label="Top Articles This Week" icon={<BookOpen size={14} />}>
          <div className="space-y-4">
            {digest.top_articles.map((a, i) => (
              <Link
                key={a.id}
                href={`/article/${a.slug}`}
                className="flex gap-4 group"
              >
                <div className="shrink-0 w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[11px] font-black flex items-center justify-center mt-0.5">
                  {i + 1}
                </div>
                <div className="flex gap-3 flex-1 min-w-0">
                  {a.hero_image && (
                    <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                      <Image src={a.hero_image} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">{a.category}</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{a.title}</p>
                    {a.excerpt && <p className="text-[12px] text-slate-400 line-clamp-1 mt-0.5">{a.excerpt}</p>}
                    {a.views_count > 0 && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <Eye size={9} /> {a.views_count.toLocaleString()} reads
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* ── Major Themes + Emerging Signals (side by side on desktop) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.length > 0 && (
          <Section label="Major Themes" icon={<TrendingUp size={14} />} bg="bg-slate-50 dark:bg-slate-900">
            <ul className="space-y-3">
              {themes.map((t, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {signals.length > 0 && (
          <Section label="Emerging Signals" icon={<BarChart2 size={14} />} bg="bg-emerald-50/50 dark:bg-emerald-950/20">
            <ul className="space-y-3">
              {signals.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 shrink-0 mt-0.5">▸</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {/* ── Top News ── */}
      {digest.top_news?.length > 0 && (
        <Section label="Top News" icon={<Radio size={14} />}>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {digest.top_news.map((n, i) => (
              <li key={n.id ?? i}>
                <Link href={`/news/${n.slug}`} className="flex items-center gap-3 py-3 group">
                  {n.image_url ? (
                    <img src={n.image_url} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-800" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Newspaper size={16} className="text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">{n.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {n.source && <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{n.source}</span>}
                      {n.category && <span className="text-[10px] text-slate-400">· {n.category}</span>}
                      {n.published_at && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={8} />{fmtShort(n.published_at)}</span>}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── What to Watch ── */}
      {digest.what_to_watch?.length > 0 && (
        <Section label="What to Watch Next Week" icon={<AlertTriangle size={14} />} bg="bg-amber-50/50 dark:bg-amber-950/20">
          <div className="space-y-4">
            {digest.what_to_watch.map((w, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-black ${i === 0 ? "bg-indigo-600" : i === 1 ? "bg-violet-600" : "bg-sky-500"}`}>{i + 1}</div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5">{w.title}</p>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{w.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Editor's Note ── */}
      {digest.editors_note && (
        <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800/30 px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">Editor's Note</p>
          <p className="text-sm text-violet-900 dark:text-violet-200 italic leading-relaxed">"{digest.editors_note}"</p>
        </div>
      )}

      {/* ── Email preference ── */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-5 py-4 border border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          {optedOut ? <BellOff size={16} className="text-slate-400" /> : <Bell size={16} className="text-indigo-500" />}
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Weekly email</p>
            <p className="text-[11px] text-slate-400">{optedOut ? "You're unsubscribed" : "Delivered every Sunday"}</p>
          </div>
        </div>
        <button
          onClick={onToggleOptOut}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors ${optedOut ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600"}`}
        >
          {optedOut ? "Re-subscribe" : "Unsubscribe"}
        </button>
      </div>
    </div>
  );
}


// ── Main profile page ────────────────────────────────────────────────────────

export default function ProfileDashboard() {
  const [user, setUser]               = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [digest, setDigest]           = useState<Digest | null>(null);
  const [pastDigests, setPastDigests] = useState<PastDigest[]>([]);
  const [digestLoading, setDigestLoading] = useState(true);
  const [digestError, setDigestError] = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [optedOut, setOptedOut]       = useState(false);
  const { tier, isLoading: tierLoading } = useTier();

  useEffect(() => {
    const fetchAll = async () => {
      const token = Cookies.get("access_token") || localStorage.getItem("auth_token");
      if (!token) { window.location.href = "/login"; return; }

      try {
        const res = await fetch(`${AUTH_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { localStorage.removeItem("auth_token"); Cookies.remove("access_token"); window.location.href = "/login"; return; }
        setUser(await res.json());

        try {
          const cr = await fetch(`${API_BASE}/profile/contributions`, { headers: { Authorization: `Bearer ${token}` } });
          if (cr.ok) setContributions(await cr.json());
        } catch {}
      } catch {}
      finally { setIsLoading(false); }
    };
    fetchAll();
  }, []);

  const fetchDigest = useCallback(async () => {
    if (tier === "free" || tierLoading) return;
    const token = Cookies.get("access_token") || localStorage.getItem("auth_token");
    if (!token) return;

    setDigestLoading(true);
    setDigestError(null);
    try {
      const [digestRes, listRes, optRes] = await Promise.allSettled([
        fetch(`${API_BASE}/digest/latest`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/digest?limit=8`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/digest/opt-out/status`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (digestRes.status === "fulfilled" && digestRes.value.ok) {
        setDigest(await digestRes.value.json());
      } else if (digestRes.status === "fulfilled" && digestRes.value.status === 404) {
        setDigestError("no_digest");
      }

      if (listRes.status === "fulfilled" && listRes.value.ok) {
        setPastDigests(await listRes.value.json());
      }

      if (optRes.status === "fulfilled" && optRes.value.ok) {
        const od = await optRes.value.json();
        setOptedOut(od.opted_out);
      }
    } catch {}
    finally { setDigestLoading(false); }
  }, [tier, tierLoading]);

  useEffect(() => { fetchDigest(); }, [fetchDigest]);

  const handleToggleOptOut = async () => {
    const token = Cookies.get("access_token") || localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const method = optedOut ? "DELETE" : "POST";
      await fetch(`${API_BASE}/digest/opt-out`, { method, headers: { Authorization: `Bearer ${token}` } });
      setOptedOut(o => !o);
    } catch {}
  };

  const getInitials = (name: string) => name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "?";
  const fmtDate = (ds: string) => ds ? new Date(ds).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">

      {/* ── Profile Card ── */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-center shadow-sm relative border border-slate-100 dark:border-slate-800">
        <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verified
        </div>
        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl mb-4 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-3xl font-black">
          {getInitials(user?.display_name || user?.email)}
        </div>
        <h2 className="text-2xl font-bold dark:text-white">{user?.display_name || user?.email?.split("@")[0]}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Member since {fmtDate(user?.created_at) || "Recently"}</p>
        <div className="flex gap-4 mt-6 w-full max-w-xs">
          <button className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors text-sm">
            <Edit2 size={14} /> Edit Profile
          </button>
          <button className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors text-sm">
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* ── Weekly Digest ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500" /> Weekly Digest
          </h3>
          {pastDigests.length > 1 && digest && (
            <span className="text-[11px] text-slate-400">{pastDigests.length} issues available</span>
          )}
        </div>

        {/* Free user — locked */}
        {!tierLoading && tier === "free" && <DigestLocked />}

        {/* Plus/Pro — loading */}
        {!tierLoading && tier !== "free" && digestLoading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw size={22} className="animate-spin text-indigo-400" />
              <p className="text-sm">Loading your digest…</p>
            </div>
          </div>
        )}

        {/* Plus/Pro — no digest yet */}
        {!tierLoading && tier !== "free" && !digestLoading && digestError === "no_digest" && (
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
            <Newspaper size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-1">First digest coming Sunday</h4>
            <p className="text-sm text-slate-400">Your weekly intelligence brief is published every Sunday at 6:00 AM. Check back then!</p>
          </div>
        )}

        {/* Plus/Pro — digest ready */}
        {!tierLoading && tier !== "free" && !digestLoading && digest && (
          <DigestViewer digest={digest} optedOut={optedOut} onToggleOptOut={handleToggleOptOut} />
        )}

        {/* Past digests navigation */}
        {!tierLoading && tier !== "free" && pastDigests.length > 1 && (
          <div className="mt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Past Issues</p>
            <div className="flex flex-wrap gap-2">
              {pastDigests.map(pd => (
                <button
                  key={pd.week_label}
                  onClick={async () => {
                    const token = Cookies.get("access_token") || localStorage.getItem("auth_token");
                    if (!token) return;
                    setDigestLoading(true);
                    try {
                      const res = await fetch(`${API_BASE}/digest/${pd.week_label}`, { headers: { Authorization: `Bearer ${token}` } });
                      if (res.ok) setDigest(await res.json());
                    } finally { setDigestLoading(false); }
                  }}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-colors ${digest?.week_label === pd.week_label ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
                >
                  {pd.week_label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Contributions ── */}
      <div className="mt-2">
        <h3 className="text-lg font-black dark:text-white mb-4">My Contributions</h3>
        {contributions.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400"><FileText size={24} /></div>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">You haven't submitted any contributions yet.</p>
            <Link href="/contribute" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-lg">Submit Analysis</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {contributions.map((c: any) => (
              <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">{c.content_type}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(c.created_at)}</span>
                  </div>
                  <h4 className="font-bold dark:text-white">{c.header}</h4>
                </div>
                <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${c.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : c.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
