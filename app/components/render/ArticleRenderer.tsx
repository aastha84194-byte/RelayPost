"use client";

import React, { useState, useEffect } from "react";
import { Article, ContentBlock, Reflection } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar, Share, ThumbsUp, ChevronRight, Quote as QuoteIcon, Trophy, Sparkles, MessageSquare, Send, Zap, Shield, Target } from "lucide-react";
import Link from "next/link";
import ParticleEffect from "../ParticleEffect";
import InteractiveHero from "./InteractiveHero";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area, Cell } from 'recharts';
import { recordArticleView, toggleLike, submitReflection, getArticlesBySection } from "@/lib/articles";
import Cookies from "js-cookie";

interface ArticleRendererProps {
  article: Article;
}

const FONT_CLASSES: Record<string, string> = {
  "Inter": "font-sans",
  "Merriweather": "font-serif text-slate-800 dark:text-slate-100",
  "JetBrains Mono": "font-mono text-sm",
  "Outfit": "font-sans tracking-tight",
};

export default function ArticleRenderer({ article }: ArticleRendererProps) {
  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(article.likes_count || 0);
  const [reflections, setReflections] = React.useState<Reflection[]>(article.reflections || []);
  const [relatedArticles, setRelatedArticles] = React.useState<Article[]>([]);
  const [reflectionContent, setReflectionContent] = React.useState("");
  const [showReflectionForm, setShowReflectionForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (article.id) {
       recordArticleView(article.id);
       
       // Fetch related articles if possible
       if (article.homepage_section) {
          getArticlesBySection(article.homepage_section).then(articles => {
             setRelatedArticles(articles.filter(a => a.slug !== article.slug).slice(0, 3));
          });
       }
    }
  }, [article.id, article.homepage_section, article.slug]);

  const handleLike = async () => {
    const token = Cookies.get("access_token");
    if (!token) {
       alert("Please login to like this article");
       return;
    }
    const res = await toggleLike(article.id!, token);
    if (res) {
       setLiked(res.liked);
       setLikesCount(prev => res.liked ? prev + 1 : prev - 1);
    }
  };

  const handleReflectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionContent.trim()) return;
    
    setIsSubmitting(true);
    const res = await submitReflection(article.id!, reflectionContent, true); // Anonymous by default as per request
    if (res) {
       setReflections(prev => [res, ...prev]);
       setReflectionContent("");
       setShowReflectionForm(false);
    }
    setIsSubmitting(false);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const theme = article.theme || "standard";
  
  const themeClasses = {
    standard: {
      body: "bg-[#f0f2f5] dark:bg-slate-950",
      card: "bg-white dark:bg-slate-900 border-transparent",
      text: "text-slate-700 dark:text-slate-300",
      heading: "text-slate-900 dark:text-white",
      accent: "text-brand",
      button: "bg-brand text-white hover:bg-brand-dark"
    },
    intelligence: {
      body: "bg-slate-900 dark:bg-black",
      card: "bg-slate-800 dark:bg-slate-900 border-indigo-500/20",
      text: "text-slate-300 dark:text-slate-400",
      heading: "text-white dark:text-indigo-100",
      accent: "text-indigo-400 font-serif",
      button: "bg-indigo-600 text-white hover:bg-indigo-700"
    },
    sports: {
      body: "bg-orange-50 dark:bg-orange-950/20",
      card: "bg-white dark:bg-slate-900 border-orange-500/10",
      text: "text-slate-800 dark:text-slate-200",
      heading: "text-slate-900 dark:text-white font-black italic",
      accent: "text-orange-600",
      button: "bg-orange-600 text-white hover:bg-orange-700"
    }
  }[theme] || {
    body: "bg-[#f0f2f5] dark:bg-slate-950",
    card: "bg-white dark:bg-slate-900 border-transparent",
    text: "text-slate-700 dark:text-slate-300",
    heading: "text-slate-900 dark:text-white",
    accent: "text-brand",
    button: "bg-brand text-white hover:bg-brand-dark"
  };

  return (
    <div className={`${themeClasses.body} min-h-screen font-sans selection:bg-brand selection:text-white transition-colors duration-300 pb-24 ${theme === 'intelligence' ? 'dark' : ''}`}>
      {/* Premium Hero Section (Maritime Style) */}
      <section className="relative h-[60vh] md:h-[85vh] min-h-[400px] md:min-h-[600px] overflow-hidden bg-[#0A0D1F]">
        <InteractiveHero imageSrc={article.hero_image || ""} />
        <ParticleEffect mode="attract" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0D1F]/40 to-[#0A0D1F] pointer-events-none" />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 md:p-8 w-full md:max-w-5xl md:mx-auto z-20">
          <motion.div {...fadeIn} className="space-y-4 md:space-y-8">
            <div className="flex justify-center gap-3">
              {/* Template badge removed for cleaner look */}
            </div>
            
            <h1 className="text-xl md:text-4xl lg:text-4xl font-black text-white leading-tight md:leading-[1.1] tracking-tight drop-shadow-2xl">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand/50 shadow-inner">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${article.author_id}`} alt="Author" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-white font-black text-[10px] tracking-widest uppercase mb-0.5 opacity-60">Published By</p>
                  <p className="text-brand text-xs font-black tracking-widest uppercase">
                    {article.author_id === '00000000-0000-0000-0000-000000000000' 
                      ? 'RelayPost Intelligence' 
                      : 'Kartik'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 text-white/60 text-[10px] font-black uppercase tracking-[0.15em]">
                <div className="flex items-center gap-2">
                   <Calendar size={14} className="text-brand" />
                   {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Draft'}
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                   <User size={14} className="text-brand" /> {article.views_count || 0} VIEWS
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Card (Floating Style) */}
      <main className="w-full md:max-w-7xl md:mx-auto px-4 md:px-8 -mt-12 md:-mt-24 relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="hidden lg:block lg:col-span-1" />

        {/* Article Body */}
        <div className={`lg:col-span-7 ${themeClasses.card} rounded-[2.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.15)] p-10 md:p-20 border overflow-hidden`}>
          
          <div className="space-y-12">
            {article.ai_summary && (
              <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-500/10">
                <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                   AI Executive Summary
                </p>
                <p className="text-indigo-900 dark:text-indigo-200 text-lg font-medium leading-relaxed italic">
                  "{article.ai_summary}"
                </p>
              </div>
            )}

            {article.content_blocks.map((block: ContentBlock, idx: number) => {
               const fontClass = FONT_CLASSES[block.styles?.fontFamily || "Inter"] || "font-sans";
               const blockStyle = {
                  color: block.styles?.color,
                  textAlign: block.styles?.align as any,
                  fontSize: block.styles?.fontSize,
               };

               return (
                 <motion.section 
                   key={block.id} 
                   {...fadeIn} 
                   transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                   className={`${fontClass} leading-relaxed dark:text-slate-200`}
                 >
                   
                   {block.type === 'heading' && React.createElement(`h${block.metadata?.level || 2}`, {
                      className: `font-black tracking-tight ${themeClasses.heading} ${
                        block.metadata?.level === 1 ? 'text-5xl md:text-6xl mb-12' :
                        block.metadata?.level === 3 ? 'text-3xl mb-6' : 'text-xl mb-4'
                      }`,
                      style: blockStyle
                   }, block.content)}

                   {block.type === 'paragraph' && (
                     <p 
                       className={`text-xl md:text-2xl ${themeClasses.text} leading-[1.7] mb-8 ${idx === 0 ? `first-letter:text-7xl first-letter:font-black first-letter:${themeClasses.accent.split(' ')[0]} first-letter:mr-3 first-letter:float-left` : ''}`} 
                       style={blockStyle}
                     >
                       {block.content}
                     </p>
                   )}

                   {block.type === 'bullet_list' && (
                     <ul className="space-y-4 mb-8 pl-6 list-outside">
                        {(block.metadata?.items || []).map((item: string, i: number) => (
                           <li key={i} className="relative pl-6 text-lg text-slate-700 dark:text-slate-300">
                             <span className="absolute left-0 top-3 w-1.5 h-1.5 bg-brand rounded-full shadow-sm shadow-brand/50" />
                             {item}
                           </li>
                        ))}
                     </ul>
                   )}

                   {block.type === 'numbered_list' && (
                     <ol className="space-y-4 mb-8 pl-6 list-decimal">
                        {(block.metadata?.items || []).map((item: string, i: number) => (
                           <li key={i} className="pl-2 text-lg text-slate-700 dark:text-slate-300 font-medium">
                             {item}
                           </li>
                        ))}
                     </ol>
                   )}

                   {block.type === 'quote' && (
                      <div className="my-16 relative">
                         <QuoteIcon className="absolute -top-6 -left-6 w-20 h-20 text-brand/10 -rotate-12" />
                         <blockquote className="relative z-10 text-3xl md:text-4xl font-serif italic text-slate-800 dark:text-slate-100 leading-tight text-center max-w-2xl mx-auto">
                            "{block.content}"
                         </blockquote>
                         {block.metadata?.caption && (
                            <cite className="block mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-brand text-center not-italic">
                               — {block.metadata.caption}
                            </cite>
                         )}
                      </div>
                   )}

                   {block.type === 'image' && (
                      <figure className="my-14 space-y-4">
                         <div className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5">
                            <img src={block.content} alt={block.metadata?.altText || "Report Image"} className="w-full h-auto" />
                         </div>
                         {block.metadata?.caption && (
                            <figcaption className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{block.metadata.caption}</figcaption>
                         )}
                      </figure>
                   )}

                    {block.type === 'table' && block.metadata?.tableData && (
                       <div className="my-14 overflow-x-auto rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl">
                          <table className="w-full text-left border-collapse">
                             <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800">
                                   {block.metadata.tableData.headers?.map((header: string, i: number) => (
                                      <th key={i} className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/10">{header}</th>
                                   ))}
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {block.metadata.tableData.rows?.map((row: string[], i: number) => (
                                   <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                      {row.map((cell, j) => (
                                         <td key={j} className="p-6 text-sm font-medium text-slate-700 dark:text-slate-300">{cell}</td>
                                      ))}
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    )}

                   {block.type === 'graph' && block.metadata?.chartData && (
                      <div className="my-14 p-10 bg-[#f8fafc] dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                           <div className="space-y-1">
                              <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{block.metadata?.caption || 'Data Analysis'}</h4>
                              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{block.metadata?.altText || 'Executive Insight'}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-3xl font-black text-brand tracking-tighter">+18.4%</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">YTD Growth</p>
                           </div>
                        </div>
                        <div className="w-full h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              {block.metadata.chartType === 'line' ? (
                                <LineChart data={block.metadata.chartData}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={idx % 2 === 0 ? "#E2E8F0" : "#334155"} />
                                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                   <YAxis hide />
                                   <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                                   <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                                </LineChart>
                              ) : (
                                <BarChart data={block.metadata.chartData}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                   <YAxis hide />
                                   <Tooltip />
                                   <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                      {block.metadata.chartData.map((_: any, index: number) => (
                                        <Cell key={index} fill={index % 2 === 0 ? '#6366f1' : '#4338ca'} />
                                      ))}
                                   </Bar>
                                </BarChart>
                              )}
                           </ResponsiveContainer>
                        </div>
                      </div>
                   )}

                   {block.type === 'code_block' && (
                      <div className="my-8 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-white/5">
                        <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{block.metadata?.language || 'typescript'}</span>
                           <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                           </div>
                        </div>
                        <pre className="p-8 overflow-x-auto text-sm font-mono text-indigo-300 leading-relaxed">
                           <code>{block.content}</code>
                        </pre>
                      </div>
                   )}

                   {block.type === 'callout' && (
                      <div className={`my-8 p-8 rounded-3xl border flex gap-6 items-start ${
                        block.metadata?.calloutType === 'warning' ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-500/20' :
                        'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-500/20'
                      }`}>
                         <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                            <span className="text-2xl">{block.metadata?.icon || '💡'}</span>
                         </div>
                         <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{block.metadata?.title || 'Editorial Note'}</p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{block.content}</p>
                         </div>
                      </div>
                   )}

                   {block.type === 'faq_block' && (
                      <div className="my-12 space-y-4">
                         <h4 className="text-sm font-black text-brand uppercase tracking-[0.2em] mb-6">Dispatch Intelligence FAQ</h4>
                         {(block.metadata?.questions || []).map((faq: any, i: number) => (
                            <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <p className="font-bold text-slate-900 dark:text-white mb-2">{faq.question}</p>
                               <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                         ))}
                      </div>
                   )}

                   {block.type === 'cta_block' && (
                      <div className="my-16 p-12 bg-gradient-to-br from-brand to-indigo-900 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                         <div className="relative z-10 space-y-6">
                            <h3 className="text-3xl font-black text-white tracking-tight">{block.metadata?.title || 'Connect with Intelligence'}</h3>
                            <p className="text-white/80 max-w-lg mx-auto leading-relaxed">{block.content}</p>
                            <button className="px-10 py-4 bg-white text-brand font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-all shadow-xl">
                               {block.metadata?.buttonText || 'Contact Us'}
                            </button>
                         </div>
                      </div>
                   )}

                   {block.type === 'youtube_embed' && (
                      <div className="my-12 aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 border-4 border-white/10">
                         <iframe 
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${block.metadata?.videoId}`} 
                            title="YouTube video player" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                         />
                      </div>
                   )}

                   {block.type === 'divider' && <div className="h-px bg-slate-100 dark:bg-white/5 my-16 max-w-xs mx-auto" />}

                 </motion.section>
               )
            })}
          </div>

          {/* Tags */}
          <div className="mt-20 pt-12 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-8">
             <div className="flex flex-wrap gap-2">
                {article.secondary_keywords?.map(tag => (
                   <span key={tag} className="px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-full hover:bg-brand hover:text-white transition-all cursor-pointer uppercase tracking-widest shadow-sm">
                      #{tag}
                   </span>
                ))}
             </div>
             <div className="flex gap-6">
                <button className="flex items-center gap-2 group">
                   <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all group-hover:bg-brand/10">
                      <Share size={16} className="text-slate-400 group-hover:text-brand" />
                   </div>
                </button>
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${
                    liked ? 'bg-brand text-white' : 'bg-brand/5 text-brand hover:bg-brand hover:text-white'
                  }`}
                >
                   <ThumbsUp size={16} /> {liked ? 'Insightful' : `${likesCount} Likes`}
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar Container */}
        <aside className="lg:col-span-4 space-y-8">
          
          <div className={`${themeClasses.card} rounded-[2.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] p-8 border space-y-8`}>
             <h3 className="text-[11px] font-black text-brand uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-4 h-0.5 bg-brand" />
                Related Dispatches
             </h3>
             <div className="space-y-6">
                {relatedArticles.length > 0 ? relatedArticles.map((item, i) => (
                  <Link 
                    key={i} 
                    href={`/${item.category_name?.toLowerCase().replace(/ /g, '-') || 'general'}/${item.slug}`} 
                    className="flex gap-4 group cursor-pointer"
                  >
                     <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md">
                        <img src={item.hero_image || "https://images.unsplash.com/photo-1544411047-c491574abb46?w=400&q=80"} alt="Thumb" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-brand tracking-widest uppercase">{item.category_name || 'INTELLIGENCE'}</p>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand transition-colors">{item.title}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Analysis</p>
                     </div>
                  </Link>
                )) : (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">No related dispatches found.</p>
                )}
             </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-brand rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group text-center">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
             <div className="relative z-10 space-y-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                   <Trophy size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-none">Support Editorial Integrity</h3>
                <p className="text-slate-100/70 text-sm leading-relaxed font-medium">
                  Curated reports by members to provide deep-dive editorial without corporate bias. Join our network.
                </p>
                <button className="w-full py-5 bg-white text-brand font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all">
                  Become a Member
                </button>
             </div>
          </div>

          <div className="bg-[#f8fafc] dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 space-y-6">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Trending Briefs</h3>
             <div className="flex flex-wrap gap-2 px-2">
                {['#Geopolitics', '#TradeRoutes', '#AIInPolicy', '#SupplyChainAI'].map(tag => (
                   <span key={tag} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded-xl shadow-sm cursor-pointer hover:text-brand transition-colors">
                      {tag}
                   </span>
                ))}
             </div>
          </div>
        </aside>
      </main>

      {/* Reflections / Comments Section */}
      <section className="max-w-4xl mx-auto px-4 mt-24 space-y-12">
         <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Reflections</h2>
            <div className="h-0.5 grow mx-8 bg-slate-100 dark:bg-white/5" />
         </div>
         
         <div className="space-y-6">
            {reflections.length > 0 ? reflections.map((comment, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="p-8 bg-indigo-50/30 dark:bg-slate-900/50 rounded-[2rem] border border-indigo-100/50 dark:border-slate-800 flex gap-6"
              >
                 <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-brand/20 bg-slate-100 flex items-center justify-center">
                    {comment.is_anonymous || !comment.author_img ? (
                       <User size={24} className="text-slate-400" />
                    ) : (
                       <img src={comment.author_img} alt="Ava" className="w-full h-full object-cover" />
                    )}
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                          {comment.is_anonymous ? 'Anonymous Member' : (comment.author_name || 'Member')}
                       </p>
                       <span className="w-1 h-1 bg-brand rounded-full" />
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {comment.author_role || 'Verified Contribution'}
                       </p>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                       {comment.content}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-2">
                       {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                 </div>
              </motion.div>
            )) : (
              <p className="text-center text-slate-400 font-bold uppercase tracking-widest py-12">Be the first to share a reflection.</p>
            )}
         </div>

         <div className="pt-8 text-center">
            {!showReflectionForm ? (
               <button 
                  onClick={() => setShowReflectionForm(true)}
                  className="px-12 py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:border-brand hover:text-brand transition-all"
               >
                  Add Your Reflection
               </button>
            ) : (
               <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleReflectionSubmit}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 space-y-4"
               >
                  <textarea 
                    value={reflectionContent}
                    onChange={(e) => setReflectionContent(e.target.value)}
                    placeholder="Share your expert insights on this dispatch..."
                    className="w-full h-32 p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand outline-none text-slate-800 dark:text-white resize-none"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                        Contributions are anonymous by default for editorial privacy.
                     </p>
                     <div className="flex gap-4">
                        <button 
                           type="button"
                           onClick={() => setShowReflectionForm(false)}
                           className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                           Cancel
                        </button>
                        <button 
                           type="submit"
                           disabled={isSubmitting || !reflectionContent.trim()}
                           className="px-8 py-3 bg-brand text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                        >
                           {isSubmitting ? 'Posting...' : 'Post Reflection'} <Send size={14} />
                        </button>
                     </div>
                  </div>
               </motion.form>
            )}
         </div>
      </section>

      {/* Corporate Footer */}
      <footer className="mt-32 pt-24 pb-12 bg-[#0A0D1F] text-white">
         <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-16">
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-white italic tracking-tighter">RelayPost</h2>
               <p className="text-slate-400 text-[10px] leading-relaxed max-w-xs font-bold uppercase tracking-wider">
                  Premium editorial intelligence for global executives. High-fidelity analysis on the intersections of geopolitics, technology, and trade.
               </p>
            </div>
            <div className="space-y-6">
               <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-brand">Directory</h3>
               <div className="flex flex-col gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <a href="#" className="hover:text-white transition-colors">Archive</a>
                  <a href="#" className="hover:text-white transition-colors">Newsletters</a>
                  <a href="#" className="hover:text-white transition-colors">White Papers</a>
               </div>
            </div>
            <div className="space-y-6">
               <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-brand">Information</h3>
               <div className="flex flex-col gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <a href="#" className="hover:text-white transition-colors">About Us</a>
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
               </div>
            </div>
            <div className="space-y-6">
               <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-brand">Global Operations</h3>
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-brand transition-colors cursor-pointer border border-white/5">
                     <Share size={16} />
                  </div>
               </div>
               <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-inner">
                  Contact Support
               </button>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-8 pt-12 flex justify-center text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">
            © 2026 RelayPost Intelligence Network. All rights reserved. Registered trademark of Lux Intel Group.
         </div>
      </footer>
    </div>
  );
}
