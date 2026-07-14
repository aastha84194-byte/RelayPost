"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ExternalLink, Globe, Zap } from 'lucide-react';
import { NewsArticle } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

interface NewsQuickReadModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsQuickReadModal({ article, isOpen, onClose }: NewsQuickReadModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!article) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col border border-slate-200 dark:border-slate-800"
            >
              {/* Header Image / Pattern */}
              <div className="relative h-48 md:h-64 shrink-0 bg-indigo-600">
                {article.image_url ? (
                  <Image
                    src={article.image_url}
                    alt={article.title}
                    fill
                    className="object-cover opacity-80"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
                
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-colors z-10"
                >
                  <X size={20} />
                </button>

                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white uppercase tracking-wider shrink-0">
                      {article.category || 'General'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 max-w-[200px]">
                      <Globe size={10} className="shrink-0" /> <span className="truncate">{article.source_name || 'News Stream'}</span>
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {article.title}
                  </h2>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-grow overflow-y-auto p-6 md:p-8 no-scrollbar">
                <div className="flex items-center gap-2 mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30">
                  <div className="p-2 bg-indigo-600 rounded-xl text-white">
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">AI Intelligence Summary</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Crisp insights tailored for quick reading</p>
                  </div>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {article.ai_summary || article.description || "No summary available for this intelligence report."}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                 <a 
                   href={article.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                 >
                   <ExternalLink size={14} />
                   Original Source
                 </a>

                 <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={onClose}
                      className="flex-grow md:flex-grow-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      Close
                    </button>
                    <Link 
                      href={`/news/${article.slug || article.id}`}
                      className="flex-grow md:flex-grow-0 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                      Read Full Analysis
                      <ArrowRight size={14} />
                    </Link>
                 </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
