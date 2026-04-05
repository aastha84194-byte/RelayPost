"use client";
import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TrendingNow() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-dark-bg border-l-4 border-[#4f46e5] pl-3">Trending Now</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand transition-colors"><ChevronLeft size={18} /></button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand transition-colors"><ChevronRight size={18} /></button>
        </div>
      </div>
      
      <div className="overflow-hidden w-full relative pb-4">
        <div className="animate-marquee-reverse gap-0">
        {[
          { title: "Market Volatility: What Investors Need", img: "/anne-nygard-x07ELaNFt34-unsplash.jpg", time: "12 hours ago" },
          { title: "The Renaissance of Digital Art", img: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&auto=format&fit=crop&q=60", time: "13 hours ago" },
          { title: "Gene Editing Breakthroughs", img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=60", time: "17 hours ago" },
          { title: "Beyond the Chip: Hardware Design", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60", time: "18 hours ago" },
          { title: "Market Volatility: What Investors Need", img: "/anne-nygard-x07ELaNFt34-unsplash.jpg", time: "12 hours ago" },
          { title: "The Renaissance of Digital Art", img: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800&auto=format&fit=crop&q=60", time: "13 hours ago" },
          { title: "Gene Editing Breakthroughs", img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=60", time: "17 hours ago" },
          { title: "Beyond the Chip: Hardware Design", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60", time: "18 hours ago" }
        ].map((item, i) => (
          <div key={i} className="w-[200px] md:w-[240px] shrink-0 bg-white border border-gray-200 overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-2 active:-translate-y-3 hover:shadow-xl hover:z-10 transition-all duration-300">
            <div className="h-28 relative overflow-hidden">
              <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-3 bg-white group-hover:bg-gray-50 transition-colors flex-grow">
              <h3 className="font-bold text-dark-bg text-sm mb-1 leading-snug group-hover:text-brand transition-colors">{item.title}</h3>
              <p className="text-xs text-gray-400 mt-2">{item.time}</p>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
