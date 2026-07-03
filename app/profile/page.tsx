"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Edit2, Share2, FileText } from "lucide-react";
import { AUTH_BASE, API_BASE } from "@/lib/config";
import Cookies from "js-cookie";

export default function ProfileDashboard() {
  const [user, setUser] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("access_token") || localStorage.getItem("auth_token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const res = await fetch(`${AUTH_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          
          try {
            const contribRes = await fetch(`${API_BASE}/profile/contributions`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (contribRes.ok) {
              const cData = await contribRes.json();
              setContributions(cData);
            }
          } catch (e) {
            console.error("Failed to fetch contributions", e);
          }
        } else {
          // Token might be invalid
          localStorage.removeItem("auth_token");
          Cookies.remove("access_token");
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      
      {/* User Profile Card */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 flex flex-col items-center shadow-sm relative border border-slate-100 dark:border-slate-800">
        <div className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Member
        </div>

        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden mb-4 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-3xl font-black tracking-tighter">
          {getInitials(user?.display_name || user?.email)}
        </div>
        
        <h2 className="text-2xl font-bold dark:text-white">{user?.display_name || user?.email?.split('@')[0]}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Member since: {formatDate(user?.created_at) || "Recently"}
        </p>

        <div className="flex gap-4 mt-6 w-full max-w-xs">
          <button className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
            <Edit2 size={16} /> Edit Profile
          </button>
          <button className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      {/* Contributions Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold dark:text-white mb-4">My Contributions</h3>
        {contributions.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <FileText size={24} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">You haven't submitted any contributions yet.</p>
            <Link href="/contribute" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-lg">
              Submit Analysis
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {contributions.map((contrib: any) => (
              <div key={contrib.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                      {contrib.content_type}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {formatDate(contrib.created_at)}
                    </span>
                  </div>
                  <h4 className="font-bold dark:text-white text-lg">{contrib.header}</h4>
                </div>
                <div className="shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${contrib.status === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : contrib.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {contrib.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
