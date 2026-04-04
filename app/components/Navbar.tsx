"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, User, Monitor, Briefcase, Trophy, Heart, Film, Landmark, Microscope, Globe, Home, LayoutGrid, Info, Mail } from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

const categories = [
  { name: "Tech", icon: Monitor, active: true },
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

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header 
      className="w-full bg-dark-bg/95 backdrop-blur-md text-white sticky top-0 z-50 border-b border-white/5 transition-colors duration-300 shadow-xl"
    >
      {/* Top Navbar */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between"
        animate={{ paddingTop: isScrolled ? "0.75rem" : "1rem", paddingBottom: isScrolled ? "0.75rem" : "1rem" }}
        transition={{ duration: 0.3 }}
      >
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div 
            animate={{ scale: isScrolled ? 0.9 : 1 }}
            className="w-8 h-8 flex-shrink-0 rounded-lg bg-brand flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform"
          >
            E
          </motion.div>
          <motion.span 
            animate={{ opacity: isScrolled ? 0 : 1, width: isScrolled ? 0 : "auto", marginLeft: isScrolled ? 0 : "0.5rem" }}
            className="font-semibold text-lg tracking-tight overflow-hidden whitespace-nowrap"
          >
            Editorial<br/><span className="text-gray-300 text-sm leading-none block">Intelligence</span>
          </motion.span>
        </Link>

        {/* Main Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {[
            { text: "Home", href: "/", icon: Home, active: true },
            { text: "Categories", href: "/categories", icon: LayoutGrid },
            { text: "About", href: "/about", icon: Info },
            { text: "Contact", href: "/contact", icon: Mail },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.text} 
                href={item.href} 
                className={`relative flex items-center justify-center transition-all duration-300 ${item.active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                title={item.text}
              >
                {item.active && !isScrolled && (
                  <div className="absolute -bottom-[20px] left-0 w-full h-1 bg-brand" />
                )}
                {isScrolled ? <Icon size={20} className="mt-1" /> : <span>{item.text}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Search & Profile */}
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-dark-surface border border-gray-700/50 rounded-full py-2 px-4 pr-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-brand/50 transition-colors w-64"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand transition-colors">
              <Search size={16} />
            </button>
          </div>
          <button className="w-10 h-10 rounded-full bg-dark-surface flex items-center justify-center border border-gray-700/50 hover:bg-gray-800 transition-colors">
            <User size={18} className="text-gray-300" />
          </button>
        </div>
      </motion.div>

      {/* Categories Bar */}
      <motion.div 
        animate={{ 
          height: isScrolled ? 0 : "auto", 
          opacity: isScrolled ? 0 : 1 
        }}
        className="overflow-hidden border-t border-gray-800/80"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-3">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button 
                  key={cat.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                    cat.active 
                      ? "bg-brand/20 text-brand border border-brand/30" 
                      : "bg-dark-surface text-gray-300 hover:bg-gray-800 border border-transparent"
                  }`}
                >
                  <Icon size={14} className={cat.active ? "text-brand" : "text-gray-400"} />
                  {cat.name}
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
