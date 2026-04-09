"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Search, Upload, Image as ImageIcon, 
  Check, Loader2, Globe, HardDrive 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  content_type: string;
  size: number;
}

export default function MediaLibrary({ onSelect, onClose }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<"uploads" | "stock">("uploads");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploads, setUploads] = useState<MediaItem[]>([]);
  const [stockImages, setStockImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (activeTab === "uploads") {
      fetchUploads();
    }
  }, [activeTab]);

  const fetchUploads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8001/admin/media");
      if (res.ok) {
        setUploads(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch uploads", e);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUnsplash = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    try {
      const Cookies = (await import("js-cookie")).default;
      const token = Cookies.get("access_token");
      
      const res = await fetch(`http://localhost:8001/admin/media/stock/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setStockImages(await res.json());
      } else {
        const error = await res.json();
        alert(error.detail || "Stock search failed");
      }
    } catch (e) {
      console.error("Stock search failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // In real app, get token from cookies
      const res = await fetch("http://localhost:8001/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchUploads();
      }
    } catch (e) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <ImageIcon size={20} />
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Asset Intelligence</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RelayPost Media Library</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-6">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab("uploads")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'uploads' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <HardDrive size={14} /> Library
              </button>
              <button 
                onClick={() => setActiveTab("stock")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stock' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Globe size={14} /> Unsplash
              </button>
           </div>

           <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={activeTab === 'uploads' ? "Search your assets..." : "Search high-def stock photos..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'stock' ? searchUnsplash() : null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
           </div>

           {activeTab === 'uploads' && (
             <label className="cursor-pointer bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload New
                <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
             </label>
           )}
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
               <Loader2 size={48} className="animate-spin text-indigo-200" />
               <p className="text-[10px] font-black uppercase tracking-widest">Querying Datastores...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {activeTab === 'uploads' ? (
                uploads.length > 0 ? (
                  uploads.map((item) => (
                    <motion.div 
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => onSelect(item.url)}
                      className="group cursor-pointer aspect-square bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100 shadow-sm hover:shadow-xl transition-all"
                    >
                       <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Check className="text-white" size={32} />
                       </div>
                       <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                          <p className="text-[8px] font-black uppercase text-slate-800 truncate">{item.filename}</p>
                       </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <ImageIcon size={48} className="mx-auto text-slate-100" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No assets found in your library</p>
                  </div>
                )
              ) : (
                stockImages.length > 0 ? (
                  stockImages.map((img) => (
                    <motion.div 
                      key={img.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => onSelect(img.urls.regular)}
                      className="group cursor-pointer aspect-square bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100 shadow-sm"
                    >
                       <img src={img.urls.regular} alt={img.alt_description} className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Check className="text-white" size={32} />
                       </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <Globe size={48} className="mx-auto text-slate-100" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter a query to search Unsplash</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Asset Delivery Protocol v2.4 Active</p>
        </div>
      </motion.div>
    </div>
  );
}
