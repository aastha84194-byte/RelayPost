"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const topics = [
  {
    category: "Maritime History",
    count: "142 Articles",
    desc: "From deep-sea archeology to the evolution of global shipping lanes and naval geopolitics.",
    avatars: ["bg-slate-200", "bg-slate-300", "bg-slate-400"]
  },
  {
    category: "AI Ethics",
    count: "318 Articles",
    desc: "The philosophical and legal framework governing the deployment of autonomous systems.",
    avatars: ["bg-slate-200", "bg-slate-300"]
  },
  {
    category: "Post-Border Reports",
    count: "84 Articles",
    desc: "Analyzing the shift from geographic boundaries to digital economic zones and remote governance.",
    avatars: ["bg-slate-200", "bg-slate-300", "bg-slate-400", "bg-slate-500"]
  },
  {
    category: "Deep Ecology",
    count: "205 Articles",
    desc: "Studies on planetary-scale environmental engineering and indigenous preservation techniques.",
    avatars: ["bg-slate-200"]
  },
  {
    category: "Urban Autonomy",
    count: "127 Articles",
    desc: "The rise of self-governing smart cities and hyper-local infrastructure networks.",
    avatars: ["bg-slate-200", "bg-slate-300", "bg-slate-400"]
  },
  {
    category: "Longevity Science",
    count: "96 Articles",
    desc: "Cellular rejuvenation research and the socioeconomic impacts of extended human lifespans.",
    avatars: ["bg-slate-200", "bg-slate-300"]
  }
];

const FEATURED_CARDS = [
  {
    title: "Culture",
    desc: "The intersection of heritage and digital modernism.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuALQZ2YXeJ2-_KxBHD0i6WM-AK1ihzGgzYKIB7FcVx-c2sp-h5MbxvTzykpuf_mTM7Z4MZIyTsykkv6ZnPMaYj0NNV-eQ4gHCK41LxD3MMJeQPr0ObTtwdgpvB3jFDsCmrt94ij4Zkc9I3t67x6H8xvGlEIII9pjk0ZowA8XdJq8nCwsUqmk-uB8-Q492FnYXXWoDL-pMSHpbw7IhAxZIOtm8STJZ_ON4_LOzKbN8zKRCGOpw_Logiwo3b1X5OS9e5gFaza8EXHi68"
  },
  {
    title: "Science",
    desc: "Breakthroughs in longevity, physics, and bio-engineering.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYd2jUpX5WWkOYsP1kmY27fHM8KYlV26L7Z5KrPeMj_3XR0JOmV8gMX5Mhfpnac_udIdqKIiuEQ3qP6STK_F5dhvTchkSYdLV_Nd1kwlwLic_QoO8dLK4pb5uCmIsUBRkp_Zr_IWdfseTgOoxFKWd2KVBRn1XigFGfF2uY7CVUTcFEyNdr0MqtvM59ToH-vB5vMvvFJaeNyA1hUr2SITcCIKf4o1UGUqTbmN_LMNjHta5PzsQEJ1RTj0SpME_G4xO4LkLZ8L6nA9k"
  },
  {
    title: "Business",
    desc: "Geopolitical markets and the future of corporate sovereignity.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAuCGgcGfhlqUywjltZsXknxkagiIGXNGh6ugCihRJugsOAEohNeDSy07Wow87ojy-tbidCGWZ1s3TnpJVcOGhKtdug7ViSkJSCT6Fc7w2iZ8ZoGs775hBMcegNlqJ4WxKMjV4_H6RdTdz3ZHy5tSHSrHTommaUT8Tw0jpDUXiEwdr_E9hGGFCmTPN78pwag5m4XgrhhgyAPc01J5DR40JMufquZvXy2ONIoRMVSUjoS5kqvQA1m5ayHVbmpaS-5FFE3GMqUQwS-to"
  }
];

