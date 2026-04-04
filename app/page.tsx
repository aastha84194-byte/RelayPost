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

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN - 8 columns wide */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          <HeroSection />
          <TrendingNow />
          <LatestInsights />
          <TechSpotlight />
          <ExpertAnalysis />
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
  );
}
