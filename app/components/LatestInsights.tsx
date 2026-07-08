"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LatestInsights({ articles }: { articles: Article[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 is right (marquee default)
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
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-dark-bg border-l-4 border-[#4f46e5] pl-3 dark:text-white transition-colors duration-300">Latest Insights</h2>
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
      
      <div className="overflow-hidden w-full relative pb-1">
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
              href={`/${item.category_name ? item.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general'}/${item.slug}`}
              className="w-[300px] shrink-0 bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group dark:bg-slate-900 dark:border-slate-800 dark:shadow-none"
            >
              <div className="h-36 relative overflow-hidden mb-3 rounded-md">
                <Image 
                  src={item.hero_image || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60"} 
                  alt={item.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-bold text-dark-bg text-sm mb-2 leading-snug group-hover:text-brand transition-colors line-clamp-2 dark:text-white">
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
