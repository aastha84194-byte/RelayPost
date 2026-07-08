"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Database, Globe, ShieldCheck, Clock, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    import("js-cookie").then((Cookies) => {
      const token = Cookies.default.get("access_token");
      if (token) {
        setIsLoggedIn(true);
      }
    });
  }, []);

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-8 pb-24 w-full">
        
        {/* Header */}
        <section className="text-center px-8 max-w-3xl mx-auto mb-16 mt-8">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 font-black uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 rounded-full">
            The RelayPost Mission
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-6 dark:text-white mb-6 leading-tight">
            Curing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 italic pr-2">Dumbscroll</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We live in an age of infinite information and zero context. RelayPost was built to replace mindless scrolling with meaningful intelligence. We analyze, synthesize, and deliver only what actually matters.
          </p>
        </section>

        {/* Bento Grid Features */}
        <section className="px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 mb-24">
          
          {/* Editorial Integrity */}
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl h-[320px] flex items-start p-8 group border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-indigo-950">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <Users className="text-indigo-400" size={24} />
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Editorial Integrity</h2>
              </div>
              <p className="text-slate-300 max-w-md leading-relaxed text-sm md:text-base">
                Our seasoned editorial team carefully curates global news streams, prioritizing human insight, nuance, and rigorous fact-checking over automated sensationalism.
              </p>
            </div>
          </div>

          {/* Time Valued */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-8 flex flex-col justify-center border border-indigo-100 dark:border-indigo-800/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
            <Clock size={32} className="text-indigo-600 dark:text-indigo-400 mb-6" />
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Respecting Your Time</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              We condense hours of reading into high-density insights. Get the full picture in a fraction of the time, without the clickbait.
            </p>
          </div>

          {/* Trust */}
          <div className="bg-indigo-600 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden text-white shadow-xl shadow-indigo-600/20">
            <div className="absolute top-6 right-6 flex gap-1 opacity-40">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            </div>
            <ShieldCheck size={32} className="mb-6 text-indigo-200" />
            <h2 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">Unbiased Verification</h2>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Every insight is cross-referenced against multiple global sources. We strip away partisan bias to present the objective reality.
            </p>
          </div>

          {/* Deep Context */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <Database className="text-indigo-500" size={24} />
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Historical Context</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                News happens today, but context takes decades to build. We connect breaking events to historical precedents and economic cycles to provide true depth of understanding.
              </p>
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">10k+</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Sources Analyzed</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">24/7</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Continuous Synthesis</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-56 h-48 bg-slate-50 dark:bg-slate-800/50 rounded-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
              <Globe className="text-slate-300 dark:text-slate-700 w-24 h-24 animate-[spin_60s_linear_infinite]" />
            </div>
          </div>

        </section>

        {/* Philosophy Section */}
        <section className="px-6 max-w-3xl mx-auto mb-24 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Our Philosophy</h2>
          <blockquote className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 italic leading-relaxed mb-6">
            "Information is abundant. Attention is scarce. True intelligence is the ability to filter the noise and focus on what shapes tomorrow."
          </blockquote>
          <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full opacity-50"></div>
        </section>

        {/* CTA */}
        <section className="text-center px-6 mb-8 max-w-2xl mx-auto bg-slate-50 dark:bg-slate-900 p-10 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl md:text-3xl font-bold dark:text-white mb-3">Elevate Your Information Diet</h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-8">
            Join thousands of professionals who rely on RelayPost for signal over noise.
          </p>
          <div className="flex justify-center">
            <Link 
              href={isLoggedIn ? "/" : "/register"}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-600/30 transition-all text-xs tracking-wide block"
            >
              START EXPLORING
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
