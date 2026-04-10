"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, Monitor, Briefcase, Trophy, Heart, Film, Landmark, Microscope, Globe, Hash, Settings, Bookmark, Star, Edit3, Menu, X } from "lucide-react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

const categories = [
  { name: "Business", icon: Briefcase },
  { name: "Sports", icon: Trophy },
  { name: "Health", icon: Heart },
  { name: "Entertainment", icon: Film },
  { name: "Politics", icon: Landmark },
  { name: "Science", icon: Microscope },
  { name: "World News", icon: Globe },
];

function NavbarCategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const handleCategoryClick = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategory === name) {
      params.delete("category");
    } else {
      params.set("category", name);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-8 mb-6 mt-4 md:mt-6">
      <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategoryClick(cat.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shadow-sm border ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-500/10 scale-105"
                  : "bg-white text-gray-500 border-gray-200 hover:text-indigo-600 hover:border-indigo-600"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white" : "text-gray-400"} />
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("js-cookie").then((Cookies) => {
      const token = Cookies.default.get("access_token");
      if (token) {
        setIsLoggedIn(true);
        try {
          const payloadBase64 = token.split(".")[1];
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
      <div className="fixed top-0 w-full z-50 flex md:justify-center md:px-4">
        <motion.header
          className="md:pt-4 w-full flex justify-center"
          animate={{
            width: "100%",
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className={`w-full transition-all duration-400 ${isScrolled ? "md:max-w-4xl" : "md:max-w-7xl"}`}>
            <nav className={`bg-[#0f172a]/80 backdrop-blur-[12px] border-b md:border border-white/10 px-4 md:px-6 py-3 md:py-3 flex items-center justify-between shadow-lg transition-all ${isScrolled ? "md:rounded-full" : "rounded-none md:rounded-full"}`}>
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-9 md:h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-white font-bold text-base md:text-lg tracking-tight">RelayPost</span>
                </div>
              </Link>

              {/* Links - Desktop */}
              <div className="hidden md:flex items-center gap-8">
                <Link className="text-white hover:text-indigo-400 transition-colors font-medium text-sm" href="/">Home</Link>
                <Link className="text-slate-300 hover:text-indigo-400 transition-colors font-medium text-sm" href="/about">About</Link>
                <Link className="text-slate-300 hover:text-indigo-400 transition-colors font-medium text-sm" href="/contact">Contact</Link>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-4">
                <div className="relative hidden lg:block">
                  <input
                    className="bg-slate-800/50 border-none rounded-full py-2 pl-4 pr-10 text-sm text-white focus:ring-2 focus:ring-indigo-500 w-48 focus:outline-none transition-all placeholder-slate-400 shadow-inner"
                    placeholder="Search..."
                    type="text"
                  />
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                
                <ThemeToggle />

                {isLoggedIn ? (
                  isAdminOrPublisher ? (
                    <Link href="/admin/dashboard" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/50 transition-colors shadow-lg" title="Go to Dashboard">
                      <Monitor size={18} />
                    </Link>
                  ) : (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <User size={18} />
                      </button>

                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
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
                  <div className="hidden md:flex items-center gap-3 ml-2">
                    <Link href="/login" className="text-slate-300 hover:text-white font-medium text-sm transition-colors px-2">Login</Link>
                    <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors cursor-pointer shadow-lg">Sign Up</Link>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex md:hidden w-10 h-10 items-center justify-center text-white bg-white/5 rounded-full"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </nav>
          </div>
        </motion.header>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[#0f172a] p-6 flex flex-col pt-24"
          >
            <div className="flex flex-col gap-6 mb-12">
              <div className="relative mb-4">
                <input
                  className="bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-6 pr-12 text-lg text-white focus:ring-2 focus:ring-indigo-500 w-full focus:outline-none transition-all placeholder-slate-500 shadow-xl"
                  placeholder="Universal Search..."
                  type="text"
                />
                <Search size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
              <Link onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-white flex items-center justify-between" href="/">Home</Link>
              <Link onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-slate-300" href="/about">About</Link>
              <Link onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-slate-300" href="/contact">Contact</Link>
            </div>

            <div className="mt-auto space-y-4">
              {!isLoggedIn && (
                <>
                  <Link onClick={() => setMobileMenuOpen(false)} href="/login" className="block w-full py-4 text-center text-white font-bold border border-white/10 rounded-2xl">Login</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} href="/register" className="block w-full py-4 text-center bg-indigo-600 text-white font-bold rounded-2xl">Create Account</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to avoid content being hidden behind the sticky navbar */}
      <div className="h-20 md:h-28"></div>

      {/* Categories Bar */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 mt-4 md:mt-6 min-h-[52px]" aria-hidden />
        }
      >
        <NavbarCategoryFilters />
      </Suspense>
    </>
  );
}
