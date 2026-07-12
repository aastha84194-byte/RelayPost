"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bookmark, Activity, Settings, Menu, X, CreditCard, FlaskConical, Clock } from "lucide-react";
import { useTier } from "@/components/TierProvider";
import { TIER_LABELS } from "@/lib/tier";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { tier, tierStatus } = useTier();

  const navItems = [
    { name: "Dashboard", href: "/profile", icon: LayoutDashboard },
    { name: "History", href: "/profile/history", icon: Clock },
    { name: "Saved", href: "/profile/saved", icon: Bookmark },
    { name: "Analytics", href: "/profile/analytics", icon: Activity },
    { name: "Research Lab", href: "/research", icon: FlaskConical },
    { name: "Subscription", href: "/profile/subscription", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      
      <main className="flex-grow flex flex-col md:flex-row w-full mt-6 md:mt-6 px-4 md:px-8 max-w-7xl mx-auto mb-6 md:mb-6 gap-8">
        
        {/* Mobile top sub-header nav trigger */}
        <div className="md:hidden w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 mb-4 sticky top-16 z-30 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 capitalize">
              {pathname.split("/").pop() === "profile" ? "Dashboard" : pathname.split("/").pop()}
            </span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/20"
          >
            <Menu size={14} /> Profile Menu
          </button>
        </div>

        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 gap-8 pt-4 sticky top-28 self-start h-[calc(100vh-8rem)] overflow-y-auto hide-scrollbar">
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            {tier && (
              <span className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                tier === "pro"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  : tier === "plus"
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {TIER_LABELS[tier]} Plan
              </span>
            )}
          </div>
          
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Sidebar - Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            onClick={e => { if (e.target === e.currentTarget) setMobileMenuOpen(false); }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden flex justify-end"
          >
            <div className="w-64 bg-white dark:bg-slate-900 h-full p-6 shadow-2xl animate-in slide-in-from-right relative">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={24} />
              </button>
              
              <div className="mt-8 mb-10">
                <h1 className="text-xl font-bold">Profile</h1>
                {tier && (
                  <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    tier === "pro"
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      : tier === "plus"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-850 dark:text-slate-400"
                  }`}>
                    {TIER_LABELS[tier]} Plan
                  </span>
                )}
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        isActive 
                          ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 pb-12 w-full">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
