"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LatestInsights({ articles }: { articles: Article[] }) {
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
      transition={{ duration: 0.5, delay: 0.1 }}
      className="pause-on-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-dark-bg border-l-4 border-[#4f46e5] pl-3">Latest Insights</h2>
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
      
      <div className="overflow-hidden w-full relative pb-1">
        <div 
          ref={scrollRef}
          className="flex gap-4 animate-marquee no-scrollbar"
        >
          {displayArticles.map((item, i) => (
            <Link 
              key={`${item.id}-${i}`} 
              href={`/${item.category_name?.toLowerCase().replace(/ /g, '-') || 'general'}/${item.slug}`}
              className="w-[300px] shrink-0 bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="h-36 relative overflow-hidden mb-3 rounded-md">
                <Image 
                  src={item.hero_image || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60"} 
                  alt={item.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-bold text-dark-bg text-sm mb-2 leading-snug group-hover:text-brand transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-auto">
                {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Dec 2024'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
