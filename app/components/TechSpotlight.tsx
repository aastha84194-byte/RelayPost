"use client";
import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function TechSpotlight() {
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-dark-bg mb-4 border-l-4 border-[#4f46e5] pl-3">Tech Spotlight</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">

        {/* Large Featured Spotlight */}
        <div className="md:col-span-3 relative rounded-none md:rounded-xl overflow-hidden min-h-[300px] group shadow-md -mx-4 md:mx-0">
          <div className="absolute inset-0">
            <Image src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60" alt="Spotlight" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <span className="inline-block px-3 py-1 bg-[#4f46e5] text-[10px] font-bold text-white rounded-full mb-3 tracking-wider">GRAPHICS & TECH</span>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight max-w-[90%]">Can Artificial Intelligence Ever Truly Be Creative?</h3>
            <p className="text-gray-300 text-xs md:text-sm mb-4 line-clamp-2 max-w-[90%]">The shift from bits to qubits represents more than a speed upgrade - it&apos;s a fundamental change in...</p>
            <button className="bg-[#4f46e5] hover:bg-[#3730a3] text-white px-5 py-2 rounded-full text-xs md:text-sm font-medium inline-flex items-center gap-1.5 transition-colors shadow-lg">
              Read More
            </button>
          </div>
        </div>

        {/* Side Stack Spotlight */}
        <div className="md:col-span-2 flex flex-col justify-between gap-4">
          {[
            { title: "Cloud Gaming: The End of Consoles?", desc: "Cloud gaming allows users to stream high-end console and PC titles directly to their...", time: "13 HOURS AGO", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60" },
            { title: "The Zero Trust Era of Cybersecurity", desc: "Modern security infrastructures are shifting towards \"never trust, always verify\"...", time: "16 HOURS AGO", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60" },
            { title: "Data Sovereignty in the Age of Big Tech", desc: "Nations are passing stricter laws to ensure their citizens' data remains within national...", time: "18 HOURS AGO", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60" }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-center group cursor-pointer hover:bg-gray-50 md:p-2 rounded-xl transition-all duration-300">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl relative overflow-hidden flex-shrink-0 shadow-sm">
                <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-dark-bg text-xs md:text-sm leading-snug group-hover:text-brand transition-colors mb-0.5 md:mb-1">{item.title}</h4>
                <p className="text-[10px] md:text-[11px] text-gray-500 line-clamp-2 mb-1 md:mb-1.5">{item.desc}</p>
                <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase">{item.time}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
