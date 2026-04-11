"use client";

import React, { useEffect, useState } from "react";
import { 
  FileText, Edit2, Trash2, 
  ExternalLink, Search, Plus, 
  Filter, Calendar, Eye, 
  CheckCircle2, Clock, XCircle, MoreVertical, Layout
} from "lucide-react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Article } from "@/lib/types";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";


export default function ArticlesManagement() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showPlacementModal, setShowPlacementModal] = useState(false);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${API_BASE}/admin/articles`, {
         headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setArticles(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch articles", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/public/categories`);
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
  };

  const updateArticle = async (id: string, updates: any) => {
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchArticles();
    } catch (e) { alert("Update failed"); }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Confirm article archival? This will move it to trash but not delete permanently.")) return;
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchArticles();
    } catch (e) {
      alert("Failed to archive article");
    }
  };

  const updatePlacement = async (id: string, section: string, order: number) => {
     const token = Cookies.get("access_token");
     try {
       const res = await fetch(`${API_BASE}/admin/articles/${id}/placement`, {
         method: "PUT",
         headers: { 
           "Authorization": `Bearer ${token}`,
           "Content-Type": "application/json"
         },
         body: JSON.stringify({ homepage_section: section, section_order: order })
       });
       if(res.ok) {
         setShowPlacementModal(false);
         fetchArticles();
       }
     } catch(e) { alert("Placement update failed"); }
  };

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'published': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'draft': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'scheduled': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'pending_review': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'archived': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'published': return <CheckCircle2 size={12} />;
      case 'draft': return <Edit2 size={12} />;
      case 'scheduled': return <Clock size={12} />;
      case 'pending_review': return <Eye size={12} />;
      case 'archived': return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                <FileText size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Content Intelligence</h1>
           </div>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manage repository articles, scheduling and distribution</p>
        </div>
        <Link 
          href="/admin/editor/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={16} /> Create New Dispatch
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-8">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by title, slug or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
            />
         </div>
         <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl text-sm font-bold shadow-sm">
            <Filter size={16} className="ml-2 text-slate-400" />
            {[
              { id: 'all', label: 'All' },
              { id: 'published', label: 'Live' },
              { id: 'draft', label: 'Drafts' },
              { id: 'scheduled', label: 'Queue' },
              { id: 'archived', label: 'Trash' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === f.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f.label}
              </button>
            ))}
         </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-300 gap-4">
           <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Querying Content Clusters...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Details</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Command</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredArticles.map((article) => (
                    <motion.tr 
                      key={article.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4 max-w-sm">
                             <div className="w-16 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-50 shadow-inner flex-shrink-0">
                                {article.hero_image ? <img src={article.hero_image} className="w-full h-full object-cover" /> : <FileText size={20} className="mx-auto mt-3 text-slate-300" />}
                             </div>
                             <div className="truncate">
                                <p className="text-sm font-black text-slate-800 tracking-tight truncate hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => router.push(`/admin/editor/${article.id}`)}>{article.title}</p>
                                <p className="text-[10px] font-mono text-slate-400 truncate">/{article.category_name?.toLowerCase()}/{article.slug}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6 font-bold text-[10px] uppercase tracking-widest text-slate-500">
                          <select 
                             value={article.category_id || ""}
                             onChange={(e) => updateArticle(article.id!, { category_id: e.target.value })}
                             className="bg-transparent border-none outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                          >
                             <option value="">Uncategorized</option>
                             {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                       </td>
                       <td className="px-6 py-6">
                           <div className="relative group">
                              <select 
                                 value={article.status}
                                 onChange={(e) => updateArticle(article.id!, { status: e.target.value })}
                                 className={`appearance-none inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border cursor-pointer outline-none transition-all ${getStatusStyle(article.status)}`}
                              >
                                 <option value="draft">Draft</option>
                                 <option value="pending_review">Pending</option>
                                 <option value="scheduled">Scheduled</option>
                                 <option value="published">Published</option>
                                 <option value="archived">Archived</option>
                              </select>
                           </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-800">{new Date(article.published_at || article.created_at!).toLocaleDateString()}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(article.published_at || article.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                             <button 
                               onClick={() => { setSelectedArticle(article); setShowPlacementModal(true); }}
                               className="p-2.5 hover:bg-white hover:shadow-lg rounded-xl transition-all text-slate-400 hover:text-indigo-600 group relative"
                             >
                                <Layout size={16} />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Homepage Placement</span>
                             </button>
                             <Link href={`/admin/editor/${article.id}`} className="p-2.5 bg-slate-100 hover:bg-white hover:shadow-lg rounded-xl transition-all text-slate-500 hover:text-indigo-600">
                                <Edit2 size={16} />
                             </Link>
                             <button 
                               onClick={() => deleteArticle(article.id!)}
                               className="p-2.5 hover:bg-white hover:shadow-lg rounded-xl transition-all text-slate-400 hover:text-red-500"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                     </motion.tr>
                  ))}
                  {filteredArticles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                         <FileText size={48} className="mx-auto text-slate-100 mb-4" />
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No intelligence dipatches found</p>
                      </td>
                    </tr>
                  )}
              </tbody>
           </table>
        </div>
      )}

      {/* Placement Modal */}
      <AnimatePresence>
        {showPlacementModal && selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPlacementModal(false)} />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl border border-slate-100"
             >
                <div className="mb-8">
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase mb-2">Node Distribution</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic placement for {selectedArticle.title}</p>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Homepage Section</label>
                      <select 
                        defaultValue={selectedArticle.homepage_section || ""}
                        id="section-select"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      >
                         <option value="">None (Hidden from Homepage)</option>
                         <option value="Hero">Spotlight (Hero)</option>
                         <option value="TrendingNow">Trending Now</option>
                         <option value="ExpertAnalysis">Expert Analysis</option>
                         <option value="LatestInsights">Latest Insights</option>
                         <option value="DeepDives">Deep Dives</option>
                      </select>
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Priority Order (0-100)</label>
                      <input 
                        type="number" 
                        id="order-input"
                        defaultValue={selectedArticle.section_order || 0}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                   </div>

                   <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => setShowPlacementModal(false)}
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                      >
                         Cancel
                      </button>
                      <button 
                        onClick={() => {
                           const section = (document.getElementById('section-select') as HTMLSelectElement).value;
                           const order = parseInt((document.getElementById('order-input') as HTMLInputElement).value) || 0;
                           updatePlacement(selectedArticle.id!, section, order);
                        }}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                      >
                         Confirm Deployment
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          {[
            { label: 'Published Articles', val: articles.filter(a => a.status === 'published').length, color: 'text-emerald-500' },
            { label: 'Scheduled Cluster', val: articles.filter(a => a.status === 'scheduled').length, color: 'text-indigo-600' },
            { label: 'Intelligence Drafts', val: articles.filter(a => a.status === 'draft').length, color: 'text-slate-500' },
            { label: 'Trash Buffer', val: articles.filter(a => a.status === 'archived').length, color: 'text-red-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg text-center group hover:scale-105 transition-transform">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
               <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.val.toLocaleString()}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
