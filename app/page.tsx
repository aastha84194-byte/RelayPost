"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Play, ChevronLeft, ChevronRight, BarChart2, TrendingUp, TrendingDown, User } from "lucide-react";
import { motion } from "framer-motion";
import ParticleEffect from "./components/ParticleEffect";
import InteractiveHero from "./components/render/InteractiveHero";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN - 8 columns wide */}
        <div className="lg:col-span-8 flex flex-col gap-10">

          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden min-h-[500px] group shadow-2xl bg-[#0B0E23]"
          >
            {/* Interactive Neural Core */}
            <InteractiveHero />

            {/* Magnetic Particles */}
            <ParticleEffect mode="attract" />

            <div className="absolute bottom-0 left-0 right-0 p-10 z-30 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="inline-block px-3 py-1 bg-brand text-[10px] font-bold text-white mb-6 uppercase tracking-widest rounded shadow-lg shadow-brand/20 pointer-events-auto"
              >
                QUANTUM INTELLIGENCE
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-[1.1] max-w-2xl pointer-events-auto drop-shadow-2xl">
                The Quantum Frontier: Reshaping Reality
              </h1>
              <p className="text-gray-300 mb-8 max-w-xl text-sm md:text-base pointer-events-auto leading-relaxed">
                The shift from bits to qubits represents a fundamental change in how we process the universe&apos;s most complex problems.
              </p>
              <button className="bg-white hover:bg-brand hover:text-white text-dark-bg px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 pointer-events-auto group">
                Deep Dive Analysis
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.section>


          {/* Trending Now */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark-bg">Trending Now</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand transition-colors"><ChevronLeft size={18} /></button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>

            <div className="overflow-hidden w-full relative pb-4">
              <div className="animate-marquee-reverse gap-2">
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

          {/* Interactive Data */}
          <section>
            <h2 className="text-2xl font-bold text-dark-bg mb-1">Interactive Data</h2>
            <p className="text-sm text-gray-500 mb-4">Live market trends with animated insights</p>

            <div className="overflow-hidden w-full relative">
              <div className="animate-marquee gap-2">
                {[
                  { title: "Global Tech Index", val: "$1,139.54", icon: TrendingUp, color: "text-brand", bg: "bg-brand/10", perc: "+9.05" },
                  { title: "Renewable Energy", val: "$89.55", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", perc: "+90.24" },
                  { title: "Cryptocurrency Cap", val: "$1,385.64", icon: TrendingDown, color: "text-purple-500", bg: "bg-purple-500/10", perc: "-90:24" },
                  { title: "Global Tech Index", val: "$1,139.54", icon: TrendingUp, color: "text-brand", bg: "bg-brand/10", perc: "+9.05" },
                  { title: "Renewable Energy", val: "$89.55", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", perc: "+90.24" },
                  { title: "Cryptocurrency Cap", val: "$1,385.64", icon: TrendingDown, color: "text-purple-500", bg: "bg-purple-500/10", perc: "-90:24" }
                ].map((chart, i) => (
                  <div key={i} className="w-[280px] shrink-0 bg-white p-4 border border-gray-200 relative overflow-hidden group cursor-pointer hover:bg-gray-50 hover:-translate-y-2 active:-translate-y-3 hover:shadow-xl hover:z-10 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <h4 className="text-sm font-bold text-dark-bg">{chart.title}</h4>
                        <p className="text-xs text-gray-500">{chart.val}</p>
                      </div>
                      <div className={`p-1.5 rounded-full ${chart.bg} ${chart.color} group-hover:scale-110 transition-transform`}>
                        <chart.icon size={14} />
                      </div>
                    </div>
                    <svg viewBox="0 0 100 30" className="w-full h-12 stroke-current overflow-visible">
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, delay: (i % 3) * 0.2 }}
                        d={i % 2 === 0 ? "M0,20 Q10,10 20,25 T40,15 T60,25 T80,5 T100,20" : "M0,10 Q20,25 40,5 T70,25 T100,10"}
                        fill="none"
                        className={chart.color}
                        strokeWidth="2"
                      />
                    </svg>
                    <p className={`text-xs text-right mt-2 font-medium ${chart.color}`}>{chart.perc}%</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Community Pulse & Trending Split */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-10">

            {/* Expert Analysis */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-dark-bg">Expert Analysis</h2>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand hover:border-brand transition-colors"><ChevronLeft size={18} /></button>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand hover:border-brand transition-colors"><ChevronRight size={18} /></button>
                </div>
              </div>

              <div className="overflow-hidden w-full relative">
                <div className="animate-marquee-reverse gap-2 pb-4">
                  {[
                    { name: "Dr. Anya Sharma", role: "Author/Scholar", title: "The Future of AI Regulation", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" },
                    { name: "Dr. Aris Thorne", role: "Author/Scholar", title: "Can Artificial Intelligence Features Feel?", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60" },
                    { name: "Dr. Vesa Oas", role: "Author/Scholar", title: "The False Promises of Bio-Computing", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60" },
                    { name: "Dr. Anya Sharma", role: "Author/Scholar", title: "The Future of AI Regulation", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" },
                    { name: "Dr. Aris Thorne", role: "Author/Scholar", title: "Can Artificial Intelligence Features Feel?", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&auto=format&fit=crop&q=60" },
                    { name: "Dr. Vesa Oas", role: "Author/Scholar", title: "The False Promises of Bio-Computing", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60" }
                  ].map((expert, i) => (
                    <div
                      key={i}
                      className="w-[300px] shrink-0 bg-white p-5 border border-gray-200 hover:bg-gray-50 flex-col group cursor-pointer hover:-translate-y-2 active:-translate-y-3 hover:shadow-xl hover:z-10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Image src={expert.img} width={40} height={40} className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform" alt={expert.name} />
                        <div>
                          <h4 className="font-bold text-sm text-dark-bg">{expert.name}</h4>
                          <p className="text-xs text-gray-500">{expert.role}</p>
                        </div>
                      </div>
                      <h3 className="font-bold text-dark-bg mb-2 leading-tight group-hover:text-brand transition-colors">{expert.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-3">
                        The shift from bits to qubits represents more than a speed upgrade; a fundamental shift in processing complex systems...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Tech Spotlight */}
            <section>
              <h2 className="text-2xl font-bold text-dark-bg mb-4">Tech Spotlight</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

                {/* Large Featured Spotlight */}
                <div className="md:col-span-3 relative rounded-xl overflow-hidden min-h-[300px] group shadow-md">
                  <div className="absolute inset-0">
                    <Image src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60" alt="Spotlight" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 p-5">
                    <span className="inline-block px-2.5 py-1 bg-brand text-xs font-semibold text-white rounded mb-3">AI & SOCIETY</span>
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">Can Artificial Intelligence Ever Truly Be Creative?</h3>
                    <p className="text-gray-300 text-xs mb-3 line-clamp-2">The debate around AI creativity sparks questions not just about the technology, but our definition of origin and inspiration.</p>
                    <button className="bg-brand/90 hover:bg-brand text-white px-4 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors">
                      Read More <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Side Stack Spotlight */}
                <div className="md:col-span-2 flex flex-col justify-between gap-4">
                  {[
                    { title: "Cloud Gaming: The End of Consoles?", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60" },
                    { title: "The Zero Trust Era of Cybersecurity", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60" },
                    { title: "Data Sovereignty in Big Tech", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-center group cursor-pointer p-2.5 rounded-xl border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <div className="w-24 h-16 rounded-lg relative overflow-hidden flex-shrink-0 shadow-sm">
                        <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-dark-bg text-sm leading-snug group-hover:text-brand transition-colors">{item.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1">11 hours ago</p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN - Sidebar - 4 columns wide */}
        <div className="lg:col-span-4 flex flex-col gap-8">

          {/* Popular Conversations */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-dark-bg mb-5">Popular Conversations</h3>
            <div className="flex flex-col gap-5">
              {[
                { title: "Market Volatility: The End of Consoles?", listeners: "Active readers" },
                { title: "The Renaissance of Digital Art", listeners: "Active readers" },
                { title: "Beyond The Chip: The Future of Hardware Design", listeners: "Active readers" },
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
                  <span className="text-3xl font-black text-brand/30 group-hover:text-brand transition-colors">{i + 1}</span>
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

          {/* Global Topics */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-dark-bg mb-4">Global Topics</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "#trend_hashtags", "#social_hashtags", "#trending_hashtags",
                "#global_topics", "#most_on_trends", "#world_topics"
              ].map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 bg-brand/5 text-brand rounded-full cursor-pointer hover:bg-brand hover:text-white transition-colors border border-brand/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Go Unlimited Premium Card */}
          <div className="rounded-2xl p-8 bg-gradient-to-br from-[#1b2252] to-[#2a3891] relative overflow-hidden shadow-xl text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3">Go Unlimited</h3>
              <p className="text-sm text-blue-100/80 mb-6 leading-relaxed">
                Exclusive content and exclusive content with your premium companion. Read articles, continue to share exclusive content.
              </p>
              <button className="bg-brand hover:bg-white hover:text-brand text-white w-full py-2.5 rounded-full font-medium transition-colors shadow-lg">
                Subscribe Now
              </button>
            </div>
          </div>

          {/* The Briefing Newsletter */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm bg-gradient-to-b from-white to-gray-50/50">
            <h3 className="text-lg font-bold text-dark-bg mb-4">The Briefing</h3>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Input your email"
                className="w-full bg-gray-100/80 border border-gray-200 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-brand/50 focus:bg-white transition-colors"
              />
              <button className="bg-brand hover:bg-brand-dark text-white w-full py-2.5 rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          {/* Latest Insights */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark-bg">Latest Insights</h3>
              <div className="flex gap-2">
                <button className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand transition-colors"><ChevronLeft size={14} /></button>
                <button className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:text-brand transition-colors"><ChevronRight size={14} /></button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { title: "Urban Evolution: How Smart Cities Are Adapting", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop&q=60" },
                { title: "The Remote Work Paradox", img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60" },
                { title: "Beyond the Chip: The Future of Hardware Design", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.4, type: "spring", stiffness: 150 }}
                  className="flex gap-4 items-center group cursor-pointer bg-white p-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="w-24 h-20 rounded-lg relative overflow-hidden flex-shrink-0">
                    <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-dark-bg text-sm leading-snug group-hover:text-brand transition-colors">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">This is a short preview text that showcases the insight content...</p>
                    <p className="text-[9px] text-gray-400 mt-1">16 hours ago</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
