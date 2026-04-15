"use client";
import React, { Suspense } from 'react';
import HeroSection from './components/HeroSection';
import TrendingNow from './components/TrendingNow';
import LatestInsights from './components/LatestInsights';
import TechSpotlight from './components/TechSpotlight';
import ExpertAnalysis from './components/ExpertAnalysis';
import InteractiveData from './components/InteractiveData';
import PopularConversations from './components/PopularConversations';
import GoUnlimited from './components/GoUnlimited';
import TheBriefing from './components/TheBriefing';
import CommunityPulse from './components/CommunityPulse';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { getArticlesBySection } from '@/lib/articles';
import { Article } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

function HomeContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [trending, setTrending] = React.useState<Article[]>([]);
  const [expert, setExpert] = React.useState<Article[]>([]);
  const [insights, setInsights] = React.useState<Article[]>([]);
  const [heroes, setHeroes] = React.useState<Article[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
       const [t, e, i, h] = await Promise.all([
          getArticlesBySection("TrendingNow", category || undefined),
          getArticlesBySection("ExpertAnalysis", category || undefined),
          getArticlesBySection("LatestInsights", category || undefined),
          getArticlesBySection("Hero", category || undefined)
       ]);
       setTrending(t);
       setExpert(e);
       console.log("Hero articles in frontend:", h);
       setHeroes(h);
       setIsLoading(false);
    };
    fetchData();
  }, [category]);

  return (
    <div className="min-h-full flex flex-col font-sans bg-white md:bg-[#F8F9FB] dark:bg-slate-900 dark:md:bg-[#0f172a] transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          
          <AnimatePresence mode="wait">
            {category && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-6 bg-indigo-600 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-indigo-100"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-indigo-200" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Personalized Feed</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight uppercase">Intelligence: {category}</h2>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-xs font-bold text-indigo-100 opacity-80 uppercase tracking-widest">Global context adapted</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Dynamic Filter Active</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN - 8 columns wide */}
            <div className="lg:col-span-8 flex flex-col gap-12">
              {isLoading ? (
                <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
                   Synchronizing Intelligence Stream...
                </div>
              ) : (
                <>
                  {heroes.length > 0 && <HeroSection articles={heroes} />}
                  {trending.length > 0 && <TrendingNow articles={trending} />}
                  {insights.length > 0 && <LatestInsights articles={insights} />}
                  {!category && <TechSpotlight />}
                  {expert.length > 0 && <ExpertAnalysis articles={expert} />}
                  {!category && <InteractiveData />}
                </>
              )}
            </div>

            {/* RIGHT COLUMN - Sidebar - 4 columns wide */}
            <div className="lg:col-span-4 flex flex-col pl-0 lg:pl-4">
              <PopularConversations />
              <GoUnlimited />
              <TheBriefing />
              <CommunityPulse />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function HomeFallback() {
  return (
    <div className="min-h-full flex flex-col font-sans bg-white md:bg-[#F8F9FB] dark:bg-slate-900 dark:md:bg-[#0f172a] transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Synchronizing Intelligence Stream...
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
