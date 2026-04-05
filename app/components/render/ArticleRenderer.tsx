"use client";

import React from "react";
import Image from "next/image";
import { Article, Section } from "@/lib/types";
import { motion } from "framer-motion";
import { User, Calendar, Share, ThumbsUp, ChevronRight } from "lucide-react";
import ParticleEffect from "../ParticleEffect";
import InteractiveHero from "./InteractiveHero";

interface ArticleRendererProps {
  article: Article;
}

export default function ArticleRenderer({ article }: ArticleRendererProps) {
  return (
    <div className="bg-white min-h-screen font-sans selection:bg-brand selection:text-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden bg-[#0B0E23]">
        <InteractiveHero imageSrc={article.heroImage} />
        
        {/* Magnetic Particles */}
        <ParticleEffect mode="attract" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E23] via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-brand text-white text-[10px] font-bold tracking-widest uppercase rounded">DEEP DIVE</span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase rounded border border-white/10">INTELLIGENCE REPORT</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white max-w-4xl leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/30 border border-brand/50 flex items-center justify-center text-white font-bold">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{article.author}</p>
                  <p className="text-white/50 text-xs">{article.authorRole || 'Lead Analyst'}</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/10 hidden md:block" />
              
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">PUBLISHED</p>
                <p className="text-white font-medium text-sm">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Sections */}
        <div className="lg:col-span-8 space-y-12">
          {article.sections.map((section, idx) => (
            <motion.section 
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              style={{
                backgroundColor: section.styles?.backgroundColor,
                color: section.styles?.color,
                padding: section.styles?.padding,
                textAlign: section.styles?.textAlign
              }}
              className="group"
            >
              {section.heading && (
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1a1a1a] group-hover:text-brand transition-colors duration-300">
                  {section.heading}
                </h2>
              )}
              
              {section.type === 'text' && (
                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-sans space-y-4">
                  {section.content?.split('\n').map((para: string, pIdx: number) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>
              )}

              {section.type === 'blockquote' && (
                <div className="relative py-8 px-10 border-l-4 border-brand bg-brand/5 rounded-r-2xl italic text-xl md:text-2xl font-serif text-brand leading-relaxed">
                  "{section.content}"
                </div>
              )}

              {section.type === 'hero' && idx > 0 && (
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                   <Image src={section.content || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200"} alt="Section image" fill className="object-cover" />
                   {section.heading && <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full text-white font-bold text-xl">{section.heading}</div>}
                </div>
              )}
            </motion.section>
          ))}

          {/* Tags & Footer Action */}
          <div className="pt-12 border-t border-gray-100 flex flex-wrap items-center justify-between gap-6">
             <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                   <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-lg hover:bg-brand hover:text-white transition-colors cursor-pointer uppercase tracking-wider">
                      #{tag}
                   </span>
                ))}
             </div>
             <div className="flex gap-4">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-brand/5 text-brand rounded-full font-bold text-sm hover:bg-brand hover:text-white transition-all shadow-sm">
                   <ThumbsUp size={16} /> Insightful
                </button>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-200 transition-all">
                   <Share size={16} /> Share
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Related Articles Component (Static Placeholder but matching style) */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand rounded-full"></span>
              Related Articles
            </h3>
            <div className="space-y-6">
               {[
                 { title: "Fusion Breakthroughs and Data Centers", tag: "ENERGY", time: "4 min read" },
                 { title: "The Quantum ETF Volatility Report", tag: "MARKETS", time: "7 min read" }
               ].map((item, i) => (
                 <div key={i} className="group cursor-pointer">
                    <p className="text-[10px] font-bold text-brand mb-1 tracking-widest">{item.tag}</p>
                    <h4 className="text-sm font-bold text-dark-bg group-hover:text-brand transition-all flex items-center justify-between">
                       {item.title}
                       <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </h4>
                    <p className="text-xs text-gray-400 mt-2">{item.time} • Today</p>
                    {i === 0 && <div className="mt-4 h-px bg-gray-100 w-full" />}
                 </div>
               ))}
            </div>
          </div>

          {/* Key Data Points */}
          <div className="bg-[#2A3891] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
            <div className="relative z-10 space-y-8">
               <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                 Key Data Points
               </h3>
               
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-white/50 mb-1 uppercase tracking-widest">{article.sidebarContent?.dataPoints?.[0]?.label || 'MARKET CAP'}</p>
                    <p className="text-2xl font-bold">{article.sidebarContent?.dataPoints?.[0]?.value || '$142B'}</p>
                    <p className="text-[10px] font-bold text-emerald-400 mt-1">{article.sidebarContent?.dataPoints?.[0]?.subValue || '+12.4%'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/50 mb-1 uppercase tracking-widest">{article.sidebarContent?.dataPoints?.[1]?.label || 'R&D SPEND'}</p>
                    <p className="text-2xl font-bold">{article.sidebarContent?.dataPoints?.[1]?.value || '$28B'}</p>
                    <p className="text-[10px] font-bold text-white/30 mt-1 italic">{article.sidebarContent?.dataPoints?.[1]?.subValue || 'Annualized'}</p>
                  </div>
               </div>

               <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">QUBIT STABILITY RATIO</p>
                    <p className="text-[10px] font-bold">84%</p>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '84%' }}
                        className="h-full bg-white rounded-full" 
                     />
                  </div>
                  <p className="text-[10px] text-white/30 italic">84% efficiency reached in 1.4 Kelvin environments</p>
               </div>
            </div>
          </div>

          {/* Unit Intelligence - Simulated Updates */}
          <div className="bg-gray-50/50 rounded-2xl p-8 border border-gray-100 flex flex-col gap-6">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Unit Intelligence</h3>
             <div className="space-y-6">
                {[
                  { user: "Alex Sokolov", initial: "AS", msg: "The lattice-based protocol migration is actually lagging in APAC countries.", time: "12m ago" },
                  { user: "Maria Kim", initial: "MK", msg: "Does the report cover the liquid nitrogen cooling overhead costs?", time: "1h ago" }
                ].map((msg, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-[#4E60FF] flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#4E60FF]/30">
                        {msg.initial}
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-bold text-dark-bg">{msg.user} <span className="text-[10px] font-normal text-gray-400 ml-2">{msg.time}</span></p>
                        <p className="text-xs text-gray-500 leading-relaxed">{msg.msg}</p>
                     </div>
                  </div>
                ))}
             </div>
             <button className="text-[10px] font-bold text-brand uppercase tracking-widest pt-2 hover:translate-x-1 transition-transform">
                Join Discussion
             </button>
          </div>
        </aside>
      </main>

      {/* Footer Branding */}
      <footer className="pt-24 pb-12 border-t border-gray-100 bg-gray-50/30">
         <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-brand italic tracking-tighter">LUX INTEL</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">© 2026 LUX INTEL. ALL RIGHTS RESERVED.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               <a href="#" className="hover:text-brand transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-brand transition-colors">Terms of Service</a>
               <a href="#" className="hover:text-brand transition-colors">Editorial Guidelines</a>
               <a href="#" className="hover:text-brand transition-colors">Contact Intelligence</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
