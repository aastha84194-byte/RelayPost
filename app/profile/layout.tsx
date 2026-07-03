"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bookmark, Activity, Settings, Menu, X } from "lucide-react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/profile", icon: LayoutDashboard },
    { name: "Saved", href: "/profile/saved", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      
      <main className="flex-grow flex justify-center w-full mt-12 md:mt-16 px-4 md:px-8 max-w-7xl mx-auto mb-20 gap-8">
        
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg z-40 transition-transform active:scale-95"
        >
          <Menu size={24} />
        </button>

        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 gap-8 pt-4">
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden flex justify-end">
            <div className="w-64 bg-white dark:bg-slate-900 h-full p-6 shadow-2xl animate-in slide-in-from-right relative">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={24} />
              </button>
              
              <div className="mt-8 mb-10">
                <h1 className="text-xl font-bold">Intelligence Profile</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Elite Curator Tier</p>
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
