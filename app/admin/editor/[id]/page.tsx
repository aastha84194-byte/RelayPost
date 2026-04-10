"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Save, Eye, Layout, Type, Image as ImageIcon, Trash2, GripVertical, 
  ChevronDown, ChevronUp, Search, Settings as SettingsIcon, ShieldAlert,
  BarChart3, Table as TableIcon, Quote as QuoteIcon, Minus, Palette, 
  Type as TypeIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Edit3,
  List as ListIcon, ListOrdered, Video, Globe, Code as CodeIcon,
  MessageSquare, ExternalLink, HelpCircle, Upload, Plus, Link as LinkIcon, Sparkles, CheckCircle2, Zap, Calendar
} from "lucide-react";
import { Article, ContentBlock, SectionType, TemplateType, ThemeType, ArticleStatus } from "@/lib/types";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import MediaLibrary from "../../components/MediaLibrary";
import FloatingToolbar from "../../components/FloatingToolbar";
import BlockPicker from "../../components/BlockPicker";
import toast from "react-hot-toast";

const FONT_OPTIONS = ["Inter", "Merriweather", "JetBrains Mono", "Outfit"];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

export default function AdvancedEditorPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  const isNew = articleId === "new";

  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [isPreview, setIsPreview] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  const [article, setArticle] = useState<Article>({
    title: "",
    slug: "",
    template_type: "standard",
    content_blocks: [],
    status: "draft",
    visibility: "public",
    is_featured: false,
    secondary_keywords: [],
    key_takeaways: [],
    faq_section: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<{tag: string, score: number}[]>([]);
  const [linkSuggestions, setLinkSuggestions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [showMediaLibrary, setShowMediaLibrary] = useState<{open: boolean, blockId?: string}>({open: false});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/categories`);
        if (res.ok) setCategories(await res.json());
      } catch (e) { console.error("Categories fetch failed", e); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isNew) {
      import("js-cookie").then((Cookies) => {
        const token = Cookies.default.get("access_token");
        fetch(`${API_BASE}/admin/articles/${articleId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : Promise.reject("Not authorized"))
          .then(data => { if(data.id) setArticle(data); })
          .catch(err => console.error("Could not fetch article", err));
      });
    }
  }, [articleId, isNew]);

  const handleSave = async (publishStatus: ArticleStatus = article.status) => {
    setIsSaving(true);
    try {
      const Cookies = (await import("js-cookie")).default;
      const token = Cookies.get("access_token");

      if (!token) {
        alert("Authentication required.");
        setIsSaving(false);
        return;
      }

      const payload = { ...article, status: publishStatus };
      if(isNew && !payload.id) delete payload.id;
      
      const method = isNew ? "POST" : "PUT";
      const url = isNew ? `${API_BASE}/admin/articles` : `${API_BASE}/admin/articles/${article.id}`;
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
        if (isNew) router.replace(`/admin/editor/${data.id}`);
        toast.success(`Article saved as ${publishStatus}!`);
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving article");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSuggestions = async () => {
     try {
       const Cookies = (await import("js-cookie")).default;
       const token = Cookies.get("access_token");
       
       const payload = {
          title: article.title,
          excerpt: article.excerpt,
          content_snippet: article.content_blocks.slice(0, 3).map(b => b.content).join(" ")
       };

       const res = await fetch(`${API_BASE}/admin/articles/suggest-keywords`, {
          method: "POST",
          headers: { 
             "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
       });
       if(res.ok) setKeywordSuggestions(await res.json());

       if(!isNew) {
          const resLinks = await fetch(`${API_BASE}/admin/articles/${article.id}/suggest-links`, {
             headers: { "Authorization": `Bearer ${token}` }
          });
          if(resLinks.ok) setLinkSuggestions(await resLinks.json());
       }
     } catch(e) { console.error(e); }
  };

  const uploadMedia = async (file: File, blockId?: string) => {
     const formData = new FormData();
     formData.append("file", file);
     
     try {
       const Cookies = (await import("js-cookie")).default;
       const token = Cookies.get("access_token");
       
       const res = await fetch(`${API_BASE}/admin/media/upload`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
       });
       
       if(res.ok) {
          const data = await res.json();
          if(blockId) {
             updateBlock(blockId, { content: data.url });
          } else {
             setArticle({...article, hero_image: data.url});
          }
          toast.success("Media uploaded to secure storage!");
       } else {
          toast.error("Upload failed");
       }
     } catch(e) { toast.error("Upload failed"); }
  };

  const addBlock = (type: SectionType) => {
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === "paragraph" ? "Start typing..." : type === "heading" ? "New Heading" : type === "code_block" ? "// Your code here" : "",
      styles: { align: "left", fontFamily: "Inter" },
      metadata: type === "heading" ? { level: 2 } : 
                type === "graph" ? { chartType: "bar", chartData: [{name: 'Jan', value: 400}] } :
                type === "bullet_list" || type === "numbered_list" ? { items: ["List item 1"] } :
                type === "callout" ? { calloutType: "info", icon: "💡", title: "Note" } :
                type === "faq_block" ? { questions: [{question: "Q?", answer: "A!"}] } :
                type === "cta_block" ? { title: "CTA Title", buttonText: "Click Here" } :
                type === "youtube_embed" ? { videoId: "" } :
                type === "code_block" ? { language: "typescript" } :
                type === "table" ? { tableData: { headers: ["Header 1"], rows: [["Cell 1"]] } } : {}
    };
    setArticle(prev => ({ ...prev, content_blocks: [...prev.content_blocks, newBlock] }));
    setActiveBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setArticle(prev => ({
      ...prev,
      content_blocks: prev.content_blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const removeBlock = (id: string) => {
    setArticle(prev => ({
      ...prev,
      content_blocks: prev.content_blocks.filter(b => b.id !== id)
    }));
  };

  const handleAIRewrite = async (intent: string) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;

    const text = sel.toString();
    const range = sel.getRangeAt(0);
    
    try {
      const Cookies = (await import("js-cookie")).default;
      const token = Cookies.get("access_token");
      
      const res = await fetch("http://localhost:8001/admin/ai/rewrite", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text, intent })
      });
      
      if(res.ok) {
        const data = await res.json();
        // Replace selection with rewritten text
        range.deleteContents();
        range.insertNode(document.createTextNode(data.rewritten));
        
        // Find the parent contenteditable to trigger an update to state
        let parent = range.commonAncestorContainer as HTMLElement;
        while(parent && !parent.getAttribute?.('contenteditable')) {
          parent = parent.parentElement as HTMLElement;
        }
        if(parent && parent.dataset.blockId) {
          updateBlock(parent.dataset.blockId, { content: parent.innerHTML });
        }
      }
    } catch(e) { console.error("AI Rewrite failed", e); }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans relative">
      <FloatingToolbar 
        onFormat={(cmd, val) => document.execCommand(cmd, false, val)} 
        onAIRewrite={handleAIRewrite}
      />
      
      <AnimatePresence>
        {showMediaLibrary.open && (
           <MediaLibrary 
             onClose={() => setShowMediaLibrary({open: false})}
             onSelect={(url) => {
                if(showMediaLibrary.blockId) updateBlock(showMediaLibrary.blockId, { content: url });
                else setArticle({...article, hero_image: url});
                setShowMediaLibrary({open: false});
             }}
           />
        )}
      </AnimatePresence>

      {/* Editor Sidebar */}
      <div className={`w-[480px] bg-white border-r border-slate-200 flex flex-col shadow-2xl z-20 flex-shrink-0 transition-all ${isPreview ? '-ml-[480px]' : 'ml-0'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Edit3 size={20} />
             </div>
             <div>
                <h1 className="text-lg font-black text-slate-800 leading-tight tracking-tight">Post Builder</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v2.0 Advanced CMS</p>
             </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              {isSaving ? "..." : "Draft"}
            </button>
            <button 
              onClick={() => handleSave("published")}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 pt-4 gap-8">
          {[
            { id: 'content', label: 'Blocks', icon: Layout },
            { id: 'seo', label: 'SEO & AI', icon: Search },
            { id: 'settings', label: 'Config', icon: SettingsIcon }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 pb-32">
          
          {activeTab === "content" && (
            <div className="space-y-8">
              {/* Basic Fields */}
              <div className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block group-hover:text-indigo-500 transition-colors">Internal Title</label>
                  <input 
                    type="text" 
                    placeholder="Article Headline"
                    value={article.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setArticle({...article, title: val, slug: article.slug === "" || article.slug === article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ? slug : article.slug });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subtitle / Tagline</label>
                  <textarea 
                    value={article.subtitle || ""}
                    onChange={(e) => setArticle({...article, subtitle: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all min-h-[80px]"
                  />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Hero Visual URL</label>
                   <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={article.hero_image || ""}
                        onChange={(e) => setArticle({...article, hero_image: e.target.value})}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all"
                      />
                      <button 
                        onClick={() => setShowMediaLibrary({open: true})}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                      >
                         <ImageIcon size={16} />
                      </button>
                   </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />
              
              {/* Dynamic Blocks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Story Canvas</h3>
                   <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{article.content_blocks.length} Blocks</span>
                </div>
                
                <Reorder.Group axis="y" values={article.content_blocks} onReorder={(newOrder) => setArticle({...article, content_blocks: newOrder})} className="space-y-4">
                  {article.content_blocks.map((block) => (
                    <Reorder.Item 
                      key={block.id} 
                      value={block}
                      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${activeBlockId === block.id ? 'border-indigo-500 ring-4 ring-indigo-500/5 shadow-2xl scale-[1.02]' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
                    >
                      {/* Block Header */}
                      <div 
                        className={`flex items-center p-3 gap-3 cursor-pointer relative group ${activeBlockId === block.id ? 'bg-indigo-50/30' : 'bg-slate-50/50'}`}
                        onClick={() => setActiveBlockId(activeBlockId === block.id ? null : block.id)}
                      >
                        <div className="cursor-grab text-slate-300 hover:text-indigo-500 transition-colors">
                          <GripVertical size={16} />
                        </div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeBlockId === block.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                           {block.type === 'heading' ? <Type size={14} /> : 
                            block.type === 'image' ? <ImageIcon size={14} /> :
                            block.type === 'graph' ? <BarChart3 size={14} /> :
                            block.type === 'table' ? <TableIcon size={14} /> : 
                            block.type === 'divider' ? <Minus size={14} /> : <QuoteIcon size={14} />}
                        </div>
                        <div className="flex-1 truncate">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{block.type}</p>
                           <p className="text-xs text-slate-800 font-bold truncate">
                             {typeof block.content === 'string' ? block.content : `${block.type} Data Object`}
                           </p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Block Editor Content */}
                      <AnimatePresence>
                        {activeBlockId === block.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white"
                          >
                            <div className="p-5 border-t border-slate-100 space-y-6">
                              {/* Main Input */}
                              <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Block Configuration</label>
                                {block.type === 'paragraph' || block.type === 'quote' ? (
                                   <div 
                                     contentEditable
                                     suppressContentEditableWarning
                                     data-block-id={block.id}
                                     onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })}
                                     dangerouslySetInnerHTML={{ __html: block.content }}
                                     className={`w-full text-sm border-none bg-slate-50 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-100 outline-none transition-all font-medium min-h-[100px] ${block.type === 'quote' ? 'border-l-4 border-indigo-500 italic' : ''}`}
                                   />
                                ) : block.type === 'heading' ? (
                                   <div 
                                     contentEditable
                                     suppressContentEditableWarning
                                     data-block-id={block.id}
                                     onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })}
                                     dangerouslySetInnerHTML={{ __html: block.content }}
                                     className="w-full text-sm font-bold border-none bg-slate-50 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-100 outline-none transition-all"
                                   />
                                ) : block.type === 'image' ? (
                                   <div className="space-y-4">
                                      <div className="relative w-full aspect-video bg-slate-50 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center group/img">
                                         {block.content ? (
                                            <>
                                               <img src={block.content} className="w-full h-full object-cover" />
                                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                  <label className="cursor-pointer bg-white text-indigo-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                     Change Image
                                                     <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0], block.id)} />
                                                  </label>
                                               </div>
                                            </>
                                         ) : (
                                            <div className="text-center space-y-2">
                                               <ImageIcon size={32} className="text-slate-200 mx-auto" />
                                               <label className="cursor-pointer text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline block">
                                                  Upload to Secure DB
                                                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadMedia(e.target.files[0], block.id)} />
                                               </label>
                                            </div>
                                         )}
                                      </div>
                                      <input 
                                         type="text" 
                                         placeholder="Or paste external URL..."
                                         value={block.content}
                                         onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                         className="w-full text-[10px] font-mono bg-slate-50 border border-slate-200 rounded-lg p-2"
                                      />
                                   </div>
                                ) : block.type === 'bullet_list' || block.type === 'numbered_list' ? (
                                   <div className="space-y-3">
                                      {(block.metadata?.items || []).map((item: string, i: number) => (
                                         <div key={i} className="flex gap-2 group/item">
                                            <div className="w-6 h-8 flex items-center justify-center text-slate-300 font-black text-xs">{i+1}.</div>
                                            <input 
                                               type="text" 
                                               value={item} 
                                               onChange={(e) => {
                                                  const newItems = [...(block.metadata!.items as string[])];
                                                  newItems[i] = e.target.value;
                                                  updateBlock(block.id, { metadata: { ...block.metadata, items: newItems } });
                                               }}
                                               className="flex-1 bg-slate-50 border-none rounded-xl p-2.5 text-xs font-medium focus:bg-slate-100 transition-colors"
                                            />
                                            <button onClick={() => {
                                               const newItems = (block.metadata!.items as string[]).filter((_, idx) => idx !== i);
                                               updateBlock(block.id, { metadata: { ...block.metadata, items: newItems } });
                                            }} className="opacity-0 group-hover/item:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                         </div>
                                      ))}
                                      <button 
                                         onClick={() => updateBlock(block.id, { metadata: { ...block.metadata, items: [...(block.metadata?.items || []), ""] } })}
                                         className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all mt-2"
                                      >
                                         <Plus size={14} /> Add New Item
                                      </button>
                                   </div>
                                ) : block.type === 'code_block' ? (
                                   <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                         <select 
                                            value={block.metadata?.language || 'typescript'} 
                                            onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, language: e.target.value } })}
                                            className="bg-slate-900 text-indigo-400 text-[10px] font-black py-1.5 px-3 rounded-lg border-none ring-1 ring-white/10"
                                         >
                                            <option value="typescript">Typescript</option>
                                            <option value="python">Python</option>
                                            <option value="sql">PostgreSQL</option>
                                            <option value="json">JSON</option>
                                         </select>
                                      </div>
                                      <textarea 
                                         rows={10}
                                         value={block.content}
                                         onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                         className="w-full bg-slate-950 text-indigo-300 font-mono text-[11px] p-6 rounded-2xl border-none outline-none ring-1 ring-white/5 shadow-inner"
                                         placeholder="// Enter high-fidelity code here..."
                                      />
                                   </div>
                                ) : block.type === 'youtube_embed' ? (
                                   <div className="space-y-3">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">YouTube Video ID / URL</label>
                                      <div className="flex gap-2">
                                         <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-inner">
                                            <Video size={20} />
                                         </div>
                                         <input 
                                            type="text" 
                                            placeholder="e.g. dQw4w9WgXcQ or full URL"
                                            value={block.metadata?.videoId || ''}
                                            onChange={(e) => {
                                               let val = e.target.value;
                                               if(val.includes('v=')) val = val.split('v=')[1].split('&')[0];
                                               else if(val.includes('youtu.be/')) val = val.split('youtu.be/')[1].split('?')[0];
                                               updateBlock(block.id, { metadata: { ...block.metadata, videoId: val } });
                                            }}
                                            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-500/10 transition-all"
                                         />
                                      </div>
                                   </div>
                                ) : block.type === 'callout' ? (
                                   <div className="space-y-4">
                                      <div className="grid grid-cols-3 gap-4">
                                         <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Type</label>
                                            <select 
                                               value={block.metadata?.calloutType || 'info'}
                                               onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, calloutType: e.target.value } })}
                                               className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] font-black uppercase transition-all"
                                            >
                                               <option value="info">Intelligence</option>
                                               <option value="warning">Critical</option>
                                               <option value="success">Verified</option>
                                            </select>
                                         </div>
                                         <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Emoji Icon</label>
                                            <input 
                                               type="text" 
                                               value={block.metadata?.icon || '💡'} 
                                               onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, icon: e.target.value } })}
                                               className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-sm"
                                            />
                                         </div>
                                         <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Block Title</label>
                                            <input 
                                               type="text" 
                                               value={block.metadata?.title || ''} 
                                               onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, title: e.target.value } })}
                                               className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] font-black"
                                            />
                                         </div>
                                      </div>
                                      <textarea 
                                         rows={3}
                                         value={block.content}
                                         onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                         className="w-full text-xs font-medium bg-slate-50 border border-slate-100 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                         placeholder="Deep insight details..."
                                      />
                                   </div>
                                ) : block.type === 'faq_block' ? (
                                   <div className="space-y-6">
                                      {(block.metadata?.questions || []).map((faq: any, i: number) => (
                                         <div key={i} className="space-y-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm group/faq relative">
                                            <button 
                                               onClick={() => {
                                                  const newFaqs = (block.metadata!.questions as any[]).filter((_, idx) => idx !== i);
                                                  updateBlock(block.id, { metadata: { ...block.metadata, questions: newFaqs } });
                                               }} 
                                               className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover/faq:opacity-100 transition-all"
                                            ><Trash2 size={12} /></button>
                                            <input 
                                               type="text" 
                                               placeholder="Expert Question"
                                               value={faq.question} 
                                               onChange={(e) => {
                                                  const newFqs = [...(block.metadata!.questions as any[])];
                                                  newFqs[i].question = e.target.value;
                                                  updateBlock(block.id, { metadata: { ...block.metadata, questions: newFqs } });
                                               }}
                                               className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-bold"
                                            />
                                            <textarea 
                                               placeholder="Technical Answer"
                                               value={faq.answer} 
                                               onChange={(e) => {
                                                  const newFqs = [...(block.metadata!.questions as any[])];
                                                  newFqs[i].answer = e.target.value;
                                                  updateBlock(block.id, { metadata: { ...block.metadata, questions: newFqs } });
                                               }}
                                               className="w-full bg-slate-50 border-none rounded-lg p-2 text-xs font-medium min-h-[60px]"
                                            />
                                         </div>
                                      ))}
                                      <button 
                                         onClick={() => updateBlock(block.id, { metadata: { ...block.metadata, questions: [...(block.metadata?.questions || []), {question: "", answer: ""}] } })}
                                         className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                      >
                                         <Plus size={14} /> Add Inquiry Entry
                                      </button>
                                   </div>
                                ) : block.type !== 'divider' ? (
                                   <div className="space-y-4">
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Data Schema (JSON)</label>
                                      <textarea 
                                         rows={6}
                                         value={JSON.stringify(block.metadata?.chartData || block.metadata?.tableData || {}, null, 2)}
                                         onChange={(e) => {
                                            try {
                                              const val = JSON.parse(e.target.value);
                                              if(block.type === 'graph') updateBlock(block.id, { metadata: { ...block.metadata, chartData: val } });
                                              if(block.type === 'table') updateBlock(block.id, { metadata: { ...block.metadata, tableData: val } });
                                            } catch(e) {}
                                         }}
                                         className="w-full text-[10px] font-mono border-none bg-slate-900 text-emerald-400 rounded-xl p-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
                                      />
                                   </div>
                                ) : <p className="text-[10px] font-black text-slate-400 italic text-center py-4">Visual Separator Active</p>}
                              </div>

                              {/* Stylings Group */}
                              {block.type !== 'divider' && (
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 mt-4 pt-4">
                                <div>
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Rich Typography</label>
                                   <select 
                                      className="w-full text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                                      value={block.styles?.fontFamily || "Inter"}
                                      onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, fontFamily: e.target.value } })}
                                   >
                                      {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                   </select>
                                </div>
                                {block.type === 'heading' && (
                                   <div>
                                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Header Level</label>
                                      <select 
                                         className="w-full text-[10px] font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
                                         value={block.metadata?.level || 2}
                                         onChange={(e) => updateBlock(block.id, { metadata: { ...block.metadata, level: parseInt(e.target.value) as any } })}
                                      >
                                         {[1,2,3,4,5,6].map(l => <option key={l} value={l}>H{l} Headline</option>)}
                                      </select>
                                   </div>
                                )}
                                <div>
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Text Color (Hex)</label>
                                   <div className="flex gap-2">
                                      <input 
                                        type="color" 
                                        value={block.styles?.color || "#1e293b"}
                                        onChange={(e) => updateBlock(block.id, { styles: { ...block.styles, color: e.target.value } })}
                                        className="w-8 h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                                      />
                                      <input 
                                        type="text" 
                                        value={block.styles?.color || "#1e293b"}
                                        className="flex-1 text-[10px] font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg px-2"
                                        readOnly
                                      />
                                   </div>
                                </div>
                                <div>
                                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Alignment</label>
                                   <div className="flex border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                                      {[
                                        { val: 'left', icon: AlignLeft },
                                        { val: 'center', icon: AlignCenter },
                                        { val: 'right', icon: AlignRight },
                                        { val: 'justify', icon: AlignJustify }
                                      ].map(a => (
                                        <button 
                                          key={a.val}
                                          onClick={() => updateBlock(block.id, { styles: { ...block.styles, align: a.val as any } })}
                                          className={`flex-1 py-2 flex items-center justify-center transition-colors ${block.styles?.align === a.val ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                          <a.icon size={14} />
                                        </button>
                                      ))}
                                   </div>
                                </div>
                              </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>

                {/* Add Block Toolbar */}
                <BlockPicker onAdd={addBlock} />
              </div>
            </div>
          )}

          {/* SEO & AI TAB */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 flex items-start gap-4 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
                 <Sparkles className="mt-1 shrink-0" size={24} />
                 <div className="relative z-10">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-1">Intelligence Insights</h4>
                    <p className="text-[11px] font-medium text-white/80 leading-relaxed mb-4">Click below to analyze your content for optimal targeting.</p>
                    <button 
                       onClick={fetchSuggestions}
                       className="px-6 py-2 bg-white text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                    >
                       Analyze Now
                    </button>
                 </div>
              </div>

              {/* Keyword Intelligence */}
              <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-6 shadow-sm">
                 <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Keyword Discovery</h5>
                    <Search size={14} className="text-slate-300" />
                 </div>
                 
                 <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Secondary Keywords</label>
                       
                       {/* Manual Entry */}
                       <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Add tag..."
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (newKeyword.trim() && !article.secondary_keywords?.includes(newKeyword.trim())) {
                                  setArticle({...article, secondary_keywords: [...(article.secondary_keywords || []), newKeyword.trim()]});
                                  setNewKeyword("");
                                }
                              }
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                          />
                          <button 
                            onClick={() => {
                              if (newKeyword.trim() && !article.secondary_keywords?.includes(newKeyword.trim())) {
                                setArticle({...article, secondary_keywords: [...(article.secondary_keywords || []), newKeyword.trim()]});
                                setNewKeyword("");
                              }
                            }}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                          >
                             <Plus size={16} />
                          </button>
                       </div>

                       <div className="flex flex-wrap gap-2">
                          {article.secondary_keywords?.map((kw, idx) => (
                             <div key={idx} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-[10px] font-black group">
                                {kw}
                                <button 
                                  onClick={() => setArticle({...article, secondary_keywords: article.secondary_keywords?.filter(k => k !== kw)})}
                                  className="hover:text-red-500"
                                >
                                   <Trash2 size={10} />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>

                 {keywordSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                       {keywordSuggestions.map((kw, i) => (
                          <button 
                             key={i} 
                             onClick={() => {
                                if(!article.secondary_keywords?.includes(kw.tag)) {
                                   setArticle({...article, secondary_keywords: [...(article.secondary_keywords || []), kw.tag]});
                                }
                             }}
                             className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${article.secondary_keywords?.includes(kw.tag) ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                          >
                             {kw.tag}
                             {article.secondary_keywords?.includes(kw.tag) ? <CheckCircle2 size={10} /> : <Plus size={10} />}
                          </button>
                       ))}
                    </div>
                 )}
              </div>

              {/* Internal Linking */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 text-white shadow-2xl">
                 <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Link Persistence</h5>
                    <LinkIcon size={14} className="text-slate-700" />
                 </div>
                 
                 {linkSuggestions.length > 0 ? (
                    <div className="space-y-3">
                       {linkSuggestions.map((link, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                             <div>
                                <p className="text-xs font-bold text-white mb-0.5">{link.title}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">/articles/{link.slug}</p>
                             </div>
                             <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400" />
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="py-8 text-center space-y-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Run analysis to find candidates</p>
                    </div>
                 )}
              </div>
            </div>
          )}

          {/* CONFIG TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                 <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4">System Routing</h5>
                 <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Permalink Slug</label>
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                         <span className="text-[10px] font-bold text-slate-400">/{article.category_name?.toLowerCase().replace(/ /g, '-') || 'article'}/</span>
                         <input 
                           type="text" 
                           value={article.slug}
                           onChange={(e) => setArticle({...article, slug: e.target.value})}
                           className="flex-1 bg-transparent border-none text-[10px] font-black p-0 outline-none"
                         />
                      </div>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Category Assignment</label>
                       <div className="space-y-2">
                          {/* Searchable/Createable Category Selector */}
                          <div className="relative group">
                             <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             <input 
                               type="text" 
                               placeholder="Search or type new category..."
                               value={article.category_name || categories.find(c => c.id === article.category_id)?.name || ""}
                               onChange={(e) => {
                                 const val = e.target.value;
                                 const existing = categories.find(c => c.name.toLowerCase() === val.toLowerCase());
                                 if (existing) {
                                   setArticle({...article, category_id: existing.id, category_name: existing.name});
                                 } else {
                                   setArticle({...article, category_id: undefined, category_name: val});
                                 }
                               }}
                               className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                             />
                             
                             {/* Suggestions Overlay */}
                             <div className="hidden group-focus-within:block absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-40 overflow-y-auto">
                                {categories.filter(c => c.name.toLowerCase().includes((article.category_name || "").toLowerCase())).map(c => (
                                   <button 
                                     key={c.id}
                                     onClick={() => setArticle({...article, category_id: c.id, category_name: c.name})}
                                     className="w-full text-left px-4 py-2 text-[10px] font-black hover:bg-slate-50 uppercase tracking-tight text-slate-600"
                                   >
                                      {c.name}
                                   </button>
                                ))}
                                {article.category_name && !categories.some(c => c.name.toLowerCase() === article.category_name?.toLowerCase()) && (
                                   <div className="px-4 py-2 border-t border-slate-100 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-tight">
                                      ✨ Create New: "{article.category_name}"
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Layout Template</label>
                      <select 
                        value={article.template_type}
                        onChange={(e) => setArticle({...article, template_type: e.target.value as TemplateType})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none mb-6"
                      >
                        <option value="standard">Intelligence Report</option>
                        <option value="news">Breaking Dispatch</option>
                        <option value="tech">Technical Deep-Dive</option>
                        <option value="seo_blog">Longform Analysis</option>
                      </select>

                       <div className="grid grid-cols-3 gap-2 mb-6">
                         {[
                           { id: 'standard', label: 'Standard', color: 'bg-slate-100' },
                           { id: 'intelligence', label: 'Pro', color: 'bg-indigo-900' },
                           { id: 'sports', label: 'High Energy', color: 'bg-orange-500' }
                         ].map(t => (
                           <button 
                             key={t.id}
                             onClick={() => setArticle({...article, theme: t.id as any})}
                             className={`p-2 rounded-lg border-2 transition-all text-center ${article.theme === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}
                           >
                             <div className={`h-8 w-full ${t.color} rounded mb-1 shadow-sm`} />
                             <span className="text-[8px] font-black uppercase text-slate-500">{t.label}</span>
                           </button>
                         ))}
                      </div>

                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Strategic Scheduling</label>
                      <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                         <Calendar size={20} className="text-indigo-600" />
                         <div className="flex-1">
                            <input 
                              type="datetime-local" 
                              value={article.scheduled_at ? new Date(article.scheduled_at).toISOString().slice(0, 16) : ""}
                              onChange={(e) => setArticle({...article, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                              className="w-full bg-transparent border-none outline-none text-xs font-black text-indigo-900"
                            />
                            <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Status will auto-switch to 'Scheduled'</p>
                         </div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Preview Canvas */}
      <div className={`flex-1 relative bg-slate-100 flex flex-col justify-start transition-all duration-500 overflow-hidden`}>
        
        {/* Minimal Preview Frame */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 ${article.theme === 'intelligence' ? 'bg-slate-950' : article.theme === 'sports' ? 'bg-orange-50' : 'bg-slate-100'}`}>
            <div className={`mx-auto max-w-[960px] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-3xl min-h-full overflow-hidden transition-all duration-300 ${isPreview ? 'max-w-[1250px]' : ''} ${article.theme === 'intelligence' ? 'ring-1 ring-white/10 dark-theme' : ''}`}>
               
               {/* Context Header */}
               <div className="bg-slate-900 text-white flex items-center justify-between px-8 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Live Render Stream</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsPreview(!isPreview)}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      <Eye size={12} /> {isPreview ? 'Editor View' : 'Full Immersion'}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                       <Layout size={14} className="text-slate-400" />
                    </div>
                  </div>
               </div>
               
               {/* Preview Content */}
               <div className="p-12 md:p-24 bg-white min-h-[1200px]">
                  {/* Category Chip */}
                  <div className="mb-6">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-indigo-200">
                      Intelligence Report
                    </span>
                  </div>

                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.05] mb-8 font-sans">
                    {article.title || "Ready to write?"}
                  </h1>
                  
                  {article.subtitle && (
                    <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-2xl">
                      {article.subtitle}
                    </p>
                  )}

                  {article.hero_image && (
                     <div className="w-full aspect-video rounded-3xl mb-16 overflow-hidden bg-slate-100 shadow-2xl scale-[1.02]">
                       <img src={article.hero_image} alt="Hero" className="w-full h-full object-cover" />
                     </div>
                  )}

                  <div className="space-y-12">
                    {article.content_blocks.map((block) => {
                      const s = {
                        fontFamily: block.styles?.fontFamily,
                        color: block.styles?.color,
                        textAlign: block.styles?.align as any,
                        fontSize: block.styles?.fontSize,
                        fontWeight: block.styles?.fontWeight
                      };

                      if (block.type === 'paragraph') return <p key={block.id} className="text-lg text-slate-600 leading-relaxed font-medium" style={s}>{block.content}</p>;
                      if (block.type === 'heading') return React.createElement(`h${block.metadata?.level || 2}`, { 
                        key: block.id, 
                        className: `font-black text-slate-900 tracking-tight ${block.metadata?.level === 1 ? 'text-5xl' : block.metadata?.level === 2 ? 'text-3xl' : 'text-xl'}`,
                        style: s
                      }, block.content);
                      if (block.type === 'quote') return (
                        <blockquote key={block.id} className="border-l-[6px] border-indigo-600 pl-8 italic text-2xl text-slate-700 font-serif my-12" style={s}>
                          "{block.content}"
                        </blockquote>
                      );
                      if (block.type === 'image') return (
                        <div key={block.id} className="my-12 rounded-[2rem] overflow-hidden shadow-2xl">
                          {block.content ? (
                            <img src={block.content} className="w-full h-auto" />
                          ) : (
                            <div className="bg-slate-100 py-24 flex flex-col items-center justify-center text-slate-300">
                               <ImageIcon size={48} className="mb-4" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Media Payload</span>
                            </div>
                          )}
                        </div>
                      );
                      if (block.type === 'graph') {
                        return (
                         <div key={block.id} className="my-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                               <BarChart3 size={32} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interactive Component Block</p>
                               <p className="text-sm font-black text-slate-800">Dynamic {block.metadata?.chartType || 'Bar'} Visualization</p>
                            </div>
                            <div className="py-2 px-4 bg-white rounded-full border border-slate-100 shadow-sm">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{block.metadata?.chartData?.length || 0} Data Nodes Parsed</p>
                            </div>
                         </div>
                        );
                      }
                      if (block.type === 'table') {
                        return (
                          <div key={block.id} className="my-8 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 p-8 flex flex-col items-center gap-4">
                             <TableIcon size={32} className="text-indigo-400" />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tabular Data Component Active</p>
                             <div className="flex gap-2">
                                {block.metadata?.tableData?.headers?.map((h: string, i: number) => (
                                   <span key={i} className="text-[9px] font-black px-2 py-0.5 bg-white border border-slate-200 rounded uppercase text-slate-500">{h}</span>
                                ))}
                             </div>
                          </div>
                        );
                      }
                      if (block.type === 'bullet_list') return (
                        <ul key={block.id} className="space-y-2 my-6 list-disc pl-6 leading-relaxed">
                          {block.metadata?.items?.map((item: string, i: number) => (
                            <li key={i} className="text-slate-600" style={s}>{item}</li>
                          ))}
                        </ul>
                      );
                      if (block.type === 'numbered_list') return (
                        <ol key={block.id} className="space-y-2 my-6 list-decimal pl-6 leading-relaxed">
                          {block.metadata?.items?.map((item: string, i: number) => (
                            <li key={i} className="text-slate-600" style={s}>{item}</li>
                          ))}
                        </ol>
                      );
                      if (block.type === 'code_block') return (
                        <div key={block.id} className="my-8 rounded-xl overflow-hidden bg-slate-900 p-6 font-mono text-sm text-slate-300">
                          <div className="flex justify-between items-center mb-4 text-[10px] text-slate-500 uppercase tracking-widest">
                            <span>{block.metadata?.language || 'plaintext'}</span>
                          </div>
                          <pre className="overflow-x-auto"><code>{block.content}</code></pre>
                        </div>
                      );
                      if (block.type === 'callout') return (
                        <div key={block.id} className="my-8 p-6 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl flex gap-4">
                           <div className="text-2xl">{block.metadata?.icon || '💡'}</div>
                           <div>
                              <p className="font-bold text-slate-900 mb-1">{block.metadata?.title}</p>
                              <p className="text-slate-600 leading-relaxed">{block.content}</p>
                           </div>
                        </div>
                      );
                      if (block.type === 'faq_block') return (
                        <div key={block.id} className="my-12 space-y-4">
                           {block.metadata?.questions?.map((q: any, i: number) => (
                             <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                               <p className="font-black text-slate-900 mb-2">Q: {q.question}</p>
                               <p className="text-slate-600">A: {q.answer}</p>
                             </div>
                           ))}
                        </div>
                      );
                      if (block.type === 'cta_block') return (
                        <div key={block.id} className="my-12 p-12 bg-indigo-600 rounded-[2.5rem] text-center text-white shadow-2xl">
                           <h3 className="text-3xl font-black mb-4">{block.metadata?.title}</h3>
                           <p className="mb-8 text-indigo-100 font-medium">{block.content}</p>
                           <button className="px-8 py-3 bg-white text-indigo-600 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all">
                              {block.metadata?.buttonText}
                           </button>
                        </div>
                      );
                      if (block.type === 'youtube_embed') return (
                        <div key={block.id} className="my-12 aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-200 flex items-center justify-center">
                           <Video size={48} className="text-slate-400" />
                           <p className="absolute text-[10px] font-black text-slate-500 uppercase mt-20">YouTube Embed Frame</p>
                        </div>
                      );
                      if (block.type === 'divider') return <div key={block.id} className="h-0.5 bg-slate-100 w-1/4 mx-auto my-24 rounded-full" />;
                      return null;
                    })}
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
