"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
   Save, Eye, Layout, Type, Image as ImageIcon, Trash2, GripVertical,
   ChevronDown, ChevronUp, Search, Settings as SettingsIcon, ShieldAlert,
   BarChart3, Table as TableIcon, Quote as QuoteIcon, Minus, Palette,
   Type as TypeIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Edit3,
   List as ListIcon, ListOrdered, Video, Globe, Code as CodeIcon,
   MessageSquare, ExternalLink, HelpCircle, Upload, Plus, Link as LinkIcon, Sparkles, CheckCircle2, Zap, Calendar,
   Monitor, Tablet, Smartphone
} from "lucide-react";
import { Article, ContentBlock, SectionType, TemplateType, ThemeType, ArticleStatus } from "@/lib/types";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import MediaLibrary from "../../components/MediaLibrary";
import FloatingToolbar from "../../components/FloatingToolbar";
import BlockPicker from "../../components/BlockPicker";
import toast from "react-hot-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Cell } from 'recharts';

export const BLOCK_TYPES = [
   { id: 'heading', icon: TypeIcon, label: 'Heading', color: 'bg-indigo-500', desc: 'H1-H6 titles' },
   { id: 'paragraph', icon: AlignLeft, label: 'Text', color: 'bg-slate-500', desc: 'Standard content' },
   { id: 'image', icon: ImageIcon, label: 'Media', color: 'bg-emerald-500', desc: 'Images & GIFs' },
   { id: 'quote', icon: QuoteIcon, label: 'Quote', color: 'bg-amber-500', desc: 'Expert insights' },
   { id: 'bullet_list', icon: ListIcon, label: 'List', color: 'bg-blue-500', desc: 'Bulleted info' },
   { id: 'graph', icon: BarChart3, label: 'Visual', color: 'bg-rose-500', desc: 'Data charts' },
   { id: 'table', icon: TableIcon, label: 'Table', color: 'bg-cyan-500', desc: 'Grid data' },
   { id: 'code_block', icon: CodeIcon, label: 'Code', color: 'bg-slate-900', desc: 'Syntax display' },
   { id: 'faq_block', icon: MessageSquare, label: 'FAQ', color: 'bg-violet-500', desc: 'Q&A sections' },
   { id: 'callout', icon: HelpCircle, label: 'Insight', color: 'bg-orange-500', desc: 'Featured notes' },
   { id: 'cta_block', icon: Zap, label: 'Action', color: 'bg-red-500', desc: 'Click buttons' },
   { id: 'youtube_embed', icon: Video, label: 'Video', color: 'bg-pink-500', desc: 'YT/Vimeo frames' },
   { id: 'divider', icon: Minus, label: 'Space', color: 'bg-slate-200', desc: 'Visual separator' }
];

const FONT_OPTIONS = ["Inter", "Merriweather", "JetBrains Mono", "Outfit"];

import { API_BASE } from "@/lib/config";

