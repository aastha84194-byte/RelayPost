"use client";

import React, { useState } from "react";
import { Send, ChevronDown } from "lucide-react";
import { API_BASE } from "@/lib/config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    subject: "Editorial Inquiry",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const subjects = ["Editorial Inquiry", "Intelligence Tip", "Partnership", "Technical Support"];

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
    <div className="min-h-screen bg-white md:bg-[#F8F9FB] dark:bg-slate-900 dark:md:bg-[#0f172a] transition-colors duration-300 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-6 sm:py-10 px-4 md:px-8">
        <div className="max-w-3xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 dark:border-slate-700/50">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Contact Us</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Have a question or want to work together? Fill out the form below or email us directly at <a href="mailto:kartikkalra2705@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">kartikkalra2705@gmail.com</a>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                <input 
                  type="text" required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
              <div 
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus-within:ring-2 focus-within:ring-indigo-500 outline-none transition-all cursor-pointer flex justify-between items-center"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{formData.subject}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {dropdownOpen && (
                <div className="absolute top-[72px] left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden">
                  {subjects.map((sub) => (
                    <div 
                      key={sub}
                      className="px-4 py-3 text-sm dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setFormData({...formData, subject: sub});
                        setDropdownOpen(false);
                      }}
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message</label>
              <textarea 
                required rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button 
              type="submit"
              disabled={status === "loading"}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98] ${status === "loading" ? "opacity-70" : ""}`}
            >
              {status === "loading" ? "SENDING..." : "SEND MESSAGE"} <Send size={16} />
            </button>

            {status === "success" && (
              <p className="text-center text-emerald-500 font-medium text-sm mt-4">
                Thank you! Your message has been sent successfully.
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-rose-500 font-medium text-sm mt-4">
                Oops! Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
