"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  BookmarkMinus, Newspaper, BookOpen, Sparkles, CheckSquare, 
  Square, Zap, X, Loader2, Lock, Folder, FolderPlus, FolderOpen,Plus
} from "lucide-react";
import Cookies from "js-cookie";
import { API_BASE } from "@/lib/config";
import { UsageMeter } from "@/components/UsageMeter";
import { useTier } from "@/components/TierProvider";
import toast from "react-hot-toast";
import { getCategorySlugForArticle } from "@/lib/categoryMapping";

type Tab = "articles" | "news";

interface Bookmark {
  id: string;
  source_type: string;
  saved_at: string;
  title?: string;
  slug?: string;
  hero_image?: string;
  excerpt?: string;
  article_id?: string;
  news_article_id?: number;
  source?: string;
  folder_id?: string;
  notes?: string;
}

interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  is_smart: boolean;
}

interface BookmarkResponse {
  bookmarks: Bookmark[];
  total: number;
  bookmark_limit: number;
  tier: string;
}

interface SynthesisResult {
  synthesis: string;
  articles_used: number;
}

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  // Folder Creation Modal State
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");
  
  // Organize Bookmark Folder Assignment state
  const [organizeModalOpen, setOrganizeModalOpen] = useState(false);
  const [targetBookmarkId, setTargetBookmarkId] = useState<string | null>(null);

  const [total, setTotal] = useState(0);
  const [bookmarkLimit, setBookmarkLimit] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const { tier } = useTier();

  // Synthesis state
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [synthesisOpen, setSynthesisOpen] = useState(false);
  const [focusQuestion, setFocusQuestion] = useState("");
  const [synthLoading, setSynthLoading] = useState(false);
  const [synthResult, setSynthResult] = useState<SynthesisResult | null>(null);
  const [synthError, setSynthError] = useState<string | null>(null);

  // Fetch Folders (Plus/Pro)
  const fetchFolders = useCallback(async () => {
    if (tier === "free") return;
    const token = Cookies.get("access_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/bookmarks/folders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFolders(await res.json());
      }
    } catch (e) {
      console.error("Failed to load bookmark folders", e);
    }
  }, [tier]);

  const fetchBookmarks = useCallback(async () => {
    const token = Cookies.get("access_token");
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        source_type: activeTab === "articles" ? "article" : "news", 
        limit: "100" 
      });
      if (selectedFolderId) {
        params.append("folder_id", selectedFolderId);
      }
      
      const res = await fetch(`${API_BASE}/bookmarks?${params}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) {
        const data: BookmarkResponse = await res.json();
        setBookmarks(data.bookmarks);
        setTotal(data.total);
        setBookmarkLimit(data.bookmark_limit);
      }
    } catch (err) { 
      console.error("Failed to fetch bookmarks", err); 
    } finally { 
      setLoading(false); 
    }
  }, [activeTab, selectedFolderId]);

  useEffect(() => { 
    fetchBookmarks(); 
  }, [fetchBookmarks]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Clear selection when tab changes
  useEffect(() => { 
    setSelected(new Set()); 
    setSelectMode(false); 
    setSynthResult(null); 
    setSynthError(null); 
  }, [activeTab]);

  const handleRemove = async (bookmarkId: string) => {
    const token = Cookies.get("access_token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/bookmarks/${bookmarkId}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      setSelected(prev => { 
        const n = new Set(prev); 
        n.delete(bookmarkId); 
        return n; 
      });
      toast.success("Bookmark removed.", { id: `remove-${bookmarkId}` });
    } catch (err) { 
      console.error("Failed to remove bookmark", err); 
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const token = Cookies.get("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/bookmarks/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newFolderName, description: newFolderDesc })
      });
      if (res.ok) {
        toast.success("Folder created successfully!", { id: "create-folder-success" });
        setNewFolderName("");
        setNewFolderDesc("");
        setFolderModalOpen(false);
        fetchFolders();
      } else {
        toast.error("Failed to create folder.");
      }
    } catch (e) {
      toast.error("Error creating folder.");
    }
  };

  const handleAssignFolder = async (folderId: string | null) => {
    if (!targetBookmarkId) return;
    const token = Cookies.get("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/bookmarks/${targetBookmarkId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ folder_id: folderId })
      });
      if (res.ok) {
        toast.success(folderId ? "Bookmark moved to folder!" : "Bookmark removed from folder", { id: "assign-folder-success" });
        setOrganizeModalOpen(false);
        setTargetBookmarkId(null);
        fetchBookmarks();
      } else {
        toast.error("Failed to move bookmark.");
      }
    } catch (e) {
      toast.error("Error moving bookmark.");
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSynthesize = async () => {
    const token = Cookies.get("access_token");
    if (!token || selected.size < 2) return;
    setSynthLoading(true);
    setSynthError(null);
    setSynthResult(null);

    const selectedBms = bookmarks.filter(b => selected.has(b.id));
    const articleIds = selectedBms.filter(b => b.article_id).map(b => b.article_id!);
    const newsIds = selectedBms.filter(b => b.news_article_id).map(b => b.news_article_id!);

    try {
      const res = await fetch(`${API_BASE}/premium/ai/cross-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ article_ids: articleIds, news_ids: newsIds, focus_question: focusQuestion || undefined }),
      });
      if (res.status === 403) {
        const d = await res.json();
        setSynthError(d.detail?.message || "Pro tier required for Cross-Article Synthesis.");
      } else if (!res.ok) {
        throw new Error("Synthesis failed");
      } else {
        setSynthResult(await res.json());
      }
    } catch {
      setSynthError("Failed to generate synthesis. Please try again.");
    } finally {
      setSynthLoading(false);
    }
  };

  const usedBookmarks = total;
  const showLimitWarning = bookmarkLimit > 0 && usedBookmarks >= bookmarkLimit * 0.8;
  const canSynthesize = selected.size >= 2 && activeTab === "articles" && tier === "pro";

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold dark:text-white mb-1">Saved</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Articles and news you've bookmarked.</p>
        </div>
        {bookmarkLimit > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">{usedBookmarks} / {bookmarkLimit} used</p>
            <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${showLimitWarning ? "bg-amber-500" : "bg-indigo-500"}`}
                style={{ width: `${Math.min(100, (usedBookmarks / bookmarkLimit) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Folders Row (Plus/Pro) */}
      {tier !== "free" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 shrink-0 select-none">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              !selectedFolderId
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500"
            }`}
          >
            <FolderOpen size={12} /> All Bookmarks
          </button>
          
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                selectedFolderId === f.id
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500"
              }`}
            >
              <Folder size={12} /> {f.name}
            </button>
          ))}

          <button
            onClick={() => setFolderModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            <Plus size={11} /> Create Folder
          </button>
        </div>
      )}

      {/* Tabs + actions bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start">
          {(["articles", "news"] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
              {tab === "articles" ? <BookOpen size={14} /> : <Newspaper size={14} />}
              {tab === "articles" ? "Articles" : "News"}
            </button>
          ))}
        </div>

        {/* Cross-article synthesis — articles tab only */}
        {activeTab === "articles" && bookmarks.length >= 2 && (
          <div className="flex items-center gap-2">
            {selectMode && selected.size > 0 && (
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{selected.size} selected</span>
            )}
            <button
              onClick={() => { setSelectMode(s => !s); setSelected(new Set()); setSynthResult(null); setSynthError(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${selectMode ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}>
              <CheckSquare size={13} /> {selectMode ? "Cancel" : "Select"}
            </button>
            {selectMode && selected.size >= 2 && (
              <button
                onClick={() => setSynthesisOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm">
                {tier !== "pro" ? <Lock size={12} className="text-white/80" /> : <Zap size={13} />}
                Synthesize {selected.size}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Folder Creation Modal */}
      {folderModalOpen && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setFolderModalOpen(false); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <form onSubmit={handleCreateFolder} className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderPlus size={18} className="text-indigo-600 dark:text-indigo-400" /> New Bookmark Folder
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Folder Name</label>
              <input
                type="text"
                required
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="e.g., Tech Insights"
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Description (Optional)</label>
              <textarea
                value={newFolderDesc}
                onChange={e => setNewFolderDesc(e.target.value)}
                placeholder="Folder details..."
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-white placeholder:text-slate-400 h-20"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setFolderModalOpen(false)} 
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Organize Modal */}
      {organizeModalOpen && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setOrganizeModalOpen(false); }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen size={18} className="text-indigo-600 dark:text-indigo-400" /> Move Bookmark to Folder
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => handleAssignFolder(null)}
                className="w-full text-left text-xs font-semibold px-4 py-3 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/20 rounded-xl transition-colors text-slate-700 dark:text-slate-300"
              >
                No Folder (General List)
              </button>
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleAssignFolder(f.id)}
                  className="w-full text-left text-xs font-semibold px-4 py-3 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/20 rounded-xl transition-colors text-slate-700 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  {f.name}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setOrganizeModalOpen(false)} 
              className="w-full py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Synthesis Modal */}
      {synthesisOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSynthesisOpen(false); }}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap size={18} className="text-indigo-600 dark:text-indigo-400" /> Cross-Article Synthesis
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Analysing {selected.size} saved articles</p>
              </div>
              <button onClick={() => { setSynthesisOpen(false); setSynthResult(null); setSynthError(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Pro-tier note */}
              {tier !== "pro" && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30">
                  <Sparkles size={14} className="text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-violet-800 dark:text-violet-300">
                    Cross-Article Synthesis is a <strong>Pro feature</strong>. <Link href="/pricing" className="underline underline-offset-2 font-semibold">Upgrade to Pro</Link> for unlimited reports.
                  </p>
                </div>
              )}

              {/* Selected articles */}
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {bookmarks.filter(b => selected.has(b.id)).map(b => (
                  <div key={b.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                    <BookOpen size={12} className="text-slate-400 shrink-0" />
                    <span className="line-clamp-1 flex-1">{b.title || "Untitled"}</span>
                  </div>
                ))}
              </div>

              {/* Focus question */}
              {!synthResult && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    Focus Question <span className="normal-case font-normal">(optional)</span>
                    {tier !== "pro" && <Lock size={10} className="text-slate-400" />}
                  </label>
                  <input
                    type="text"
                    disabled={tier !== "pro"}
                    value={focusQuestion}
                    onChange={e => setFocusQuestion(e.target.value)}
                    placeholder={tier !== "pro" ? "Upgrade to Pro to query focus questions" : "e.g. What are the common supply chain themes?"}
                    className={`w-full text-sm border rounded-2xl px-4 py-3 outline-none transition-all ${
                      tier !== "pro" 
                        ? "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed" 
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/40 dark:text-white placeholder:text-slate-400"
                    }`}
                  />
                </div>
              )}

              {/* Error */}
              {synthError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl px-4 py-3">
                  {synthError}
                  {synthError.includes("Pro") && (
                    <Link href="/pricing" className="ml-2 font-bold underline underline-offset-2">Upgrade →</Link>
                  )}
                </div>
              )}

              {/* Result */}
              {synthResult && (
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-4 max-h-64 overflow-y-auto">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2">Synthesis — {synthResult.articles_used} articles</p>
                  {synthResult.synthesis.split("\n").map((line, i) => {
                    const t = line.trim();
                    if (!t) return null;
                    if (t.startsWith("## ")) return <p key={i} className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mt-3 mb-1">{t.slice(3)}</p>;
                    if (t.startsWith("- ") || t.startsWith("• ")) return <p key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300"><span className="text-indigo-400 shrink-0">•</span>{t.slice(2)}</p>;
                    return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{t}</p>;
                  })}
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              {!synthResult ? (
                <button
                  onClick={handleSynthesize}
                  disabled={synthLoading || selected.size < 2 || tier !== "pro"}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-colors"
                >
                  {synthLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Generating…</>
                  ) : (
                    <>
                      {tier !== "pro" ? <Lock size={14} className="mr-0.5" /> : <Zap size={16} />}
                      Generate Synthesis
                    </>
                  )}
                </button>
              ) : (
                <button onClick={() => { setSynthResult(null); setSynthError(null); setFocusQuestion(""); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-colors">
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bookmark grid */}
      <div className="min-h-[600px] w-full flex flex-col">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse h-[280px]" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              {activeTab === "articles" ? <BookOpen size={24} className="text-slate-400" /> : <Newspaper size={24} className="text-slate-400" />}
            </div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">No {activeTab === "articles" ? "articles" : "news"} saved yet</h3>
            <p className="text-sm text-slate-400">{activeTab === "articles" ? "Click the bookmark icon on any article to save it here." : "Click the bookmark icon on any news article to save it here."}</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarks.map(bm => (
            <div
              key={bm.id}
              onClick={() => selectMode && toggleSelect(bm.id)}
              className={`group relative flex flex-col bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border transition-all duration-300 ${selectMode ? "cursor-pointer" : ""} ${
                selected.has(bm.id)
                  ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-400/30"
                  : "border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800/50"
              }`}
            >
              {/* Select checkbox overlay */}
              {selectMode && (
                <div className="absolute top-3 left-3 z-20">
                  {selected.has(bm.id)
                    ? <CheckSquare size={20} className="text-indigo-600 drop-shadow" />
                    : <Square size={20} className="text-white/80 drop-shadow" />}
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                {bm.hero_image ? (
                  <Image src={bm.hero_image} alt={bm.title || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {bm.source_type === "news" ? <Newspaper size={28} className="text-slate-300" /> : <BookOpen size={28} className="text-slate-300" />}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Remove button */}
              {!selectMode && (
                <button onClick={e => { e.stopPropagation(); handleRemove(bm.id); }}
                  className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 text-slate-600 hover:text-rose-500 dark:text-slate-300 p-1.5 rounded-full shadow-sm transition-colors z-10" title="Remove">
                  <BookmarkMinus size={16} />
                </button>
              )}

              {/* Folder organize trigger (Plus/Pro) */}
              {!selectMode && tier !== "free" && (
                <button 
                  onClick={e => { e.stopPropagation(); setTargetBookmarkId(bm.id); setOrganizeModalOpen(true); }}
                  className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 dark:text-slate-300 px-2 py-1 rounded-lg shadow-sm transition-all z-10 flex items-center gap-1 text-[10px] font-bold"
                  title="Move to Folder"
                >
                  <Folder size={12} /> Move
                </button>
              )}

              {/* Source badge */}
              {bm.source_type === "news" && bm.source && (
                <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-black/50 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{bm.source}</span>
              )}

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <Link
                  href={bm.source_type === "article" ? `/article/${bm.slug}` : bm.news_article_id ? `/news/${bm.news_article_id}` : "#"}
                  onClick={e => selectMode && e.preventDefault()}
                  className="font-semibold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-3 leading-snug text-sm mb-2"
                >
                  {bm.title || "Untitled"}
                </Link>
                {bm.notes && <p className="text-xs text-slate-400 italic line-clamp-2 mb-2">{bm.notes}</p>}
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{bm.source_type === "news" ? "News" : "Article"}</span>
                  <span className="text-[10px] text-slate-400">{bm.saved_at ? new Date(bm.saved_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Synthesis hint bar — floating when in select mode */}
      {selectMode && bookmarks.length >= 2 && (
        <div className="sticky bottom-4 left-0 right-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">
            <Zap size={15} className="text-indigo-400 dark:text-indigo-600 shrink-0" />
            {selected.size < 2 ? "Select at least 2 articles to synthesize" : `${selected.size} selected — ready to synthesize`}
            {selected.size >= 2 && (
              <button onClick={() => setSynthesisOpen(true)} className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center gap-1">
                {tier !== "pro" ? <Lock size={10} /> : null}
                Synthesize →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
