"use client";

import React from "react";
import Image from "next/image";
import { Search, Database, Globe, Network } from "lucide-react";

export default function AboutPage() {
  const council = [
    {
      name: "Dr. Alistair Thorne",
      role: "CHIEF STRATEGIST",
      focus: "Post-Border Economics and the restructuring of sovereign wealth.",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400"
    },
    {
      name: "Elena Rodriguez",
      role: "DIRECTOR OF INTELLIGENCE",
      focus: "Maritime Law and the strategic defense of global shipping lanes.",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400"
    },
    {
      name: "Marcus Chen",
      role: "SENIOR GLOBAL ANALYST",
      focus: "Algorithmic Geopolitics and the influence of AI on democratic stability.",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400"
    },
    {
      name: "Sarah Van der Berg",
      role: "HEAD OF MARKETS",
      focus: "Commodity Weaponization and the future of energy independence.",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400"
    }
  ];

  return (
    <div className="pt-32 pb-24 w-full min-h-screen">
      
      {/* Header */}
      <section className="text-center px-8 max-w-4xl mx-auto mb-20">
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
          Our Mission
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mt-6 dark:text-white mb-6">
          Our Pursuit of <br/> <span className="text-primary dark:text-indigo-500 italic font-medium">Context</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          At RelayPost, we bridge the gap between historical precedent and future volatility. Our methodology transcends the news cycle to archive historical relevance within the shifting landscape of modern geopolitics.
        </p>
      </section>

      {/* Bento Grid Features */}
      <section className="px-8 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
        
        {/* Ethos */}
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl h-[400px] flex items-end p-10">
          <Image 
            src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200" 
            fill className="object-cover" alt="Circuit board" unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-3">The Editorial Ethos</h2>
            <p className="text-slate-300 max-w-lg leading-relaxed">
              Our lens is calibrated for precision. We combine human intuition with algorithmic rigor to extract signal from noise.
            </p>
          </div>
        </div>

        {/* Archival Analysis */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-10 flex flex-col justify-end border border-indigo-100 dark:border-indigo-800/30">
          <Database size={32} className="text-indigo-600 dark:text-indigo-400 mb-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Deep Archival Analysis</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Every intelligence piece is cross-referenced against five decades of diplomatic records and economic cycles to provide true depth.
          </p>
        </div>

        {/* Post-Border */}
        <div className="bg-primary dark:bg-[#2e20b3] rounded-3xl p-10 flex flex-col justify-center relative overflow-hidden text-white">
          <div className="absolute top-8 right-8 flex gap-1">
            <span className="w-2 h-2 rounded-full bg-white/30"></span>
            <span className="w-2 h-2 rounded-full bg-white/30"></span>
            <span className="w-2 h-2 rounded-full bg-white/30"></span>
          </div>
          <Network size={32} className="mb-8 text-indigo-200" />
          <h2 className="text-2xl font-bold mb-3">Post-Border Intelligence</h2>
          <p className="text-indigo-100 text-sm leading-relaxed max-w-xs">
            In a globalized economy, borders are but one layer of analysis. We track the flow of capital, data, and influence across digital realms.
          </p>
        </div>

        {/* Unbiased Resilience */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Unbiased Resilience</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
              RelayPost operates with a decentralized editorial board, ensuring that no single geographical or political bias color our intelligence. We report on reality, not agendas.
            </p>
            <div className="flex gap-12">
              <div>
                <p className="text-3xl font-bold text-primary dark:text-indigo-400">124</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Nations Tracked</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary dark:text-indigo-400">2.4m</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Datapoints / Day</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64 h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-slate-700">
            <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 w-32 h-32" />
          </div>
        </div>

      </section>

      {/* Intelligence Council */}
      <section className="px-8 max-w-screen-xl mx-auto mb-32 bg-slate-50 dark:bg-slate-900/50 py-20 rounded-[3rem]">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">The Intelligence Council</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            A multidisciplinary collective of specialists dedicated to clarity in a complex world.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-10">
          {council.map((member, i) => (
            <div key={i} className="flex flex-col group">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-800">
                <Image src={member.img} alt={member.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="font-bold text-lg dark:text-white">{member.name}</h3>
              <p className="text-primary dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1 mb-3">{member.role}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed italic border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                "{member.focus}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-8 mb-20 max-w-xl mx-auto">
        <h2 className="text-3xl font-bold dark:text-white mb-4">Ready for the Full Briefing?</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Join over 50,000 intelligence professionals who rely on RelayPost for critical context and strategic foresight.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-primary hover:bg-[#2c1ea3] text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 transition-all">
            START MY SUBSCRIPTION
          </button>
          <button className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-8 py-3.5 rounded-full font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all">
            VIEW SAMPLE BRIEFING
          </button>
        </div>
      </section>

    </div>
  );
}
