"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, Monitor, Briefcase, Trophy, Heart, Film, Landmark, Microscope, Globe, Hash, Settings, Bookmark, Star, Edit3 } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";

const categories = [
  { name: "TAGS", icon: Hash, bg: "bg-indigo-600", text: "text-white" },
  { name: "Business", icon: Briefcase },
  { name: "Sports", icon: Trophy },
  { name: "Health", icon: Heart },
  { name: "Entertainment", icon: Film },
  { name: "Politics", icon: Landmark },
  { name: "Science", icon: Microscope },
  { name: "World News", icon: Globe },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("js-cookie").then((Cookies) => {
      const token = Cookies.default.get("access_token");
      if (token) {
        setIsLoggedIn(true);
        try {
          const payloadBase64 = token.split(".")[1];
          // Handle base64 padding issues
          const sanitizedPayload = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
          const decodedPayload = JSON.parse(decodeURIComponent(escape(atob(sanitizedPayload))));
          setUserRole(decodedPayload.role?.toUpperCase() || "VIEWER");
        } catch (e) {
          console.error("Failed to decode token", e);
          setUserRole("VIEWER");
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const isAdminOrPublisher = userRole === "ADMIN" || userRole === "PUBLISHER";

  return (
    <>
      <div className="fixed top-0 w-full z-50 pointer-events-none flex justify-center px-4">
        <motion.header 
          className="pt-4 pointer-events-auto"
          animate={{ 
            width: isScrolled ? "850px" : "1280px",
            maxWidth: "100%"
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <nav className="bg-[#0f172a]/80 backdrop-blur-[12px] border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-lg transition-colors">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold text-lg tracking-tight">Editorial</span>
                <span className="text-indigo-300 text-[10px] font-semibold uppercase tracking-widest">Intelligence</span>
              </div>
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link className="text-white hover:text-indigo-400 transition-colors font-medium text-sm" href="/">Home</Link>
              <Link className="text-slate-300 hover:text-indigo-400 transition-colors font-medium text-sm" href="/categories">Categories</Link>
              <Link className="text-slate-300 hover:text-indigo-400 transition-colors font-medium text-sm" href="/about">About</Link>
              <Link className="text-slate-300 hover:text-indigo-400 transition-colors font-medium text-sm" href="/contact">Contact</Link>
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <input 
                  className="bg-slate-800/50 border-none rounded-full py-2 pl-4 pr-10 text-sm text-white focus:ring-2 focus:ring-indigo-500 w-48 focus:outline-none transition-all placeholder-slate-400" 
                  placeholder="Search..." 
                  type="text"
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              
              {isLoggedIn ? (
                isAdminOrPublisher ? (
                  // Direct link for Admin/Publisher
                  <Link href="/admin/dashboard" className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/50 transition-colors" title="Go to Dashboard">
                    <Monitor size={18} />
                  </Link>
                ) : (
                  // Dropdown for Viewer
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <User size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-3 w-56 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl py-2"
                        >
                          <div className="px-4 py-3 border-b border-slate-700/50 mb-1">
                            <p className="text-xs text-slate-400">Signed in as</p>
                            <p className="text-sm font-semibold text-white truncate">User</p>
                          </div>
                          
                          <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                            <Settings size={16} className="text-slate-400" /> Profile
                          </Link>
                          <Link href="/profile/saved" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                            <Bookmark size={16} className="text-slate-400" /> Saved Articles
                          </Link>
                          <Link href="/profile/favorites" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                            <Star size={16} className="text-slate-400" /> Favourites
                          </Link>
                          <Link href="/profile/contributions" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                            <Edit3 size={16} className="text-slate-400" /> Contributions
                          </Link>
                          
                          <div className="border-t border-slate-700/50 mt-1 pt-1">
                            <button 
                              onClick={() => {
                                import("js-cookie").then((Cookies) => {
                                  Cookies.default.remove("access_token");
                                  window.location.reload();
                                });
                              }}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-colors w-full text-left"
                            >
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-3 ml-2">
                  <Link href="/login" className="text-slate-300 hover:text-white font-medium text-sm transition-colors px-2">Login</Link>
                  <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors cursor-pointer">Sign Up</Link>
                </div>
              )}
            </div>
          </nav>
        </motion.header>
      </div>

      {/* Spacer to avoid content being hidden behind the sticky navbar */}
      <div className="h-28"></div>

      {/* Categories Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 mt-[-10px]">
         <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-2">
           {categories.map((cat, i) => {
             const Icon = cat.icon;
             const isFirst = i === 0;
             return (
               <button 
                 key={cat.name}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shadow-sm border ${
                   isFirst 
                    ? "bg-indigo-600 text-white border-indigo-600" 
                    : "bg-white text-gray-500 border-gray-200 hover:text-indigo-600 hover:border-indigo-600"
                 }`}
               >
                 <Icon size={14} className={isFirst ? "text-white" : "text-gray-400 group-hover:text-indigo-600"} />
                 {cat.name}
               </button>
             )
           })}
         </div>
      </div>
    </>
  );
}
