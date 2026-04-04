"use client";
import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function LatestInsights() {
  const insights = [
    { title: "Urban Evolution: How Smart Cities Are Adapting", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60", time: "16 HOURS AGO" },
    { title: "The Remote Work Paradox", img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60", time: "13 HOURS AGO" },
    { title: "Beyond the Chip: The Future of Hardware Design", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60", time: "12 HOURS AGO" },
    { title: "Urban Evolution: How Smart Cities Are Adapting", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60", time: "16 HOURS AGO" },
    { title: "The Remote Work Paradox", img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60", time: "13 HOURS AGO" },
    { title: "Beyond the Chip: The Future of Hardware Design", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60", time: "12 HOURS AGO" }
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold text-dark-bg mb-4 border-l-4 border-[#4f46e5] pl-3">Latest Insights</h2>
      
      <div className="overflow-hidden w-full relative pb-4">
        <div className="animate-marquee gap-0">
          {insights.map((item, i) => (
            <div key={i} className="w-[300px] shrink-0 bg-white p-4 border border-gray-200 overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-2 active:-translate-y-3 hover:shadow-xl hover:z-10 transition-all duration-300">
              <div className="h-36 relative overflow-hidden mb-3">
                <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-bold text-dark-bg text-sm mb-2 leading-snug group-hover:text-brand transition-colors">{item.title}</h3>
              <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mt-auto">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
