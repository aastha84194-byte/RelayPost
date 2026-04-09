"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ExpertAnalysis({ articles }: { articles: Article[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (articles.length === 0) return null;

  // Duplicate for marquee loop
  const displayArticles = [...articles, ...articles, ...articles];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="pause-on-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-dark-bg border-l-4 border-[#4f46e5] pl-3">Expert Analysis</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand transition-colors shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand transition-colors shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden w-full relative">
        <div 
          ref={scrollRef}
          className="flex gap-4 animate-marquee-reverse no-scrollbar"
        >
          {displayArticles.map((item, i) => (
            <Link 
              key={`${item.id}-${i}`} 
              href={`/article/${item.slug}`}
              className="w-[300px] shrink-0 bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-slate-100">
                    <Image 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author_id || i}`} 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      alt="Author" 
                      unoptimized
                    />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-dark-bg">Expert Advisor</h4>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">{item.category_name || 'Analysis'}</p>
                </div>
              </div>
              <h3 className="font-bold text-dark-bg mb-3 text-[15px] leading-tight group-hover:text-brand transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                {item.excerpt || item.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
