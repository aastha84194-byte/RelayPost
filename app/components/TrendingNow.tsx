"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TrendingNow({ articles }: { articles: Article[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<1 | -1>(-1); // -1 is left
  const isHovered = useRef(false);
  const isPaused = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      // Start in the middle set to allow scrolling left immediately
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
        if (!isHovered.current && !isPaused.current && isTabVisible && isIntersecting) {
          const speed = 0.05 * deltaTime; // 50px per second
          scrollRef.current.scrollLeft += speed * direction;
        }

        // Handle infinite loop even when hovering/scrolling manually
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
  }, [direction, isTabVisible, isIntersecting]);

  const changeDirectionAndScroll = (newDirection: 'left' | 'right') => {
    setDirection(newDirection === 'left' ? -1 : 1);
    
    // Pause auto-scroll to allow smooth scrolling to finish
    isPaused.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => (isPaused.current = false), 800);

    if (scrollRef.current) {
      const scrollAmount = 300;
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

  // Duplicate for seamless marquee
  const displayArticles = [...articles, ...articles, ...articles];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-dark-bg border-l-4 border-[#4f46e5] pl-3 dark:text-white transition-colors duration-300">Trending Now</h2>
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
              className="w-[200px] md:w-[240px] shrink-0 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-lg overflow-hidden group dark:bg-slate-900 dark:border-slate-800 dark:shadow-none"
            >
              <div className="h-28 relative overflow-hidden">
                <Image
                  src={item.hero_image || "/anne-nygard-x07ELaNFt34-unsplash.jpg"}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized={true}
                />
              </div>
              <div className="p-3 bg-white group-hover:bg-gray-50 transition-colors flex-grow dark:bg-slate-900 dark:group-hover:bg-slate-800/50">
                <h3 className="font-bold text-dark-bg text-sm mb-1 leading-snug group-hover:text-brand transition-colors line-clamp-2 dark:text-white">
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
