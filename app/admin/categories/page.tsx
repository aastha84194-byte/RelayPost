"use client";

import React, { useEffect, useState } from "react";
import { 
  FolderTree, Plus, Search, 
  Edit2, Trash2, X, Check,
  Activity, Tag, FileText
} from "lucide-react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";


interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "" });
  const [editCat, setEditCat] = useState({ name: "", slug: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/public/categories`);
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async () => {
    if (!newCat.name || !newCat.slug) return;
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${API_BASE}/admin/categories`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newCat)
      });
      if (res.ok) {
        setIsAdding(false);
        setNewCat({ name: "", slug: "", description: "" });
        fetchCategories();
        toast.success("Category initialized");
      } else {
        const error = await res.json();
        toast.error(error.detail || "Creation failed");
      }
    } catch (e) { toast.error("Connection failed"); }
  };

  const handleUpdate = async (id: string) => {
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editCat)
      });
      if (res.ok) {
        setEditingId(null);
        fetchCategories();
        toast.success("Category updated");
      } else {
        const error = await res.json();
        toast.error(error.detail || "Update failed");
      }
    } catch (e) { toast.error("Connection failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? Articles in this category will become unassigned.")) return;
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
         fetchCategories();
         toast.success("Category removed");
      }
    } catch (e) { toast.error("Delete failed"); }
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                <FolderTree size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Taxonomy Control</h1>
           </div>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manage article classifications and content hierarchies</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      <div className="relative mb-8">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
         <input 
           type="text" 
           placeholder="Search categories..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
         />
      </div>

      <div className="grid grid-cols-1 gap-4">
         <AnimatePresence>
            {isAdding && (
               <motion.div 
                 initial={{ opacity: 0, y: -20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, y: -20 }}
                 className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 mb-4 border-dashed"
               >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                     <div>
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Category Name</label>
                        <input 
                          type="text" 
                          value={newCat.name}
                          onChange={(e) => setNewCat({...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                          className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">URL Slug</label>
                        <input 
                          type="text" 
                          value={newCat.slug}
                          onChange={(e) => setNewCat({...newCat, slug: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                     </div>
                  </div>
                  <div className="mb-6">
                     <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Description (Optional)</label>
                     <textarea 
                        value={newCat.description}
                        onChange={(e) => setNewCat({...newCat, description: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[100px]"
                     />
                  </div>
                  <div className="flex justify-end gap-3">
                     <button onClick={() => setIsAdding(false)} className="text-[10px] font-black uppercase text-indigo-400 px-6 py-2">Discard</button>
                     <button onClick={handleCreate} className="bg-indigo-600 text-white px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Initialize Category</button>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {filtered.map((cat, i) => (
            <motion.div 
               layout
               key={cat.id}
               className={`bg-white border rounded-[2rem] p-6 flex items-center gap-6 transition-all hover:shadow-xl hover:border-indigo-100 ${editingId === cat.id ? 'border-indigo-600 shadow-xl' : 'border-slate-100 shadow-lg shadow-slate-100/50'}`}
            >
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Tag size={20} />
               </div>

               {editingId === cat.id ? (
                  <div className="flex-1 grid grid-cols-2 gap-4">
                     <input 
                       type="text" 
                       value={editCat.name} 
                       onChange={(e) => setEditCat({...editCat, name: e.target.value})}
                       className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-sans"
                     />
                     <input 
                       type="text" 
                       value={editCat.slug} 
                       onChange={(e) => setEditCat({...editCat, slug: e.target.value})}
                       className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-sans"
                     />
                  </div>
               ) : (
                  <div className="flex-1 min-w-0">
                     <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none mb-1">{cat.name}</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/{cat.slug}</p>
                  </div>
               )}

               <div className="flex gap-2">
                  {editingId === cat.id ? (
                     <>
                        <button onClick={() => handleUpdate(cat.id)} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100"><Check size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="p-3 bg-slate-200 text-slate-600 rounded-xl"><X size={18} /></button>
                     </>
                  ) : (
                     <>
                        <button 
                          onClick={() => {
                             setEditingId(cat.id);
                             setEditCat({ name: cat.name, slug: cat.slug, description: cat.description || "" });
                          }}
                          className="p-3 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                        >
                           <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                           <Trash2 size={18} />
                        </button>
                     </>
                  )}
               </div>
            </motion.div>
         ))}

         {filtered.length === 0 && !isLoading && (
            <div className="py-24 text-center">
               <Activity size={48} className="mx-auto text-slate-100 mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching categories in index</p>
            </div>
         )}
      </div>
    </div>
  );
}
