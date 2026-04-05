"use client";
import React from 'react';

export default function GoUnlimited() {
  return (
    <div className="rounded-2xl p-8 bg-[#181c2f] relative overflow-hidden shadow-xl text-white mt-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/30 rounded-full blur-2xl -mr-10 -mt-10"></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <h3 className="text-xl font-bold mb-3">Go Unlimited</h3>
        <p className="text-[13px] text-gray-300 mb-6 leading-relaxed">
          Exclusive content and research insights with your premium subscription. Upgrade now for full access.
        </p>
        <button className="bg-[#4f46e5] hover:bg-[#3730a3] text-white w-full py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand/20">
          Subscribe Now
        </button>
      </div>
    </div>
  );
}
