import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getArticlesBySection } from '@/lib/articles';
import { Sparkles, BookOpen } from 'lucide-react';
import { getCategorySlugForArticle } from '@/lib/categoryMapping';

export default async function RecommendedArticles() {
  const articles = await getArticlesBySection("Hero");
  const recommended = articles.slice(0, 5);

  if (recommended.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
      <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
        <span className="w-4 h-0.5 bg-indigo-600" />
        Recommended Reads
      </h3>
      <div className="space-y-6">
        {recommended.map((item, i) => (
          <Link 
            key={item.id || i} 
            href={`/${getCategorySlugForArticle(item.category_name)}/${item.slug || item.id}`} 
            className="flex gap-4 group cursor-pointer"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm transition-colors duration-300 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {item.hero_image ? (
                <Image 
                  src={item.hero_image} 
                  alt={item.title || "Thumbnail"} 
                  fill 
                  unoptimized 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <BookOpen size={24} className="text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <div className="space-y-1 flex-1">
              <p className="text-[9px] font-black text-indigo-600 tracking-widest uppercase">
                {item.category_name || 'FEATURED'}
              </p>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                {item.title}
              </h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                 Editor's Pick
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
