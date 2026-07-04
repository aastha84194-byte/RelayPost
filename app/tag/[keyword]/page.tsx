import React from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { getArticlesByKeyword } from '@/lib/articles';
import { Article } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';

export default async function TagPage({ params }: { params: Promise<{ keyword: string }> }) {
  const keyword = (await params).keyword;
  const decodedKeyword = decodeURIComponent(keyword).replace(/-/g, ' ');
  const { items: articles } = await getArticlesByKeyword(decodedKeyword, 1, 50);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0f172a] transition-colors duration-300 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-indigo-600 to-brand rounded-[2rem] text-white flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                   <Sparkles size={24} className="text-white" />
                </div>
                <div className="text-left">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">Intelligence Filter</span>
                   <p className="text-sm font-bold text-white">Keyword Tag</p>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none mt-2">
                 #{decodedKeyword}
              </h1>
              <p className="mt-4 text-indigo-100 max-w-lg mx-auto text-sm leading-relaxed">
                 Discover {articles.length} curated intelligence briefings related to this specific topic.
              </p>
           </div>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((item: Article, i: number) => (
              <Link 
                key={`${item.id}-${i}`} 
                href={`/${item.category_name?.toLowerCase().replace(/ /g, '-') || 'general'}/${item.slug}`}
                className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full"
              >
                <div className="h-64 relative overflow-hidden shrink-0">
                  <Image 
                    src={item.hero_image || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60"} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized
                    className="object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6">
                     <span className="px-4 py-1.5 bg-brand text-[9px] font-black uppercase tracking-widest text-white rounded-full shadow-lg">
                        {item.category_name || 'INTELLIGENCE'}
                     </span>
                  </div>
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="font-black text-slate-900 dark:text-white text-xl mb-4 leading-tight group-hover:text-brand transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-8 flex-grow">
                    {item.excerpt || item.subtitle}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-brand transition-colors">Read Analysis</span>
                     <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                        <ArrowRight size={16} />
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8">
               <Sparkles size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No intelligence found.</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">We couldn't find any articles tagged with #{decodedKeyword}. Try exploring other topics or check back later.</p>
            <div className="pt-8">
               <Link href="/" className="px-8 py-4 bg-brand text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-brand-dark transition-colors inline-block shadow-lg">
                  Return to Dashboard
               </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
