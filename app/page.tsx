"use client";
import React from 'react';
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

export default function Home() {
  const [trending, setTrending] = React.useState<Article[]>([]);
  const [expert, setExpert] = React.useState<Article[]>([]);
  const [insights, setInsights] = React.useState<Article[]>([]);
  const [hero, setHero] = React.useState<Article | null>(null);

  React.useEffect(() => {
    getArticlesBySection("TrendingNow").then(setTrending);
    getArticlesBySection("ExpertAnalysis").then(setExpert);
    getArticlesBySection("LatestInsights").then(setInsights);
    getArticlesBySection("Hero").then(articles => {
      if (articles.length > 0) setHero(articles[0]);
    });
  }, []);

  return (
    <div className="min-h-full flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN - 8 columns wide */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          <HeroSection article={hero} />
          <TrendingNow articles={trending} />
          <LatestInsights articles={insights} />
          <TechSpotlight />
          <ExpertAnalysis articles={expert} />
          <InteractiveData />
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
