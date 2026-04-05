"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, Eye, Layout, Type, Image as ImageIcon, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Article, Section, SectionType } from "@/lib/types";
import ArticleRenderer from "@/app/components/render/ArticleRenderer";
import { motion, Reorder } from "framer-motion";

export default function CMSPage() {
  const [article, setArticle] = useState<Article>({
    id: "",
    title: "New Intelligence Report",
    author: "Editor Name",
    authorRole: "Lead Analyst",
    publishedAt: new Date().toISOString(),
    heroImage: "/jeremy-thomas-E0AHdsENmDg-unsplash.jpg",
    sections: [
      {
        id: "1",
        type: "hero",
        heading: "The Future of Quantum Computing",
        content: "A deep dive into the next frontier of technology.",
        styles: { backgroundColor: "#0B0E23", color: "#FFFFFF" }
      },
      {
        id: "2",
        type: "text",
        heading: "The Silicon Transition",
        content: "For years, the industry was divided between superconducting loops and trapped ions...",
        styles: { fontSize: "1.1rem" }
      }
    ],
    tags: ["QUANTUM", "TECH POLICY", "INTELLIGENCE"],
    sidebarContent: {
      dataPoints: [
        { label: "MARKET CAP", value: "$142B", subValue: "+12.4%" },
        { label: "R&D SPEND", value: "$28B", subValue: "Annualized" }
      ]
    }
  });

  const [isPreview, setIsPreview] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  const addSection = (type: SectionType) => {
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      heading: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: type === "text" ? "Enter your content here..." : "",
      styles: {}
    };
    setArticle(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setArticle(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const removeSection = (id: string) => {
    setArticle(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id)
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article)
      });
      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
        setLastSavedId(data.article.id);
        alert("Article published successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to publish article.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        if (id) {
          updateSection(id, { content: data.url });
        } else {
          setArticle(prev => ({ ...prev, heroImage: data.url }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col shadow-xl z-30">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h1 className="text-xl font-bold text-dark-bg flex items-center gap-2">
            <Layout className="text-brand" size={24} />
            Editor CMS
          </h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className={`p-2 rounded-lg transition-colors ${isPreview ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              title="Toggle Preview"
            >
              <Eye size={20} />
            </button>
            <button 
              onClick={handleSave}
              className="p-2 bg-brand hover:bg-brand-dark text-white rounded-lg transition-colors shadow-lg shadow-brand/20"
              title="Publish"
            >
              <Save size={20} />
            </button>
          </div>
        </div>

        {lastSavedId && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 uppercase">ARTICLE LIVE</span>
            <a 
              href={`/article/${lastSavedId}`} 
              target="_blank" 
              className="text-[10px] font-bold text-brand hover:underline flex items-center gap-1"
            >
              View Page <Eye size={12} />
            </a>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 custom-scrollbar">
          {/* Article Meta */}
          <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Metadata</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">TITLE</label>
                <input 
                  type="text" 
                  value={article.title}
                  onChange={(e) => setArticle({...article, title: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">AUTHOR</label>
                  <input 
                    type="text" 
                    value={article.author}
                    onChange={(e) => setArticle({...article, author: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">ROLE</label>
                  <input 
                    type="text" 
                    value={article.authorRole}
                    onChange={(e) => setArticle({...article, authorRole: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">HERO IMAGE</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={article.heroImage}
                    onChange={(e) => setArticle({...article, heroImage: e.target.value})}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand transition-all"
                  />
                  <label className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                    <ImageIcon size={16} />
                    <input type="file" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Article Sidebar</h3>
            <div className="space-y-3">
              {article.sidebarContent?.dataPoints?.map((dp, idx) => (
                <div key={idx} className="p-3 bg-white border border-gray-100 rounded-lg space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">DATA POINT {idx + 1}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Label"
                      value={dp.label}
                      onChange={(e) => {
                        const newDP = [...(article.sidebarContent?.dataPoints || [])];
                        newDP[idx] = { ...dp, label: e.target.value };
                        setArticle({ ...article, sidebarContent: { ...article.sidebarContent, dataPoints: newDP } });
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded px-2 py-1 text-[10px] focus:outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Value"
                      value={dp.value}
                      onChange={(e) => {
                        const newDP = [...(article.sidebarContent?.dataPoints || [])];
                        newDP[idx] = { ...dp, value: e.target.value };
                        setArticle({ ...article, sidebarContent: { ...article.sidebarContent, dataPoints: newDP } });
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded px-2 py-1 text-[10px] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 capitalize tracking-widest flex items-center justify-between">
              Sections
              <div className="flex gap-1">
                <button onClick={() => addSection('text')} className="p-1 hover:text-brand transition-colors"><Plus size={14} /></button>
              </div>
            </h3>
            
            <Reorder.Group axis="y" values={article.sections} onReorder={(newOrder) => setArticle({...article, sections: newOrder})} className="space-y-3">
              {article.sections.map((section) => (
                <Reorder.Item 
                  key={section.id} 
                  value={section}
                  className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${activeSectionId === section.id ? 'border-brand ring-2 ring-brand/10' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex items-center p-3 gap-3 cursor-pointer" onClick={() => setActiveSectionId(activeSectionId === section.id ? null : section.id)}>
                    <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                      <GripVertical size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase">{section.type}</span>
                        <h4 className="text-sm font-semibold text-dark-bg truncate max-w-[140px]">{section.heading || 'Untitled'}</h4>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    {activeSectionId === section.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>

                  {activeSectionId === section.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4 space-y-4 border-t border-gray-50 pt-4 bg-gray-50/30"
                    >
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">HEADING</label>
                        <input 
                          type="text" 
                          value={section.heading}
                          onChange={(e) => updateSection(section.id, { heading: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                        />
                      </div>
                      
                      {section.type === 'text' && (
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">CONTENT</label>
                          <textarea 
                            rows={4}
                            value={section.content}
                            onChange={(e) => updateSection(section.id, { content: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">BG COLOR</label>
                          <input 
                            type="color" 
                            value={section.styles?.backgroundColor || '#ffffff'}
                            onChange={(e) => updateSection(section.id, { styles: { ...section.styles, backgroundColor: e.target.value } })}
                            className="w-full h-8 cursor-pointer rounded-lg overflow-hidden border-0 p-0"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 mb-1 block">TEXT COLOR</label>
                          <input 
                            type="color" 
                            value={section.styles?.color || '#000000'}
                            onChange={(e) => updateSection(section.id, { styles: { ...section.styles, color: e.target.value } })}
                            className="w-full h-8 cursor-pointer rounded-lg overflow-hidden border-0 p-0"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <button 
              onClick={() => addSection('text')}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-brand hover:text-brand hover:bg-brand/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add New Section
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className={`flex-1 relative transition-all duration-500 ${isPreview ? 'p-0' : 'p-8 bg-[#F0F2F5]'}`}>
        <div className={`mx-auto bg-white transition-all duration-700 shadow-2xl h-full overflow-y-auto custom-scrollbar ${isPreview ? 'w-full max-w-none rounded-0' : 'w-full max-w-[900px] rounded-2xl'}`}>
          <ArticleRenderer article={article} />
        </div>
        
        {/* Helper overlay for editor */}
        {!isPreview && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-400 shadow-sm border border-white/50 select-none">
            EDIT MODE: Changes auto-save in session
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
