"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { getCategorySlugForArticle } from '@/lib/categoryMapping';
import { motion } from 'framer-motion';

export default function ExpertAnalysis({ articles }: { articles: Article[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<1 | -1>(-1); // -1 is left
  const isHovered = useRef(false);
  const isPaused = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const setWidth = scrollRef.current.scrollWidth / 3;
      scrollRef.current.scrollLeft = setWidth;
    }
  }, [articles]);

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp: number;

    const animateScroll = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (scrollRef.current) {
        if (!isHovered.current && !isPaused.current) {
          const speed = 0.05 * deltaTime;
          scrollRef.current.scrollLeft += speed * direction;
        }

        const { scrollLeft, scrollWidth } = scrollRef.current;
        const setWidth = scrollWidth / 3;

        if (scrollLeft >= setWidth * 2) {
           scrollRef.current.scrollLeft -= setWidth;
        } else if (scrollLeft <= 0) {
           scrollRef.current.scrollLeft += setWidth;
        }
      }

      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [direction]);

  const changeDirectionAndScroll = (newDirection: 'left' | 'right') => {
    setDirection(newDirection === 'left' ? -1 : 1);
    
    isPaused.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => (isPaused.current = false), 800);

    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({ 
        left: newDirection === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaX > 0 || e.deltaY > 0) {
      setDirection(1);
    } else if (e.deltaX < 0 || e.deltaY < 0) {
      setDirection(-1);
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
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-dark-bg border-l-4 border-[#4f46e5] pl-3 dark:text-white transition-colors duration-300">Expert Analysis</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => changeDirectionAndScroll('left')}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors shadow-sm ${direction === -1 ? 'bg-brand text-white border-brand dark:bg-brand dark:text-white dark:border-brand' : 'bg-white border-gray-200 text-gray-500 hover:text-brand dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:shadow-none'}`}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => changeDirectionAndScroll('right')}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors shadow-sm ${direction === 1 ? 'bg-brand text-white border-brand dark:bg-brand dark:text-white dark:border-brand' : 'bg-white border-gray-200 text-gray-500 hover:text-brand dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:shadow-none'}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden w-full relative">
        <div 
          ref={scrollRef}
          onMouseEnter={() => (isHovered.current = true)}
          onMouseLeave={() => (isHovered.current = false)}
          onWheel={handleWheel}
          className="flex gap-4 overflow-x-auto hide-scrollbar"
        >
          {displayArticles.map((item, i) => (
            <Link 
              key={`${item.id}-${i}`} 
              href={`/${getCategorySlugForArticle(item.category_name)}/${item.slug}`}
              className="w-[300px] shrink-0 bg-white p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group dark:bg-slate-900 dark:border-slate-800 dark:shadow-none"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-slate-100 dark:border-slate-800 transition-colors duration-300">
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
                  <h4 className="font-bold text-[13px] text-dark-bg dark:text-white transition-colors duration-300">Expert Advisor</h4>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider dark:text-slate-400 transition-colors duration-300">{item.category_name || 'Analysis'}</p>
                </div>
              </div>
              <h3 className="font-bold text-dark-bg mb-3 text-[15px] leading-tight group-hover:text-brand transition-colors line-clamp-2 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed dark:text-slate-400 transition-colors duration-300">
                {item.excerpt || item.subtitle}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