export default function AdvancedEditorPage() {
   const params = useParams();
   const router = useRouter();
   const articleId = params.id as string;
   const isNew = articleId === "new";

   const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
   const [isPreview, setIsPreview] = useState(false);
   const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
   const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
   const [slashMenu, setSlashMenu] = useState<{ open: boolean, top: number, left: number, filter: string, selectedIndex: number }>({ open: false, top: 0, left: 0, filter: "", selectedIndex: 0 });
   const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

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
   const [keywordSuggestions, setKeywordSuggestions] = useState<{ tag: string, score: number }[]>([]);
   const [linkSuggestions, setLinkSuggestions] = useState<any[]>([]);
   const [categories, setCategories] = useState<any[]>([]);
   const [newKeyword, setNewKeyword] = useState("");
   const [showMediaLibrary, setShowMediaLibrary] = useState<{ open: boolean, blockId?: string }>({ open: false });

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
               .then(data => { if (data.id) setArticle(data); })
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
         if (isNew && !payload.id) delete payload.id;

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
         if (res.ok) setKeywordSuggestions(await res.json());

         if (!isNew) {
            const resLinks = await fetch(`${API_BASE}/admin/articles/${article.id}/suggest-links`, {
               headers: { "Authorization": `Bearer ${token}` }
            });
            if (resLinks.ok) setLinkSuggestions(await resLinks.json());
         }
      } catch (e) { console.error(e); }
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

         if (res.ok) {
            const data = await res.json();
            if (blockId) {
               updateBlock(blockId, { content: data.url });
            } else {
               setArticle({ ...article, hero_image: data.url });
            }
            toast.success("Media uploaded to secure storage!");
         } else {
            toast.error("Upload failed");
         }
      } catch (e) { toast.error("Upload failed"); }
   };

   const addBlock = (type: SectionType, index?: number) => {
      const newBlock: ContentBlock = {
         id: Math.random().toString(36).substr(2, 9),
         type,
         content: type === "paragraph" ? "Start typing..." : type === "heading" ? "New Heading" : type === "code_block" ? "// Your code here" : "",
         styles: { align: "left", fontFamily: "Inter" },
         metadata: type === "heading" ? { level: 2 } :
            type === "graph" ? { chartType: "bar", chartData: [{ name: 'Jan', value: 400 }] } :
               type === "bullet_list" || type === "numbered_list" ? { items: ["List item 1"] } :
                  type === "callout" ? { calloutType: "info", icon: "💡", title: "Note" } :
                     type === "faq_block" ? { questions: [{ question: "Q?", answer: "A!" }] } :
                        type === "cta_block" ? { title: "CTA Title", buttonText: "Click Here" } :
                           type === "youtube_embed" ? { videoId: "" } :
                              type === "code_block" ? { language: "typescript" } :
                                 type === "table" ? { tableData: { headers: ["Header 1"], rows: [["Cell 1"]] } } : {}
      };
      
      setArticle(prev => {
         const newBlocks = [...prev.content_blocks];
         if (typeof index === 'number') {
            newBlocks.splice(index, 0, newBlock);
         } else {
            newBlocks.push(newBlock);
         }
         return { ...prev, content_blocks: newBlocks };
      });
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

   useEffect(() => {
      if (!slashMenu.open) return;

      const handleKey = (e: KeyboardEvent) => {
         if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSlashMenu(prev => ({ ...prev, selectedIndex: Math.min(prev.selectedIndex + 1, BLOCK_TYPES.length - 1) }));
         } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSlashMenu(prev => ({ ...prev, selectedIndex: Math.max(prev.selectedIndex - 1, 0) }));
         } else if (e.key === 'Enter') {
            e.preventDefault();
            const block = BLOCK_TYPES[slashMenu.selectedIndex];
            const activeBlock = article.content_blocks.find(b => b.id === activeBlockId);
            if (activeBlock) {
               const index = article.content_blocks.indexOf(activeBlock);
               updateBlock(activeBlockId!, { content: activeBlock.content.replace('/', '') });
               addBlock(block.id as any, index + 1);
            }
            setSlashMenu(prev => ({ ...prev, open: false }));
         } else if (e.key === 'Escape') {
            setSlashMenu(prev => ({ ...prev, open: false }));
         }
      };

      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
   }, [slashMenu.open, slashMenu.selectedIndex, activeBlockId, article.content_blocks]);

   const handleAIRewrite = async (intent: string) => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      const text = sel.toString();
      const range = sel.getRangeAt(0);

      try {
         const Cookies = (await import("js-cookie")).default;
         const token = Cookies.get("access_token");

         const res = await fetch(`${API_BASE}/admin/ai/rewrite`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text, intent })
         });

         if (res.ok) {
            const data = await res.json();
            // Replace selection with rewritten text
            range.deleteContents();
            range.insertNode(document.createTextNode(data.rewritten));

            // Find the parent contenteditable to trigger an update to state
            let parent = range.commonAncestorContainer as HTMLElement;
            while (parent && !parent.getAttribute?.('contenteditable')) {
               parent = parent.parentElement as HTMLElement;
            }
            if (parent && parent.dataset.blockId) {
               updateBlock(parent.dataset.blockId, { content: parent.innerHTML });
            }
         }
      } catch (e) { console.error("AI Rewrite failed", e); }
   };

   const getEditorialStats = () => {
      const allText = article.content_blocks.map(b => b.content).join(" ").replace(/<[^>]*>?/gm, '');
      const words = allText.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const readTime = Math.ceil(wordCount / 200);
      
      // Simplified Readability (Grade Level)
      const sentences = allText.split(/[.!?]+/).filter(Boolean).length || 1;
      const syllables = words.reduce((acc, word) => acc + (word.match(/[aeiouy]{1,2}/gi)?.length || 1), 0);
      const score = wordCount > 0 ? (206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount)) : 100;
      
      let level = "Beginner";
      if (score < 30) level = "Expert (Academic)";
      else if (score < 60) level = "Advanced (Pro)";
      else if (score < 90) level = "Intermediate (Clear)";
      else level = "Universal (Plain)";

      return { wordCount, readTime, score: Math.max(0, Math.min(100, Math.round(score))), level };
   };

   const stats = getEditorialStats();

   return (
      <div className="flex h-screen bg-[#F1F5F9] overflow-hidden font-sans relative">
         {/* Global System Header */}
         <div className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-2xl border-b border-slate-200 z-[100] flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
               {/* Left side is now empty/minimal to allow more focus */}
            </div>


            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-200/50 mr-4">
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Canvas Tools</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Interactive Suite</span>
               </div>
               <div className="border-l border-slate-200 pl-6 mr-2">
                  <BlockPicker onAdd={addBlock} variant="navbar" />
               </div>
               <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {[
                     { id: 'desktop', icon: Monitor },
                     { id: 'tablet', icon: Tablet },
                     { id: 'mobile', icon: Smartphone }
                  ].map(v => (
                     <button
                        key={v.id}
                        onClick={() => setViewport(v.id as any)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewport === v.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        <v.icon size={14} />
                     </button>
                  ))}
               </div>
               
               <div className="w-[1px] h-8 bg-slate-200" />
               
               <div className="flex items-center gap-4">
                  <button className="text-slate-400 hover:text-slate-900 transition-colors" title="Omni Search">
                     <Search size={18} />
                  </button>
                  <button className="text-slate-400 hover:text-slate-900 transition-colors" title="System Settings">
                     <SettingsIcon size={18} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors">
                     <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">P</div>
                  </div>
               </div>
            </div>
         </div>

         {!isPreview && (
            <FloatingToolbar
               onFormat={(cmd, val) => document.execCommand(cmd, false, val)}
               onAIRewrite={handleAIRewrite}
            />
         )}

         <AnimatePresence>
            {showMediaLibrary.open && (
               <MediaLibrary
                  onClose={() => setShowMediaLibrary({ open: false })}
                  onSelect={(url) => {
                     if (showMediaLibrary.blockId) updateBlock(showMediaLibrary.blockId, { content: url });
                     else setArticle({ ...article, hero_image: url });
                     setShowMediaLibrary({ open: false });
                  }}
               />
            )}
         </AnimatePresence>

         {/* Editor Sidebar Card */}
         <div className={`w-[450px] m-6 mt-32 bg-white rounded-[1.5rem] border border-slate-200/50 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.05)] z-20 flex-shrink-0 transition-all duration-500 overflow-hidden h-[calc(100vh-100px)] ${isPreview ? '-ml-[500px] opacity-0' : 'opacity-100'}`}>

            {/* Control Center Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white relative overflow-hidden">
               {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 opacity-50" /> */}
               
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 relative group">
                     <Edit3 size={20} className="group-hover:rotate-12 transition-transform" />
                     {isSaving && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-bounce flex items-center justify-center">
                           <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </span>
                     )}
                  </div>
                  <div>
                     <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em] mb-1">Editor Alpha</h2>
                     <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-emerald-500' : 'bg-slate-300'} transition-colors`} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                           {isSaving ? 'Intelligence Syncing...' : 'Canvas Persistent'}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-2 relative z-10">
                  <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => handleSave("draft")}
                     disabled={isSaving}
                     className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm"
                  >
                     {isSaving ? "Sync" : "Draft"}
                  </motion.button>
                  <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => handleSave("published")}
                     className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)]"
                  >
                     Publish
                  </motion.button>
               </div>
            </div>

            {/* High-Fidelity Tab Navigation */}
            <div className="flex bg-slate-50 border-b border-slate-100 p-2 gap-1">
               {[
                  { id: 'content', label: 'Canvas', icon: Layout },
                  { id: 'seo', label: 'Intelligence', icon: Search },
                  { id: 'settings', label: 'Workflow', icon: SettingsIcon }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex-1 relative py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group`}
                  >
                     {activeTab === tab.id && (
                        <motion.div 
                           layoutId="activeTabPill"
                           className="absolute inset-0 bg-white shadow-sm border border-slate-200 rounded-xl"
                           transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                     )}
                     <tab.icon size={12} className={`relative z-10 transition-colors ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                     <span className={`relative z-10 text-[9px] font-black uppercase tracking-widest transition-colors ${activeTab === tab.id ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`}>
                        {tab.label}
                     </span>
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
                                 setArticle({ ...article, title: val, slug: article.slug === "" || article.slug === article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ? slug : article.slug });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subtitle / Tagline</label>
                           <textarea
                              value={article.subtitle || ""}
                              onChange={(e) => setArticle({ ...article, subtitle: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all min-h-[80px]"
                           />
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Hero Visual URL</label>
                           <div className="flex gap-2">
                              <input
                                 type="text"
                                 value={article.hero_image || ""}
                                 onChange={(e) => setArticle({ ...article, hero_image: e.target.value })}
                                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all"
                              />
                              <button
                                 onClick={() => setShowMediaLibrary({ open: true })}
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

                        <Reorder.Group axis="y" values={article.content_blocks} onReorder={(newOrder) => setArticle({ ...article, content_blocks: newOrder })} className="space-y-4">
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
                                          {typeof block.content === 'string' ? block.content.replace(/<[^>]*>?/gm, '') : `${block.type} Data Object`}
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
                                                            <div className="w-6 h-8 flex items-center justify-center text-slate-300 font-black text-xs">{i + 1}.</div>
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
                                                               if (val.includes('v=')) val = val.split('v=')[1].split('&')[0];
                                                               else if (val.includes('youtu.be/')) val = val.split('youtu.be/')[1].split('?')[0];
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
                                                         onClick={() => updateBlock(block.id, { metadata: { ...block.metadata, questions: [...(block.metadata?.questions || []), { question: "", answer: "" }] } })}
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
                                                               if (block.type === 'graph') updateBlock(block.id, { metadata: { ...block.metadata, chartData: val } });
                                                               if (block.type === 'table') updateBlock(block.id, { metadata: { ...block.metadata, tableData: val } });
                                                            } catch (e) { }
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
                                                            {[1, 2, 3, 4, 5, 6].map(l => <option key={l} value={l}>H{l} Headline</option>)}
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


                         {/* Sidebar content simplified */}
                      </div>
                   </div>
                )}

               {/* SEO & AI TAB */}
               {activeTab === "seo" && (
                  <div className="space-y-6">
                     {/* Strategic Integrity Meter */}
                     <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                        
                        <div className="relative z-10">
                           <div className="flex items-center justify-between mb-8">
                              <div>
                                 <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-1">Impact Score</h4>
                                 <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tighter">{stats.score}</span>
                                    <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-widest">/ 100</span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Audience</p>
                                 <p className="text-sm font-black text-emerald-400 uppercase tracking-tight">{stats.level}</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Volume</p>
                                 <p className="text-lg font-black">{stats.wordCount.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">WORDS</span></p>
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Pace</p>
                                 <p className="text-lg font-black">{stats.readTime} <span className="text-[10px] text-slate-400 font-bold">MIN READ</span></p>
                              </div>
                           </div>

                           <div className="mt-8 space-y-2">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                                 <span>Optimization Density</span>
                                 <span>{Math.min(100, Math.round(stats.score * 1.2))}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.score}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
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
                                          setArticle({ ...article, secondary_keywords: [...(article.secondary_keywords || []), newKeyword.trim()] });
                                          setNewKeyword("");
                                       }
                                    }
                                 }}
                                 className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
                              />
                              <button
                                 onClick={() => {
                                    if (newKeyword.trim() && !article.secondary_keywords?.includes(newKeyword.trim())) {
                                       setArticle({ ...article, secondary_keywords: [...(article.secondary_keywords || []), newKeyword.trim()] });
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
                                       onClick={() => setArticle({ ...article, secondary_keywords: article.secondary_keywords?.filter(k => k !== kw) })}
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
                                       if (!article.secondary_keywords?.includes(kw.tag)) {
                                          setArticle({ ...article, secondary_keywords: [...(article.secondary_keywords || []), kw.tag] });
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
                                    onChange={(e) => setArticle({ ...article, slug: e.target.value })}
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
                                             setArticle({ ...article, category_id: existing.id, category_name: existing.name });
                                          } else {
                                             setArticle({ ...article, category_id: undefined, category_name: val });
                                          }
                                       }}
                                       className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />

                                    {/* Suggestions Overlay */}
                                    <div className="hidden group-focus-within:block absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-40 overflow-y-auto">
                                       {categories.filter(c => c.name.toLowerCase().includes((article.category_name || "").toLowerCase())).map(c => (
                                          <button
                                             key={c.id}
                                             onClick={() => setArticle({ ...article, category_id: c.id, category_name: c.name })}
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
                                 onChange={(e) => setArticle({ ...article, template_type: e.target.value as TemplateType })}
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
                                       onClick={() => setArticle({ ...article, theme: t.id as any })}
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
                                       onChange={(e) => setArticle({ ...article, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
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

         {/* Interactive Preview Canvas card */}
         <div className={`flex-1 m-6 ml-0 mt-20 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200/50 flex flex-col justify-start transition-all duration-500 overflow-hidden h-[calc(100vh-100px)] relative`}>

            {/* Minimal Preview Frame */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 ${article.theme === 'intelligence' ? 'bg-slate-950' : article.theme === 'sports' ? 'bg-orange-50' : 'bg-slate-100'}`}>
               <div className={`mx-auto bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-3xl min-h-full overflow-hidden transition-all duration-500 ease-in-out ${
                  viewport === 'desktop' ? (isPreview ? 'max-w-[1250px]' : 'max-w-[960px]') : 
                  viewport === 'tablet' ? 'max-w-[768px]' : 
                  'max-w-[420px]'
               } ${article.theme === 'intelligence' ? 'ring-1 ring-white/10 dark-theme' : ''}`}>

                  {/* Premium Context Header */}
                  <div className="bg-slate-950/90 backdrop-blur-xl text-white flex items-center justify-between px-8 py-4 border-b border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                     
                     <div className="flex items-center gap-3 relative z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Render</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-2 border-l border-white/10 hidden md:block">Stream ID: {articleId.slice(0, 8)}</span>
                     </div>
                     
                     <div className="flex items-center gap-4 relative z-10">
                        <motion.button
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => setIsPreview(!isPreview)}
                           className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40"
                        >
                           {isPreview ? <Edit3 size={11} /> : <Eye size={11} />}
                           {isPreview ? 'Back to Editor' : 'Full Immersion'}
                        </motion.button>
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-help group relative">
                           <Layout size={14} className="text-slate-400" />
                           <div className="absolute top-full mt-2 right-0 px-3 py-1.5 bg-slate-900 text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl border border-white/5 pointer-events-none">
                              Structure View
                           </div>
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
                     <div className="space-y-4">
                        {article.content_blocks.map((block, index) => {
                           const s = {
                              fontFamily: block.styles?.fontFamily,
                              color: block.styles?.color,
                              textAlign: block.styles?.align as any,
                              fontSize: block.styles?.fontSize,
                              fontWeight: block.styles?.fontWeight
                           };

                           const renderBlock = () => {
                              switch (block.type) {
                                 case 'paragraph': 
                                    return <p 
                                       className="text-lg text-slate-600 leading-relaxed font-medium outline-none" 
                                       style={s}
                                       contentEditable={!isPreview}
                                       suppressContentEditableWarning
                                       onFocus={() => setActiveBlockId(block.id)}
                                       onInput={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })}
                                       dangerouslySetInnerHTML={{ __html: block.content }}
                                    />;
                                 case 'heading': 
                                    return React.createElement(`h${block.metadata?.level || 2}`, { 
                                       className: `font-black text-slate-900 tracking-tight outline-none ${block.metadata?.level === 1 ? 'text-5xl' : block.metadata?.level === 2 ? 'text-3xl' : 'text-xl'}`, 
                                       style: s,
                                       contentEditable: !isPreview,
                                       suppressContentEditableWarning: true,
                                       onFocus: () => setActiveBlockId(block.id),
                                       onInput: (e: React.FormEvent<HTMLElement>) => {
                                          const target = e.currentTarget as HTMLElement;
                                          const text = target.innerText;
                                          if (text.endsWith('/')) {
                                             const sel = window.getSelection();
                                             if (sel && sel.rangeCount > 0) {
                                                const range = sel.getRangeAt(0);
                                                const rect = range.getBoundingClientRect();
                                                setSlashMenu({ open: true, top: rect.top + window.scrollY + 20, left: rect.left + window.scrollX, filter: "", selectedIndex: 0 });
                                             }
                                          }
                                          updateBlock(block.id, { content: target.innerHTML });
                                       },
                                       dangerouslySetInnerHTML: { __html: block.content }
                                    });
                                 case 'quote': 
                                    return <blockquote 
                                       className="border-l-[6px] border-indigo-600 pl-8 italic text-2xl text-slate-700 font-serif my-6 outline-none" 
                                       style={s}
                                       contentEditable={!isPreview}
                                       suppressContentEditableWarning
                                       onFocus={() => setActiveBlockId(block.id)}
                                       onInput={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })}
                                       dangerouslySetInnerHTML={{ __html: block.content }}
                                    />;
                                 case 'image': return (
                                    <div className="my-6 rounded-[2rem] overflow-hidden shadow-xl">
                                       {block.content ? <img src={block.content} className="w-full h-auto" /> : (
                                          <div className="bg-slate-50 py-16 flex flex-col items-center justify-center text-slate-300">
                                             <ImageIcon size={40} className="mb-4" />
                                             <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Media</span>
                                          </div>
                                       )}
                                    </div>
                                 );
                                 case 'graph':
                                    if (!block.metadata?.chartData) return null;
                                    return (
                                       <div className="my-8 p-6 bg-white rounded-[2rem] border border-slate-100 shadow-lg">
                                          <div className="flex justify-between items-center mb-4">
                                             <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{block.metadata?.caption || 'Data Visualization'}</h4>
                                             <BarChart3 size={14} className="text-indigo-600" />
                                          </div>
                                          <div className="w-full h-[200px]">
                                             <ResponsiveContainer width="100%" height="100%">
                                                {block.metadata.chartType === 'line' ? (
                                                   <LineChart data={block.metadata.chartData}>
                                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                                      <XAxis dataKey="name" hide />
                                                      <Tooltip />
                                                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={false} />
                                                   </LineChart>
                                                ) : (
                                                   <BarChart data={block.metadata.chartData}>
                                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                                      <XAxis dataKey="name" hide />
                                                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                   </BarChart>
                                                )}
                                             </ResponsiveContainer>
                                          </div>
                                       </div>
                                    );
                                 case 'divider': return <div className="h-px bg-slate-100 w-full my-12" />;
                                 default: return <div className="p-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase text-slate-400">Preview for {block.type}</div>;
                              }
                           };

                           return (
                              <React.Fragment key={block.id}>
                                 {/* Top In-Between Zone for first element */}
                                 {index === 0 && (
                                    <div 
                                       onClick={() => addBlock('paragraph', 0)}
                                       className="h-2 hover:h-12 group/zone relative flex items-center justify-center cursor-pointer transition-all duration-300"
                                    >
                                       <div className="w-full h-[1px] bg-indigo-100 scale-x-0 group-hover/zone:scale-x-100 transition-transform origin-center" />
                                       <div className="absolute opacity-0 group-hover/zone:opacity-100 transition-opacity bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                                          <Plus size={16} />
                                       </div>
                                    </div>
                                 )}

                                 <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onMouseEnter={() => setHoveredBlockId(block.id)}
                                    onMouseLeave={() => setHoveredBlockId(null)}
                                    className={`group/block relative p-4 rounded-3xl transition-all duration-300 ${activeBlockId === block.id ? 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-slate-100' : 'hover:bg-slate-50/50'}`}
                                 >
                                    {/* Gutter Toolbar (Left) */}
                                    {!isPreview && (
                                       <div className={`absolute -left-12 top-6 flex flex-col items-center gap-1 transition-all duration-300 ${hoveredBlockId === block.id || activeBlockId === block.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
                                          <button className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-indigo-600 cursor-grab active:cursor-grabbing transition-colors">
                                             <GripVertical size={16} />
                                          </button>
                                          <button 
                                             onClick={() => addBlock('paragraph', index + 1)}
                                             className="w-6 h-6 bg-white border border-slate-200 text-slate-400 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm transition-all"
                                          >
                                             <Plus size={12} />
                                          </button>
                                       </div>
                                    )}

                                    {/* Content Area */}
                                    {renderBlock()}
                                    
                                    {/* Right Side Actions (Delete/Settings) */}
                                    {!isPreview && (
                                       <div className={`absolute -right-4 top-6 flex flex-col gap-2 transition-all duration-300 ${hoveredBlockId === block.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}>
                                          <button 
                                             onClick={() => removeBlock(block.id)}
                                             className="w-8 h-8 bg-white border border-slate-200 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 hover:border-red-200 shadow-sm transition-all"
                                          >
                                             <Trash2 size={14} />
                                          </button>
                                          <button 
                                             onClick={() => setActiveBlockId(block.id)}
                                             className="w-8 h-8 bg-white border border-slate-200 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 shadow-sm transition-all"
                                          >
                                             <SettingsIcon size={14} />
                                          </button>
                                       </div>
                                    )}
                                 </motion.div>

                                 {/* In-Between Zone */}
                                 <div 
                                    onClick={() => addBlock('paragraph', index + 1)}
                                    className="h-2 hover:h-12 group/zone relative flex items-center justify-center cursor-pointer transition-all duration-300"
                                 >
                                    <div className="w-full h-[1px] bg-indigo-100 scale-x-0 group-hover/zone:scale-x-100 transition-transform origin-center" />
                                    <div className="absolute opacity-0 group-hover/zone:opacity-100 transition-opacity bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                                       <Plus size={16} />
                                    </div>
                                 </div>
                              </React.Fragment>
                           );
                        })}
                     </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Slash Command Menu Overlay */}
            <AnimatePresence>
               {slashMenu.open && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 10 }}
                     style={{ 
                        position: 'fixed', 
                        top: slashMenu.top, 
                        left: slashMenu.left,
                        zIndex: 999 
                     }}
                     className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[200px] backdrop-blur-xl"
                  >
                     <div className="p-2 border-b border-white/5 bg-white/5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Select Block</span>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto no-scrollbar p-1">
                        {BLOCK_TYPES.map((block, idx) => (
                           <button
                              key={block.id}
                              onMouseEnter={() => setSlashMenu(prev => ({ ...prev, selectedIndex: idx }))}
                              onClick={() => {
                                 const activeBlock = article.content_blocks.find(b => b.id === activeBlockId);
                                 if (activeBlock) {
                                    const index = article.content_blocks.indexOf(activeBlock);
                                    updateBlock(activeBlockId!, { content: activeBlock.content.replace('/', '') });
                                    addBlock(block.id as any, index + 1);
                                 }
                                 setSlashMenu({ ...slashMenu, open: false, selectedIndex: 0 });
                              }}
                              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left group ${slashMenu.selectedIndex === idx ? 'bg-indigo-600' : 'hover:bg-white/5'}`}
                           >
                              <div className={`w-8 h-8 ${block.color} rounded-lg flex items-center justify-center text-white ${slashMenu.selectedIndex === idx ? 'shadow-inner scale-95' : ''}`}>
                                 <block.icon size={14} />
                              </div>
                              <div className="flex-1">
                                 <p className={`text-[10px] font-black uppercase tracking-tight ${slashMenu.selectedIndex === idx ? 'text-white' : 'text-slate-200'}`}>{block.label}</p>
                                 <p className={`text-[8px] font-bold uppercase tracking-widest ${slashMenu.selectedIndex === idx ? 'text-indigo-200' : 'text-slate-500'}`}>{block.desc}</p>
                              </div>
                           </button>
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
}
