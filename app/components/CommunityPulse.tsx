"use client";
import React from 'react';

export default function CommunityPulse() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none transition-colors duration-300">
      <h3 className="text-lg font-bold text-dark-bg mb-4 dark:text-white transition-colors duration-300">Community Pulse</h3>
      <p className="text-xs text-gray-500 mb-4 dark:text-slate-400 transition-colors duration-300">Join the discussion on trending global topics.</p>
      <div className="flex flex-wrap gap-2">
        {[
          "#trend_hashtags", "#social_hashtags", "#trending_hashtags", 
          "#global_topics", "#insidetopics"
        ].map(tag => (
          <span key={tag} className="text-[11px] px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full cursor-pointer hover:bg-brand hover:text-white transition-colors border border-gray-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-800">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
