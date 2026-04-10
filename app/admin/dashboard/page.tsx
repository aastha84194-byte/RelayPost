"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CopyPlus, TrendingUp, Users, Activity, FileText } from "lucide-react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE || "http://localhost:8000";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";


export default function AdminDashboard() {
  const [stats, setStats] = useState({
    articles: 0,
    views: 0,
    publishers: 12,
    totalUsers: 0
  });
  const [activity, setActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = Cookies.get("access_token");
      try {
        // Fetch Content Stats
        const contentRes = await fetch(`${API_BASE}/admin/stats/content`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const contentData = await contentRes.json();

        // Fetch Auth Stats
        const authRes = await fetch(`${AUTH_BASE}/admin/stats/auth`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const authData = await authRes.json();

        // Fetch Recent Activity
        const activityRes = await fetch(`${API_BASE}/admin/activity`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const activityData = await activityRes.json();

        setStats({
          articles: contentData.total_articles,
          views: contentData.total_views,
          publishers: authData.publisher_count,
          totalUsers: authData.total_users
        });
        setActivity(activityData);
      } catch (e) {
        console.error("Dashboard fetch failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                <Activity size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Command Center</h1>
           </div>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Platform intelligence and operational metrics</p>
        </div>
        <Link 
          href="/admin/editor/new"
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200"
        >
          <CopyPlus size={16} /> New Dispatch
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-blue-50 group-hover:scale-110 transition-transform">
            <FileText size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Articles</p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter mb-2">{stats.articles.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12% from last cycle</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-purple-50 group-hover:scale-110 transition-transform">
            <Activity size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Aggregate Views</p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter mb-2">{(stats.views / 1000).toFixed(1)}K</p>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+24% velocity gain</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 text-orange-50 group-hover:scale-110 transition-transform">
            <Users size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Nodes</p>
            <p className="text-4xl font-black text-slate-800 tracking-tighter mb-2">{stats.publishers}</p>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Operational stability high</span>
          </div>
        </motion.div>
      </div>
      
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl p-10 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
            <TrendingUp size={240} />
         </div>
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-white tracking-tight uppercase">Recent Intelligence Activity</h2>
               <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Stream Active</span>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {activity.map((act, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={act.id} 
                    className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer"
                  >
                     <div className={`p-2 rounded-lg ${act.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        <FileText size={16} />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{act.title}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(act.timestamp).toLocaleString()}</p>
                     </div>
                     <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border ${act.status === 'published' ? 'border-emerald-500/20 text-emerald-500' : 'border-slate-500/20 text-slate-500'}`}>
                        {act.status}
                     </div>
                  </motion.div>
               ))}
               {activity.length === 0 && (
                  <div className="col-span-2 py-12 text-center">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No recent neural activities detected</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
