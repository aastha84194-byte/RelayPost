"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TrendingNow({ articles }: { articles: Article[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (articles.length === 0) return null;

  // Duplicate for seamless marquee
  const displayArticles = [...articles, ...articles, ...articles];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="pause-on-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-dark-bg border-l-4 border-[#4f46e5] pl-3">Trending Now</h2>
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
          className="flex gap-4 animate-marquee-reverse no-scrollbar"
        >
          {displayArticles.map((item, i) => (
            <Link 
              key={`${item.id}-${i}`} 
              href={`/${item.category_name?.toLowerCase().replace(/ /g, '-') || 'general'}/${item.slug}`}
              className="w-[200px] md:w-[240px] shrink-0 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden group"
            >
              <div className="h-28 relative overflow-hidden">
                <Image 
                  src={item.hero_image || "/anne-nygard-x07ELaNFt34-unsplash.jpg"} 
                  alt={item.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <div className="p-3 bg-white group-hover:bg-gray-50 transition-colors flex-grow">
                <h3 className="font-bold text-dark-bg text-sm mb-1 leading-snug group-hover:text-brand transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
                  {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Dec 2024'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
