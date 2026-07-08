"use client";
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CategoryArticleSectionProps {
  title: string;
  slug: string;
  articles: Article[];
  layout?: 'marquee' | 'grid';
}

export default function CategoryArticleSection({ title, slug, articles, layout = 'marquee' }: CategoryArticleSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
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

  let marqueeArticles = [...articles];
  if (marqueeArticles.length > 0) {
    while (marqueeArticles.length < 12) {
      marqueeArticles = [...marqueeArticles, ...articles];
    }
  }
  // Use 3 sets for seamless bidirectional infinite scroll
  const displayArticles = [...marqueeArticles, ...marqueeArticles, ...marqueeArticles];

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
        if (!isHovered.current && !isPaused.current && isTabVisible && isIntersecting) {
          const speed = 0.03 * deltaTime; // slightly slower for CategoryArticleSection
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
  }, [direction, isTabVisible, isIntersecting]);

  const changeDirectionAndScroll = (newDirection: 'left' | 'right') => {
    setDirection(newDirection === 'left' ? -1 : 1);
    
    isPaused.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => (isPaused.current = false), 800);

    if (scrollRef.current) {
      const scrollAmount = 324;
      scrollRef.current.scrollBy({ 
        left: newDirection === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (layout === 'grid') return;
    if (e.deltaX > 0 || e.deltaY > 0) {
      setDirection(1);
    } else if (e.deltaX < 0 || e.deltaY < 0) {
      setDirection(-1);
    }
  };

  if (articles.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-6"
    >
      <div className="flex items-center justify-between mb-3 md:mb-6 px-1">
        <div>
           <h2 className="text-lg sm:text-xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">{title}</h2>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
           {layout === 'marquee' && (
             <>
               <Link 
                href={`/categories/${slug}`}
                className="group flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
               >
                Explore More <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
               </Link>
               <div className="hidden md:flex gap-2">
                <button 
                  onClick={() => changeDirectionAndScroll('left')}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-sm ${direction === -1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 dark:bg-slate-800 dark:border-slate-700 dark:shadow-none'}`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => changeDirectionAndScroll('right')}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-sm ${direction === 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 dark:bg-slate-800 dark:border-slate-700 dark:shadow-none'}`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
             </>
           )}
        </div>
      </div>
      
      {layout === 'marquee' ? (
        <div className="relative group/scroll w-full pb-2 scroll-smooth">
          <div 
            ref={scrollRef}
            onMouseEnter={() => (isHovered.current = true)}
            onMouseLeave={() => (isHovered.current = false)}
            onWheel={handleWheel}
            className="flex gap-6 overflow-x-auto hide-scrollbar"
          >
            {displayArticles.map((item, i) => (
              <Link 
                key={`${item.id}-${i}`} 
                href={`/${item.category_name ? item.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general'}/${item.slug}`}
                className="w-[230px] md:w-[280px] shrink-0 bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className="h-40 md:h-44 relative overflow-hidden">
                  <Image 
                    src={item.hero_image || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60"} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-white rounded-full">
                        {new Date(item.published_at || "").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                  </div>
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-black text-slate-800 dark:text-white text-sm md:text-lg mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.excerpt || item.subtitle}
                    </span>
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Read Intelligence</span>
                     <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ArrowUpRight size={14} />
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {articles.map((item, i) => (
            <Link 
              key={item.id} 
              href={`/${item.category_name ? item.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general'}/${item.slug}`}
              className="w-full shrink-0 bg-white dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col"
            >
              <div className="h-48 md:h-56 relative overflow-hidden">
                <Image 
                  src={item.hero_image || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60"} 
                  alt={item.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 400px"
                  unoptimized
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-white rounded-full">
                      {new Date(item.published_at || "").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                   </span>
                </div>
              </div>
              <div className="p-5 md:p-6 flex-grow flex flex-col">
                <h3 className="font-black text-slate-800 dark:text-white text-lg mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 flex-grow">
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.excerpt || item.subtitle}
                  </span>
                </p>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Read Intelligence</span>
                   <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowUpRight size={14} />
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.section>
  );
}
