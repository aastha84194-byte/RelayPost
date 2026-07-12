import React from 'react';
import Link from 'next/link';

export default function InlineSubscriptionCTA() {
  return (
    <div className="my-10 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-900/50 rounded-3xl p-8 border border-indigo-100/50 dark:border-slate-800 w-full max-w-2xl mx-auto shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-1.5 flex items-center justify-center">
            <img src="/favicon.ico" alt="RelayPost Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Read smarter. Analyse deeper.
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upgrade to <span className="text-indigo-600 dark:text-indigo-400 font-bold">RelayPost Pro</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 items-end">
        <div className="space-y-3">
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 font-medium">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 text-lg leading-none">✓</span> Unlimited AI Summaries
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 text-lg leading-none">✓</span> Cross-article Synthesis
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 text-lg leading-none">✓</span> Weekly Intelligence Reports
            </li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-6 sm:pt-0 sm:pl-8">
          <div className="sm:text-right">
            <p className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              ₹2,999<span className="text-sm font-medium text-slate-400 ml-1">/yr</span>
            </p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
              7-Day Free Trial
            </p>
          </div>
          
          <Link 
            href="/pricing" 
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-slate-900 hover:text-white text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            Start Trial
          </Link>
          
          <p className="text-xs text-slate-500 text-center sm:text-right w-full">
            Already a member?{' '}
            <Link href="/login" className="text-slate-900 dark:text-white font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
