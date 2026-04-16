"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import { 
  getCategories, 
  getPublicKeywords, 
  subscribeToNewsletter, 
  toggleFollow, 
  getUserFollows, 
  getUserIdentifier 
} from "@/lib/articles";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [userFollows, setUserFollows] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [orbitOrder, setOrbitOrder] = useState([0, 1, 2]);

  useEffect(() => {
    const id = getUserIdentifier();
    setUserId(id);

    Promise.all([
      getCategories(),
      getPublicKeywords(30),
      getUserFollows(id)
    ]).then(([catData, kwData, followData]) => {
      setCategories(catData);
      setKeywords(kwData);
      setUserFollows(followData.map((f: any) => f.target_id));
      setIsLoading(false);
      
      // Initialize orbit order based on number of categories
      if (catData.length > 0) {
        setOrbitOrder(catData.slice(0, 3).map((_, i) => i));
      }
    });

    const int = setInterval(() => {
      setOrbitOrder(prev => {
        if (prev.length < 2) return prev;
        // Shift logic for orbit
        const next = [...prev];
        const last = next.pop()!;
        next.unshift(last);
        return next;
      });
    }, 5000);
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

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200 });

  const globalRotateX = useTransform(smoothY, [0, 1], [4, -4]);
  const globalRotateY = useTransform(smoothX, [0, 1], [-4, 4]);

  // Top 3 categories for the Orbit section
  const featuredCategories = categories.slice(0, 3);
  
  // Mixed topics masonry grid (remaining categories + keywords)
  const remainingTopics = [
    ...categories.slice(3).map(c => ({ ...c, type: 'category' as const })),
    ...keywords.map(k => ({ ...k, type: 'keyword' as const, name: k.tag }))
  ].sort((a, b) => (b.article_count || 0) - (a.article_count || 0));

  return (
    <div className="bg-background dark:bg-slate-950 text-on-surface dark:text-white min-h-screen flex flex-col font-['Inter']">
      <Navbar />

      <main className="flex-grow pt-8 pb-24 px-8 max-w-screen-2xl mx-auto w-full">
        {/* Featured Collections Hero */}
        <header className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-widest uppercase text-xs mb-3 block">Intelligence Hub</span>
              <h1 className="text-5xl font-extrabold tracking-tight text-on-surface dark:text-white">Featured Collections</h1>
            </div>
            <p className="max-w-md text-slate-500 dark:text-slate-400 text-right hidden lg:block text-sm">
              In-depth investigations and curated intelligence clusters designed for deep information processing.
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3].map(i => <div key={i} className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl" />)}
            </div>
          ) : featuredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12" style={{ perspective: "1500px" }}>
              {orbitOrder.map((cardIndex, i) => {
                const card = featuredCategories[cardIndex];
                if (!card) return null;
                const isCenter = i === 1;
                const isLeft = i === 0;
                
                return (
                  <motion.div
                    layout
                    key={card.id}
                    initial={false}
                    animate={{
                      rotateY: isCenter ? 0 : isLeft ? 35 : -35,
                      z: isCenter ? 0 : -150,
                      x: isCenter ? 0 : isLeft ? 20 : -20,
                      opacity: isCenter ? 1 : 0.6,
                      zIndex: isCenter ? 10 : 0
                    }}
                    transition={{
                      type: "spring", stiffness: 70, damping: 15, mass: 1
                    }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="group relative rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-slate-100 dark:border-white/5"
                  >
                    <Link href={`/categories/${card.slug}`}>
                      <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: cardIndex * 0.5 }}
                        className="h-full w-full overflow-hidden rounded-[2rem]"
                      >
                        <div className="aspect-[16/10] overflow-hidden">
                          <img 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                            alt={card.name} 
                            src={card.image_url || `https://images.unsplash.com/photo-${1500000000000 + cardIndex * 100}?auto=format&fit=crop&q=80&w=800`} 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                        </div>
                        <div className="p-10 relative">
                          <h3 className="text-3xl font-black mb-3 dark:text-white uppercase tracking-tighter">{card.name}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 italic leading-relaxed">
                            {card.description || "Discover high-fidelity reports and news synthesis across this specialized intelligence stream."}
                          </p>
                          <div className="mt-8 flex items-center justify-between">
                             <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] uppercase">Enter Stream</span>
                             <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                             </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No intelligence collections available.</p>
            </div>
          )}
        </header>

        {/* Explore Topics - Masonry System */}
        <section
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="mt-32"
          style={{ perspective: "1500px" }}
        >
          <div className="flex items-center justify-between mb-16 border-b border-slate-100 dark:border-white/5 pb-8">
            <h2 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Topics Corridor</h2>
            <div className="flex gap-4">
              <button className="px-8 py-3 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">Trending</button>
              <button className="px-8 py-3 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">All Nodes</button>
            </div>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8" style={{ transformStyle: "preserve-3d" }}>
            {isLoading ? (
               [1,2,3,4,5,6].map(i => <div key={i} className="h-64 mb-8 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-[2.5rem]" />)
            ) : remainingTopics.map((topic, i) => {
              const contextUrl = topic.type === 'category' ? `/categories/${topic.slug}` : `/keywords/${topic.tag}`;
              const isFollowed = userFollows.includes(topic.id);
              
              return (
              <motion.div
                key={topic.id}
                className="break-inside-avoid mb-8 relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              >
                <motion.div
                  style={{ rotateX: globalRotateX, rotateY: globalRotateY, transformStyle: "preserve-3d" }}
                  whileHover={{ rotateX: 0, rotateY: 0, z: 80, scale: 1.05, boxShadow: "0 40px 80px -20px rgba(79, 70, 229, 0.15)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-white/5 text-left cursor-pointer z-10 relative"
                >
                  <Link href={contextUrl}>
                    <div className="flex justify-between items-start mb-8" style={{ transform: "translateZ(30px)" }}>
                      <span className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                        {topic.type === 'category' ? 'Channel' : 'Tag'}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black tracking-widest">
                        {topic.article_count || 0} ARTICLES
                      </span>
                    </div>
                    <h4 className="text-2xl font-black mb-4 dark:text-white uppercase tracking-tight" style={{ transform: "translateZ(40px)" }}>
                      {topic.name || topic.tag}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 font-medium italic" style={{ transform: "translateZ(50px)" }}>
                      {topic.description || `Ongoing shifts and digital synthesis within the ${topic.name || topic.tag} research corridor.`}
                    </p>
                  </Link>

                  <div className="flex justify-between items-center" style={{ transform: "translateZ(60px)" }}>
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
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleFollow(topic.id, topic.type); }}
                      className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all px-4 py-2 rounded-full border ${isFollowed ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-600 hover:text-indigo-600'}`}
                    >
                      {isFollowed ? 'Following' : 'Follow Node'}
                      <span className={`material-symbols-outlined text-[14px] ${isFollowed ? 'fill-current' : ''}`}>
                        {isFollowed ? 'task_alt' : 'add'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )})}
          </div>
        </section>

        {/* Global Intelligence Briefing Bento */}
        <section className="mt-32 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] p-12 border border-slate-200 dark:border-white/5 flex flex-col justify-between items-center text-center">
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
