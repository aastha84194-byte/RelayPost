"use client";
import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ExpertAnalysis() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-dark-bg border-l-4 border-[#4f46e5] pl-3">Expert Analysis</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand hover:border-brand transition-colors"><ChevronLeft size={18} /></button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand hover:border-brand transition-colors"><ChevronRight size={18} /></button>
        </div>
      </div>
      
      <div className="overflow-hidden w-full relative">
        <div className="animate-marquee-reverse gap-0 pb-4">
          {[
            { name: "Dr. Anya Sharma", role: "Author & Tech Editor", title: "The Future of AI Regulation", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" },
            { name: "Dr. Anya Sharma", role: "Author & Tech Editor", title: "The Future of AI Computing is Reshaping Reality", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60" },
            { name: "Dr. Vaiza Oes", role: "Author & Researcher", title: "Can Artificial Intelligence Features Feel?", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60" },
            { name: "Dr. Anya Sharma", role: "Author & Tech Editor", title: "The Future of AI Regulation", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" },
            { name: "Dr. Anya Sharma", role: "Author & Tech Editor", title: "The Future of AI Computing is Reshaping Reality", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60" },
            { name: "Dr. Vaiza Oes", role: "Author & Researcher", title: "Can Artificial Intelligence Features Feel?", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60" }
          ].map((expert, i) => (
            <div 
              key={i} 
              className="w-[300px] shrink-0 bg-white p-6 border border-gray-200 overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-2 active:-translate-y-3 hover:shadow-xl hover:z-10 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Image src={expert.img} width={40} height={40} className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform shadow-sm" alt={expert.name} />
                <div>
                  <h4 className="font-bold text-[13px] text-dark-bg">{expert.name}</h4>
                  <p className="text-[11px] text-gray-500">{expert.role}</p>
                </div>
              </div>
              <h3 className="font-bold text-dark-bg mb-3 text-[15px] leading-tight group-hover:text-brand transition-colors">{expert.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                The shift from bits to qubits represents more than a speed upgrade - it&apos;s a fundamental change in processing...
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
