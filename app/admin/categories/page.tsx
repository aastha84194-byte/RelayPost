"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  FolderTree, Plus, Search, 
  Edit2, Trash2, X, Check,
  Activity, Tag, Image, Upload,
  Loader2
} from "lucide-react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { API_BASE } from "@/lib/config";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newCat, setNewCat] = useState({ name: "", slug: "", description: "", image_url: "" });
  const [editCat, setEditCat] = useState({ name: "", slug: "", description: "", image_url: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = Cookies.get("access_token");
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/media/upload`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        // Backend returns absolute URL with MEDIA_BASE_URL
        const fullUrl = data.url;
        if (isEdit) {
          setEditCat(prev => ({ ...prev, image_url: fullUrl }));
        } else {
          setNewCat(prev => ({ ...prev, image_url: fullUrl }));
        }
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Upload failed");
      }
    } catch (err) {
      toast.error("Upload connection error");
    } finally {
      setIsUploading(false);
    }
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
        setNewCat({ name: "", slug: "", description: "", image_url: "" });
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
           className="w-full text-slate-950 pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                     <div className="space-y-6">
                        <div>
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Category Name</label>
                           <input 
                             type="text" 
                             value={newCat.name}
                             onChange={(e) => setNewCat({...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})}
                             className="w-full px-4 py-3 text-slate-950 bg-white border border-indigo-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">URL Slug</label>
                           <input 
                             type="text" 
                             value={newCat.slug}
                             onChange={(e) => setNewCat({...newCat, slug: e.target.value})}
                             className="w-full px-4 py-3 text-slate-950 bg-white border border-indigo-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                           />
                        </div>
                     </div>
                     
                     <div>
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Visual Assets</label>
                        <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 bg-white flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden group">
                           {newCat.image_url ? (
                              <>
                                <img src={newCat.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <button onClick={() => setNewCat({...newCat, image_url: ""})} title="Remove image" className="bg-white text-indigo-600 p-2 rounded-full shadow-lg"><Trash2 size={16}/></button>
                                </div>
                              </>
                           ) : (
                              <>
                                 <div className="text-indigo-300 mb-4"><Image size={32} /></div>
                                 <button 
                                   onClick={() => fileInputRef.current?.click()}
                                   disabled={isUploading}
                                   className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all"
                                 >
                                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    {isUploading ? "Uploading..." : "Upload Media"}
                                 </button>
                                 <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, false)} className="hidden" accept="image/*" />
                              </>
                           )}
                        </div>
                        <input 
                          type="text"
                          placeholder="Or paste external URL..."
                          value={newCat.image_url}
                          onChange={(e) => setNewCat({...newCat, image_url: e.target.value})}
                          className="w-full mt-3 px-3 py-2 text-slate-950 bg-indigo-50/50 border border-indigo-100 rounded-lg text-[10px] font-bold outline-none"
                        />
                     </div>
                  </div>
                  <div className="mb-6">
                     <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">Description (Optional)</label>
                     <textarea 
                        value={newCat.description}
                        onChange={(e) => setNewCat({...newCat, description: e.target.value})}
                        className="w-full px-4 py-3 text-slate-950 bg-white border border-indigo-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[80px]"
                     />
                  </div>
                  <div className="flex justify-end gap-3 border-t border-indigo-100 pt-6">
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
               className={`bg-white border rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 transition-all hover:shadow-xl hover:border-indigo-100 ${editingId === cat.id ? 'border-indigo-600 shadow-xl' : 'border-slate-100 shadow-lg shadow-slate-100/50'}`}
            >
               <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
                  {cat.image_url ? (
                     <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                     <Tag size={24} />
                  )}
               </div>

               {editingId === cat.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Title</label>
                        <input 
                           type="text" 
                           value={editCat.name} 
                           onChange={(e) => setEditCat({...editCat, name: e.target.value})}
                           className="w-full px-4 py-2 text-slate-950 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-sans outline-none focus:ring-2 focus:ring-indigo-500/10"
                        />
                     </div>
                     <div>
                        <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Slug</label>
                        <input 
                           type="text" 
                           value={editCat.slug} 
                           onChange={(e) => setEditCat({...editCat, slug: e.target.value})}
                           className="w-full px-4 py-2 text-slate-950 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-sans outline-none focus:ring-2 focus:ring-indigo-500/10"
                        />
                     </div>
                     <div className="md:col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase mb-1 block">Image URL</label>
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              value={editCat.image_url} 
                              onChange={(e) => setEditCat({...editCat, image_url: e.target.value})}
                              placeholder="Media ID or external URL"
                              className="flex-1 px-4 py-2 text-slate-950 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-sans outline-none focus:ring-2 focus:ring-indigo-500/10"
                           />
                           <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="px-3 bg-slate-100 text-slate-500 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                           >
                             <Upload size={14} />
                           </button>
                           <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, true)} className="hidden" accept="image/*" />
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="flex-1 min-w-0">
                     <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none mb-2">{cat.name}</h3>
                     <div className="flex gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/{cat.slug}</span>
                        {cat.description && (
                           <span className="text-[10px] font-medium text-slate-400 line-clamp-1 italic">— {cat.description}</span>
                        )}
                     </div>
                  </div>
               )}

               <div className="flex gap-2 shrink-0">
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
                             setEditCat({ name: cat.name, slug: cat.slug, description: cat.description || "", image_url: cat.image_url || "" });
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
