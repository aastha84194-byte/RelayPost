"use client";

import React, { useState, useEffect } from "react";
import { 
  Send, Shield, Zap, 
  MessageSquare, FileText, 
  CheckCircle2, AlertCircle,
  ArrowRight, Globe, Lock
} from "lucide-react";
import Navbar from "../components/Navbar";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import { API_BASE } from "@/lib/config";


export default function ContributePage() {
  const [formData, setFormData] = useState({
    header: "",
    main_content: "",
    content_type: "dispatch"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    const token = Cookies.get("access_token");
    if (!token) {
      setError("Authorization required. Please login to contribute.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/public/contributions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ header: "", main_content: "", content_type: "dispatch" });
      } else {
        const data = await res.json();
        setError(data.detail || "Submission failed.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-[#0A0D1F] min-h-screen text-slate-900 dark:text-white font-sans selection:bg-brand">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left: Branding & Info */}
        <div className="lg:col-span-5 space-y-10">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="space-y-6"
           >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest">
                 <Zap size={12} /> Community Intelligence Network
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.95] uppercase">
                Submit Your <span className="text-brand">Analysis</span>.
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                Join our network of expert contributors. We curate high-fidelity research and dispatches from the community to provide multi-perspective editorial coverage.
              </p>
           </motion.div>

           <div className="space-y-4 pt-10 border-t border-slate-200 dark:border-white/5">
              {[
                { icon: <Shield className="text-indigo-400" />, title: "Anonymity by Default", desc: "Your identity is protected unless you choose to display it." },
                { icon: <Globe className="text-emerald-400" />, title: "Global Distribution", desc: "Approved dispatches reach our 50k+ executive audience." },
                { icon: <Lock className="text-orange-400" />, title: "Secure Transmission", desc: "Peer-to-peer encrypted inbound sockets for data integrity." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5 group">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                      {item.icon}
                   </div>
                   <div>
                      <h4 className="font-bold text-sm tracking-tight">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right: Submission Form */}
        <div className="lg:col-span-7">
           <AnimatePresence mode="wait">
             {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] p-16 text-center space-y-8"
                >
                   <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50">
                      <CheckCircle2 size={48} className="text-white" />
                   </div>
                   <div className="space-y-4">
                      <h2 className="text-3xl font-black uppercase tracking-tight">Transmission Received</h2>
                      <p className="text-emerald-800 dark:text-emerald-200/60 max-w-sm mx-auto font-medium">Your contribution has been moved to the <span className="text-emerald-950 dark:text-white font-bold">Inquiry Queue</span>. Administrators will review the dispatch for editorial alignment.</p>
                   </div>
                   <button 
                     onClick={() => setSuccess(false)}
                     className="px-8 py-3 bg-white text-emerald-900 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                   >
                      Submit Another Packet
                   </button>
                </motion.div>
             ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 p-10 md:p-14 rounded-[3.5rem] shadow-2xl backdrop-blur-xl relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10 rotate-12">
                      <MessageSquare size={200} />
                   </div>
                   
                   <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-brand tracking-[0.3em]">Content Categorization</label>
                         <div className="flex flex-wrap gap-4">
                            {['dispatch', 'deep-dive', 'breaking', 'editorial'].map(t => (
                               <button 
                                 key={t}
                                 type="button"
                                 onClick={() => setFormData({...formData, content_type: t})}
                                 className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.content_type === t ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}
                               >
                                  {t}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Dispatch Header</label>
                        <input 
                          required
                          value={formData.header}
                          onChange={(e) => setFormData({...formData, header: e.target.value})}
                          placeholder="The core thesis of your analysis..."
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-5 focus:ring-2 focus:ring-brand/40 outline-none transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Main Intelligence Body</label>
                        <textarea 
                          required
                          value={formData.main_content}
                          onChange={(e) => setFormData({...formData, main_content: e.target.value})}
                          placeholder="Provide detailed evidence, data points, or qualitative assessment..."
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem] px-6 py-6 focus:ring-2 focus:ring-brand/40 outline-none transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 min-h-[250px] leading-relaxed"
                        />
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">
                           <AlertCircle size={16} /> {error}
                        </div>
                      )}

                      <button 
                        disabled={isSubmitting}
                        className="w-full py-6 bg-brand hover:bg-brand-dark rounded-3xl font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-2xl shadow-brand/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                      >
                         {isSubmitting ? 'Transmitting Inbound...' : 'Initialize Secure Submission'}
                         <ArrowRight size={18} />
                      </button>
                   </form>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

      </main>

      {/* Corporate Sub-footer */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-white/5 mb-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Integrity Auditing</p>
               <p className="text-sm text-slate-500 font-medium">All submissions undergo a dual-human blind review process to ensure zero corporate bias in our intelligence dispatches.</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Submission Rewards</p>
               <p className="text-sm text-slate-500 font-medium">Published contributors receive platform credits and access to premium executive tier dashboard tools for future analysis builds.</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4">Legal Disclaimer</p>
               <p className="text-sm text-slate-500 font-medium">By submitting, you represent that you hold all rights to the provided intelligence and grant RelayPost non-exclusive publishing rights.</p>
            </div>
         </div>
      </section>
      <Footer />
    </div>
  );
}
