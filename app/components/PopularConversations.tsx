"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Article } from '@/lib/types';
import Link from 'next/link';
import { getCategorySlugForArticle } from '@/lib/categoryMapping';

export default function PopularConversations({ articles = [] }: { articles?: Article[] }) {
  const displayItems = articles.length > 0 
    ? articles.map(a => ({ title: a.title, slug: a.slug, listeners: `${a.views_count || Math.floor(Math.random() * 50) + 10} Active readers`, cat: getCategorySlugForArticle(a.category_name) }))
    : [];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:shadow-none transition-colors duration-300">
      <h3 className="text-lg font-bold text-dark-bg mb-5 dark:text-white transition-colors duration-300">Popular Conversations</h3>
      <div className="flex flex-col gap-5">
        {displayItems.length > 0 ? (
          displayItems.map((item, i) => (
            <Link href={`/${item.cat}/${item.slug}`} key={i}>
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, type: "spring", stiffness: 100 }}
                whileHover={{ x: 8 }}
                className="flex gap-4 items-start group cursor-pointer"
              >
                <span className="text-3xl font-black text-[#e0e7ff] group-hover:text-brand transition-colors">{i+1}</span>
                <div>
                  <h4 className="font-bold text-dark-bg text-sm leading-snug group-hover:text-brand transition-colors dark:text-white line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 group-hover:text-gray-700 transition-colors dark:text-slate-400">
                    <User size={10} /> {item.listeners}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))
        ) : (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-start animate-pulse">
              <div className="w-6 h-8 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