export default function CategoriesPage() {
  const [orbitOrder, setOrbitOrder] = useState([0, 1, 2]);

  useEffect(() => {
    const int = setInterval(() => {
      // Loop: card at index 2 moves to 0, 0 to 1, 1 to 2
      setOrbitOrder(prev => [prev[2], prev[0], prev[1]]);
    }, 3000);
    return () => clearInterval(int);
  }, []);

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

  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  const globalRotateX = useTransform(smoothY, [0, 1], [10, -10]);
  const globalRotateY = useTransform(smoothX, [0, 1], [-10, 10]);

  return (
    <div className="bg-background dark:bg-slate-950 text-on-surface dark:text-white min-h-screen flex flex-col font-['Inter']">
      <Navbar />

      <main className="flex-grow pt-8 pb-24 px-8 max-w-screen-2xl mx-auto w-full overflow-hidden">
        {/* Hero Section */}
        <header className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-primary font-semibold tracking-widest uppercase text-xs mb-3 block">Curation Hub</span>
              <h1 className="text-5xl font-extrabold tracking-tight text-on-surface dark:text-white">Featured Collections</h1>
            </div>
            <p className="max-w-md text-on-surface-variant dark:text-slate-400 text-right hidden lg:block">
              Deep-dive investigations and curated intelligence clusters designed for high-density information processing.
            </p>
          </div>
          {/* Category Hero Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ perspective: "1200px" }}>
            {orbitOrder.map((cardIndex, i) => {
              const card = FEATURED_CARDS[cardIndex];
              const isCenter = i === 1;
              const isLeft = i === 0;
              return (
                <motion.div
                  layout
                  key={cardIndex}
                  initial={false}
                  animate={{
                    rotateY: isCenter ? 0 : isLeft ? 45 : -45,
                    z: isCenter ? 0 : -200,
                    opacity: isCenter ? 1 : 0.4,
                    zIndex: isCenter ? 10 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 14,
                    mass: 1
                  }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="group relative rounded-xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="h-full w-full overflow-hidden rounded-xl"
                  >
                    <div className="aspect-[16/9] overflow-hidden">
                      <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={card.title} src={card.img} />
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold mb-2 dark:text-white">{card.title}</h3>
                          <p className="text-on-surface-variant dark:text-slate-400 text-sm">{card.desc}</p>
                        </div>
                        <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </header>

        {/* Masonry Grid Section - AntiGravity Animated */}
        <section
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="mt-24"
          style={{ perspective: "1200px" }}
        >
          <div className="flex items-center justify-between mb-12 border-b border-outline-variant/30 dark:border-white/20 pb-6">
            <h2 className="text-4xl font-bold tracking-tight dark:text-white">Explore Topics</h2>
            <div className="flex gap-4">
              <button className="px-6 py-2 rounded-full border border-outline dark:border-slate-600 text-sm font-medium hover:bg-surface-container dark:hover:bg-slate-800 transition-colors">Trending</button>
              <button className="px-6 py-2 rounded-full bg-primary text-white text-sm font-medium shadow-lg shadow-primary/20">All Topics</button>
            </div>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6" style={{ transformStyle: "preserve-3d" }}>
            {topics.map((topic, i) => (
              <motion.div
                key={i}
                className="break-inside-avoid mb-6 relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              >
                <motion.div
                  style={{ rotateX: globalRotateX, rotateY: globalRotateY, transformStyle: "preserve-3d" }}
                  whileHover={{ rotateX: 0, rotateY: 0, z: 60, scale: 1.05, boxShadow: "0 30px 60px -15px rgba(0,0,0,0.15)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-surface-container-lowest dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-outline-variant/10 dark:border-white/10 text-left cursor-pointer z-10 relative"
                >
                  <div className="flex justify-between items-start mb-6" style={{ transform: "translateZ(30px)" }}>
                    <span className="bg-secondary-container dark:bg-slate-800 text-on-secondary-container dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">{topic.category}</span>
                    <span className="text-xs text-on-surface-variant dark:text-slate-400 font-semibold">{topic.count}</span>
                  </div>
                  <p className="text-on-surface-variant dark:text-slate-400 text-sm leading-relaxed mb-6" style={{ transform: "translateZ(40px)" }}>{topic.desc}</p>
                  <div className="flex justify-between items-center" style={{ transform: "translateZ(50px)" }}>
                    <div className="flex -space-x-2">
                      {topic.avatars.map((bgClass, idx) => (
                        <div key={idx} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 ${bgClass}`}></div>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 text-indigo-600 font-bold text-sm group">
                      Follow
                      <span className="material-symbols-outlined text-sm group-hover:fill-current">bookmark</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Newsletter / CTA Bento */}
        <section className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#283044] dark:bg-slate-900 rounded-xl p-12 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Stay ahead of the signal.</h2>
              <p className="text-slate-400 max-w-md">Weekly synthesis of the world's most critical shifts in intelligence, curated by our editorial engine.</p>
            </div>
            <div className="relative z-10 mt-12 flex flex-col sm:flex-row gap-4">
              <input className="bg-white/10 dark:bg-slate-800 border border-white/20 dark:border-white/10 rounded-full px-6 py-4 focus:ring-primary focus:border-primary text-white placeholder:text-slate-500 w-full sm:max-w-xs outline-none" placeholder="Your executive email" type="text" />
              <button className="bg-primary hover:bg-primary-container px-10 py-4 rounded-full font-bold transition-all shadow-xl shadow-primary/20">Access Briefing</button>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/20 blur-[100px] rounded-full"></div>
          </div>
          <div className="bg-surface-container-high dark:bg-slate-900 rounded-xl p-8 border border-outline-variant/30 dark:border-white/10 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">verified</span>
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Become a Curator</h3>
            <p className="text-on-surface-variant dark:text-slate-400 text-sm mb-6 px-4">Pro members can create their own public intelligence collections.</p>
            <button className="text-primary font-bold text-sm border-b-2 border-primary/20 hover:border-primary transition-all pb-0.5">Learn more about Pro</button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
