"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleEffect from './ParticleEffect';
import { Article } from '@/lib/types';
import Link from 'next/link';

export default function HeroSection({ articles = [] }: { articles?: Article[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (!articles || articles.length === 0) return null;

  const currentArticle = articles[currentIndex];

  return (
    <div className="relative w-full rounded-3xl md:rounded-[2.5rem] overflow-hidden min-h-[360px] md:min-h-[460px] group shadow-xl">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentArticle.id}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0">
            <Image
              src={currentArticle.hero_image || "/jeremy-thomas-E0AHdsENmDg-unsplash.jpg"}
              alt={currentArticle.title}
              fill
              sizes="100vw"
              priority
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
          </div>

          <ParticleEffect />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 z-20 pointer-events-none">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-3xl lg:text-5xl font-black text-white mb-3 md:mb-5 leading-tight tracking-tight max-w-4xl pointer-events-auto"
            >
              {currentArticle.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-200 mb-6 md:mb-8 max-w-2xl text-xs md:text-base lg:text-lg pointer-events-auto line-clamp-2"
            >
              {currentArticle.excerpt || currentArticle.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pointer-events-auto inline-block"
            >
              <Link
                href={`/${currentArticle.category_name?.toLowerCase().replace(/ /g, '-') || 'general'}/${currentArticle.slug}`}
                className="bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-full font-bold text-xs md:text-sm inline-flex items-center gap-2 transition-all shadow-xl shadow-brand/20 active:scale-95 uppercase tracking-widest"
              >
                Read Report
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Indicators */}
      {articles.length > 1 && (
        <div className="absolute bottom-6 right-6 md:right-10 flex gap-2 z-30">
          {articles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
