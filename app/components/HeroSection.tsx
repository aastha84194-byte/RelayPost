"use client";
import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ParticleEffect from './ParticleEffect';
import { Article } from '@/lib/types';
import Link from 'next/link';

export default function HeroSection({ article }: { article: Article | null }) {
  if (!article) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden min-h-[460px] group shadow-xl"
    >
      <div className="absolute inset-0">
        <Image 
          src={article.hero_image || "/jeremy-thomas-E0AHdsENmDg-unsplash.jpg"} 
          alt={article.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
      </div>
      
      <ParticleEffect />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 pointer-events-none">
        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white mb-4 border border-white/20 pointer-events-auto">
          {article.category_name || "FEATURED"}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight max-w-2xl pointer-events-auto">
          {article.title}
        </h1>
        <p className="text-gray-200 mb-6 max-w-2xl text-sm md:text-base pointer-events-auto">
          {article.excerpt || article.subtitle}
        </p>
        <Link 
          href={`/article/${article.slug}`}
          className="bg-brand hover:bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium inline-flex items-center gap-2 transition-colors shadow-lg shadow-brand/30 pointer-events-auto"
        >
          Read More
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.section>
  );
}
