"use client";
import React from 'react';
import Link from 'next/link';
import { useTier } from "@/components/TierProvider";

export default function GoUnlimited() {
  const { tier, isLoading } = useTier();

  if (isLoading || tier === "pro") {
    return null;
  }

  const isPlus = tier === "plus";

  return (
    <div className="rounded-2xl p-8 bg-[#181c2f] relative overflow-hidden shadow-xl text-white mt-8 border border-indigo-500/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <h3 className="text-xl font-bold mb-2">
          {isPlus ? "Unlock Pro Intelligence" : "Upgrade Your Intelligence"}
        </h3>
        <p className="text-[13px] text-gray-300 mb-5 leading-relaxed">
          {isPlus 
            ? "Get unlimited AI article summaries, unlimited Ask AI queries, and access to the advanced Research Lab." 
            : "Unlock Plus or Pro Subscription to get detailed AI summaries, Ask AI mode, Weekly Intelligence Reports, and advanced Research Mode."}
        </p>
        <Link 
          href="/pricing" 
          className="bg-[#4f46e5] hover:bg-[#3730a3] text-white w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 text-center block"
        >
          {isPlus ? "Upgrade to Pro" : "Subscribe Now"}
        </Link>
      </div>
    </div>
  );
}



