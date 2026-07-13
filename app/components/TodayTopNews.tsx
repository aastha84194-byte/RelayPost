import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTopNews } from '@/lib/articles';
import { Globe, TrendingUp } from 'lucide-react';

export default async function TodayTopNews() {
  const news = await getTopNews();
  const topNews = news.slice(0, 5);

  if (topNews.length === 0) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
      <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
        <TrendingUp size={14} className="text-indigo-600" />
        Today's Top News
      </h3>
      <div className="space-y-6">
        {topNews.map((item, i) => (
          <Link 
            key={item.id || i} 
            href={`/news/${item.slug || item.id}`} 
            className="flex gap-4 group cursor-pointer"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md dark:shadow-none transition-colors duration-300 relative bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              {item.image_url ? (
                <Image 
                  src={item.image_url} 
                  alt={item.title || "Thumbnail"} 
                  fill 
                  unoptimized 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              ) : (
                <Globe size={24} className="text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-[9px] font-black text-indigo-600 tracking-widest uppercase truncate">
                {item.category || 'TOP NEWS'}
              </p>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                {item.title}
              </h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 min-w-0">
                <Globe size={10} className="text-slate-300 shrink-0" /> <span className="truncate">{item.source_name || 'Global News'}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
