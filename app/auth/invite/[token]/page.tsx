"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function InviteSignup() {
  const { token } = useParams();
  const router = useRouter();
  const [invite, setInvite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const res = await fetch(`http://localhost:8000/auth/invite/${token}`);
        if (!res.ok) throw new Error("Invalid or expired invitation");
        setInvite(await res.json());
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) checkInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/auth/invite/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          display_name: displayName
        })
      });
      
      if (res.ok) {
        router.push("/auth/login?invited=success");
      } else {
        const data = await res.json();
        setError(data.detail || "Registration failed");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
         <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifying Security Token...</p>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
         <div className="max-w-md bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
               <ShieldCheck size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">Link Compromised</h1>
            <p className="text-slate-400 text-sm font-medium mb-10">{error}</p>
            <button 
              onClick={() => router.push("/")}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200"
            >
               Return to Safety
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="bg-white rounded-[3.5rem] p-12 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-100">
             <div className="mb-12">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full mb-8">
                   <ShieldCheck size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Secure Invitation Verified</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">
                  Complete Your Profile
                </h1>
                <p className="text-slate-400 font-medium max-w-sm">
                   Set your access credentials for <span className="text-indigo-600 font-bold">{invite.email}</span>
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                   <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block group-focus-within:text-indigo-600 transition-colors">Digital Identity (Name)</label>
                      <div className="relative">
                         <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={20} />
                         <input 
                           type="text" 
                           required
                           placeholder="Ex: Alexander Pierce"
                           value={displayName}
                           onChange={(e) => setDisplayName(e.target.value)}
                           className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-200 outline-none transition-all"
                         />
                      </div>
                   </div>

                   <div className="group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block group-focus-within:text-indigo-600 transition-colors">Access Password</label>
                      <div className="relative">
                         <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={20} />
                         <input 
                           type="password" 
                           required
                           placeholder="••••••••••••"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-200 outline-none transition-all"
                         />
                      </div>
                   </div>
                </div>

                <div className="pt-4">
                   <button 
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                   >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                           Activate Node Account <ArrowRight size={18} />
                        </>
                      )}
                   </button>
                </div>
             </form>
          </div>

          <p className="text-center mt-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Node authorized as <span className="text-indigo-600 font-black">{invite.role}</span> protocol
          </p>
        </motion.div>
    </div>
  );
}
