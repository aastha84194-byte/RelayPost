"use client";
import React from 'react';

export default function TheBriefing() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
      <h3 className="text-lg font-bold text-dark-bg mb-2">The Strategic Dispatch</h3>
      <p className="text-xs text-gray-500 mb-4">Global breakthroughs, Indian context. Delivered daily.</p>
      <div className="flex flex-col gap-3">
        <input 
          type="email" 
          placeholder="Input your email" 
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-brand/50 focus:bg-white transition-colors"
        />
        <button className="bg-[#4f46e5] hover:bg-[#3730a3] text-white w-full py-3 rounded-xl text-sm font-medium transition-colors">
          Subscribe
        </button>
      </div>
    </div>
  );
}
