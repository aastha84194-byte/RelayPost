"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, MapPin, Mail, Radio, Globe, Rss } from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";


export default function ContactPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    subject: "Editorial Inquiry",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch(`${API_BASE}/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatus("success");
        setFormData({ full_name: "", email: "", subject: "Editorial Inquiry", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="pt-32 pb-24 px-8 max-w-screen-xl mx-auto w-full min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-16">
        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/30">
          Direct Correspondence
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mt-6 dark:text-white mb-6">
          Connect with <br/> <span className="text-primary dark:text-indigo-500 italic font-medium">The Archivists</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          RelayPost maintains a direct line for intelligence inquiries, editorial contributions, and strategic partnerships. Our response team operates on UTC+0 timelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        
        {/* Contact Form */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold dark:text-white mb-2">Dispatch a Message</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">Fields marked for intelligence processing.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <input 
                  type="text" required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="John Doe"
                  className="bg-indigo-50/50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Business Email</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@organization.com"
                  className="bg-indigo-50/50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Subject</label>
              <select 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="bg-indigo-50/50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 dark:text-white focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="Editorial Inquiry">Editorial Inquiry</option>
                <option value="Intelligence Tip">Intelligence Tip</option>
                <option value="Partnership">Partnership</option>
                <option value="Technical Support">Technical Support</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Your Message</label>
              <textarea 
                required rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Detailed briefing on your inquiry..."
                className="bg-indigo-50/50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={status === "loading"}
              className={`w-full py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 bg-slate-900 dark:bg-primary text-white hover:bg-black dark:hover:bg-[#2c1ea3] active:scale-[0.98] ${status === "loading" ? "opacity-70" : ""}`}
            >
              {status === "loading" ? "PROCESSING..." : "SEND INQUIRY"} <Send size={18} />
            </button>

            {status === "success" && (
              <p className="text-center text-emerald-500 font-bold text-sm animate-bounce">
                Dispatch successful. Our archivists will review your message.
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-rose-500 font-bold text-sm">
                Transmission failed. Please check your connection.
              </p>
            )}
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Editorial Contribution Block */}
          <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800 items-start flex gap-6">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold dark:text-white mb-2">Editorial Contributions</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
                We are constantly seeking deep-dive intelligence reports and analytical briefings. If you have a scoop or a data-driven thesis, our editors want to see it.
              </p>
              <Link href="/contribute" className="text-primary dark:text-indigo-400 font-bold text-sm hover:underline flex items-center gap-1 group">
                Editorial Guidelines <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Locations Block */}
          <div className="bg-[#1e2335] dark:bg-[#0f121d] rounded-3xl p-10 text-white space-y-8">
            <h3 className="text-lg font-bold">Bureau Locations</h3>
            
            <div className="flex gap-4 items-start">
              <MapPin size={20} className="text-indigo-400 mt-1 shrink-0" />
              <div>
                <p className="font-bold text-sm">Central Intelligence Hub</p>
                <p className="text-slate-400 text-xs mt-1">1400 Crystal City, Suite 900 Arlington, VA 22202, US</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <Mail size={20} className="text-indigo-400 mt-1 shrink-0" />
              <div>
                <p className="font-bold text-sm">Digital Dispatch</p>
                <p className="text-slate-400 text-xs mt-1">ops@relaypost.intelligence</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 space-y-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Signals & Channels</p>
              <div className="flex gap-4">
                {[Radio, Globe, Rss].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Wing Block */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden group">
            <Image 
              src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200" 
              fill className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Archival Wing" unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-widest uppercase border border-white/20">Archival Wing - Sector 4</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
