"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { 
  subscribeToNewsletter, 
  toggleFollow, 
  getUserFollows, 
  getUserIdentifier 
} from "@/lib/articles";
import { HARDCODED_CATEGORIES } from "@/lib/categoryMapping";

export default function CategoriesPage() {
  const [userFollows, setUserFollows] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [orbitOrder, setOrbitOrder] = useState([0, 1, 2]);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastHoverTime = useRef(0);

  const rotateLeft = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
    setOrbitOrder(prev => {
      const next = [...prev];
      const first = next.shift()!;
      next.push(first);
      return next;
    });
  };

  const rotateRight = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);
    setOrbitOrder(prev => {
      const next = [...prev];
      const last = next.pop()!;
      next.unshift(last);
      return next;
    });
  };

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const id = getUserIdentifier();
    setUserId(id);

    Promise.all([
      getUserFollows(id)
    ]).then(([followData]) => {
      setUserFollows(followData.map((f: any) => f.target_id));
      setIsLoading(false);
      
      // Initialize orbit order based on number of categories
      if (HARDCODED_CATEGORIES.length > 0) {
        setOrbitOrder(HARDCODED_CATEGORIES.slice(0, 3).map((_, i) => i));
      }
    });

    const int = setInterval(() => {
      if (!isHoveredRef.current) {
        rotateRight();
      }
    }, 3000);
    return () => clearInterval(int);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const res = await subscribeToNewsletter(email);
    if (res) {
      alert("Success! You've been added to our intelligence briefing.");
      setEmail("");
    }
  };

  const handleToggleFollow = async (targetId: string, targetType: 'category' | 'keyword') => {
    const res = await toggleFollow(userId, targetId, targetType);
    if (!res) {
      // Unfollowed (API returns null/None for delete)
      setUserFollows(prev => prev.filter(id => id !== targetId));
    } else {
      // Followed
      setUserFollows(prev => [...prev, targetId]);
    }
  };

  // Top 3 categories for the Orbit section
  const featuredCategories = HARDCODED_CATEGORIES.slice(0, 3);
  
  // Topics masonry grid (remaining categories only)
  const remainingTopics = HARDCODED_CATEGORIES.slice(3);

  return (
    <div className="bg-background dark:bg-slate-950 text-on-surface dark:text-white min-h-screen flex flex-col font-['Inter'] overflow-x-hidden">
      <Navbar />

      <main className="flex-grow pt-4 md:pt-8 pb-12 lg:pb-24 px-4 md:px-8 max-w-screen-2xl mx-auto w-full">
        {/* Featured Collections Hero */}
        <header className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface dark:text-white">Featured Collections</h1>
            </div>
            <p className="max-w-md text-slate-500 dark:text-slate-400 text-right hidden lg:block text-sm">
In-depth stories and analysis across the topics shaping our world.            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3].map(i => <div key={i} className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />)}
            </div>
          ) : featuredCategories.length > 0 ? (
            <div 
              className="relative flex justify-center items-center h-[420px] lg:h-[550px] w-full mt-6 mb-10 overflow-visible" 
              style={{ perspective: "2000px" }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button 
                 onClick={rotateRight}
                 className="absolute left-2 md:left-8 z-50 flex items-center justify-center w-12 h-12 bg-slate-900/50 hover:bg-indigo-600 backdrop-blur-md rounded-full text-white transition-all shadow-0 lg:shadow-xl"
                 aria-label="Previous Collection"
              >
                 <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {orbitOrder.map((cardIndex, i) => {
                const card = featuredCategories[cardIndex];
                if (!card) return null;
                const isCenter = i === 1;
                const isLeft = i === 0;
                
                return (
                  <motion.div
                    key={card.id}
                    onMouseEnter={() => {
                      if (Date.now() - lastHoverTime.current < 2000) return;
                      if (isLeft) {
                        lastHoverTime.current = Date.now();
                        rotateRight();
                      } else if (!isLeft && !isCenter) {
                        lastHoverTime.current = Date.now();
                        rotateLeft();
                      }
                    }}
                    animate={{
                      rotateY: isCenter ? 0 : isLeft ? 35 : -35,
                      z: isCenter ? 100 : -200,
                      scale: isCenter ? 1 : 0.85,
                      x: isCenter ? "0%" : isLeft ? "-90%" : "90%",
                      opacity: isCenter ? 1 : 0.6,
                      zIndex: isCenter ? 20 : 0
                    }}
                    transition={{
                      type: "tween", ease: "easeInOut", duration: 0.8
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="group absolute overflow-hidden w-[90%] md:w-[85%] max-w-[400px] lg:max-w-[450px] h-[90%] rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl transition-shadow cursor-pointer border border-slate-100 dark:border-white/5"
                  >
                    <Link href={`/categories/${card.slug}`}>
                      <div className="relative h-full w-full overflow-hidden rounded-[2rem] [transform:translateZ(0)]">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                            alt={card.name} 
                            src={card.image_url || `https://images.unsplash.com/photo-${1500000000000 + cardIndex * 100}?auto=format&fit=crop&q=80&w=800`} 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                        </div>
                        <div className="p-6 md:p-10 relative">
                          <h3 className="text-2xl md:text-3xl font-black mb-2 md:mb-3 dark:text-white uppercase tracking-tighter">{card.name}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 italic leading-relaxed">
                            {card.description || "Discover high-fidelity reports and news synthesis across this specialized intelligence stream."}
                          </p>
                          <div className="mt-8 flex items-center justify-between">
                             <span className="text-[10px] font-black text-indigo-300 dark:text-indigo-600 tracking-[0.2em] uppercase drop-shadow-md">Enter Stream</span>
                             <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                             </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              
              <button 
                 onClick={rotateLeft}
                 className="absolute right-2 md:right-8 z-50 flex items-center justify-center w-12 h-12 bg-slate-900/50 hover:bg-indigo-600 backdrop-blur-md rounded-full text-white transition-all shadow-xl"
                 aria-label="Next Collection"
              >
                 <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No intelligence collections available.</p>
            </div>
          )}
        </header>

        {/* Explore Topics - Masonry System */}
        <section className="mt-6 lg:mt-32">
          <div className="flex items-center justify-between mb-6 lg:mb-16 border-b border-slate-100 dark:border-white/5 pb-8">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter dark:text-white">Categories</h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ transformStyle: "preserve-3d" }}>
            {isLoading ? (
               [1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-[2.5rem]" />)
            ) : remainingTopics.map((topic, i) => {
              const contextUrl = `/categories/${topic.slug}`;
              const isFollowed = userFollows.includes(topic.id);
              
              return (
              <div
                key={topic.id}
                className="relative flex h-full"
              >
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(79, 70, 229, 0.1)" }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-white/5 text-left cursor-pointer z-10 relative transition-colors hover:border-indigo-500/30 flex flex-col w-full h-full"
                >
                  <Link href={contextUrl} className="flex-1">
                    <div className="flex justify-between items-start mb-8">
                      <span className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                        Channel
                      </span>
                    </div>
                    <h4 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight">
                      {topic.name}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium italic">
                      {topic.description || `Ongoing shifts and digital synthesis within the ${topic.name} research corridor.`}
                    </p>
                  </Link>

                  <div className="flex justify-between items-center mt-auto pt-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((idx) => (
                        <img 
                          key={idx} 
                          src={`/images/avatars/avatar${idx}.png`} 
                          alt="Curator avatar" 
                          className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 object-cover" 
                        />
                      ))}
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFollow(topic.id, 'category'); }}
                      className={`flex items-center gap-1 font-black text-[10px] uppercase tracking-widest transition-all px-4 py-2 rounded-full border ${isFollowed ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-600 hover:text-indigo-600'}`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                      <span className={`material-symbols-outlined text-[14px] ${isFollowed ? 'fill-current' : ''}`}>
                        {isFollowed ? 'task_alt' : 'add'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )})}
          </div>
        </section>

        {/* Global Intelligence Briefing Bento */}
        {/* <section className="mt-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 dark:bg-slate-900 rounded-[3rem] p-16 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
            <div className="relative z-10">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-indigo-600/40">
                  <span className="material-symbols-outlined text-white">bolt</span>
               </div>
              <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">Signal <br /> over noise.</h2>
              <p className="text-slate-400 max-w-sm text-lg font-medium">Weekly synthesis of the world's most critical shifts, curated by our editorial engine.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="relative z-10 mt-16 flex flex-col sm:flex-row gap-4">
              <input 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border border-white/10 rounded-full px-8 py-5 focus:ring-2 focus:ring-indigo-500 text-white placeholder:text-slate-500 w-full sm:max-w-md outline-none text-sm font-medium" 
                placeholder="Enter executive email" 
                type="email" 
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-95">Access Briefing</button>
            </form>
            <div className="absolute -right-40 -bottom-40 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full"></div>
            <div className="absolute top-10 right-10 opacity-10">
               <span className="material-symbols-outlined text-[180px]">hub</span>
            </div>
          </div> */}
          
          {/* <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] p-12 border border-slate-200 dark:border-white/5 flex flex-col justify-between items-center text-center">
            <div className="flex flex-col items-center">
               <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-8">
                 <span className="material-symbols-outlined text-indigo-600 text-4xl">verified</span>
               </div>
               <h3 className="text-2xl font-black mb-3 dark:text-white uppercase tracking-tight">Become a Curator</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 px-4 font-medium italic leading-relaxed">Pro members can create their own public intelligence collections and research corridors.</p>
            </div>
            <Link href="/contribute" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm">
               Partner with RelayPost
            </Link>
          </div> */}
        {/* </section> */}
      </main>

      <Footer />
    </div>
  );
}
