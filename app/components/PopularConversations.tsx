"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export default function PopularConversations() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-dark-bg mb-5">Popular Conversations</h3>
      <div className="flex flex-col gap-5">
        {[
          { title: "Market Volatility: The End of Consoles?", listeners: "45 Active readers" },
          { title: "The Renaissance of Digital Art", listeners: "32 Active readers" },
          { title: "Beyond The Chip: The Future of Hardware Design", listeners: "28 Active readers" },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.25, duration: 0.6, type: "spring", stiffness: 100 }}
            whileHover={{ x: 8 }}
            className="flex gap-4 items-start group cursor-pointer"
          >
            <span className="text-3xl font-black text-[#e0e7ff] group-hover:text-brand transition-colors">{i+1}</span>
            <div>
              <h4 className="font-bold text-dark-bg text-sm leading-snug group-hover:text-brand transition-colors">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 group-hover:text-gray-700 transition-colors">
                <User size={10} /> {item.listeners}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
