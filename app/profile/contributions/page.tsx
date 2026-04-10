"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<any[]>([]);

  useEffect(() => {
    // MOCK data
    setContributions([
      {
        id: "1",
        content_type: "article",
        header: "The Rise of Micro-Datacenters in Urban Areas",
        status: "approved",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        content_type: "analysis",
        header: "Supply Chain Disruptions Q3 Report",
        status: "pending",
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        content_type: "insight",
        header: "Market Response to AI Regulations",
        status: "rejected",
        admin_notes: "Please provide more concrete data sources.",
        created_at: new Date().toISOString(),
      }
    ]);
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800/50"><CheckCircle2 size={14}/> Approved</span>;
      case 'rejected': return <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-bold rounded-full border border-rose-200 dark:border-rose-800/50"><XCircle size={14}/> Returned</span>;
      default: return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800/50"><Clock size={14}/> In Review</span>;
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold dark:text-white mb-2">My Contributions</h1>
          <p className="text-slate-500 dark:text-slate-400">Track the status of your submitted intelligence reports.</p>
        </div>
        <Link href="/contribute" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition-colors hidden md:block">
          New Submission
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {contributions.map((item) => (
            <li key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                  {item.content_type}
                </div>
                <h3 className="font-bold text-lg dark:text-white mb-2">{item.header}</h3>
                {item.status === 'rejected' && item.admin_notes && (
                  <p className="text-sm text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-800/50 mt-3">
                    <span className="font-bold">Editor Note:</span> {item.admin_notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col md:items-end gap-2 shrink-0">
                {getStatusBadge(item.status)}
                <span className="text-xs text-slate-500 font-medium mt-1">Submitted on Oct 12, 2024</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Link href="/contribute" className="w-full text-center bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold py-3 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors md:hidden">
        New Submission
      </Link>

    </div>
  );
}
