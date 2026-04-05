"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CopyPlus, TrendingUp, Users, Activity, FileText } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    articles: 0,
    views: 0,
    publishers: 0
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back to the command center.</p>
        </div>
        <Link 
          href="/admin/editor/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <CopyPlus size={18} /> New Article
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div>
            <span className="text-xs font-bold text-green-500 flex items-center gap-1"><TrendingUp size={12} /> +12%</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Articles</h3>
          <p className="text-2xl font-bold text-gray-800">1,248</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20} /></div>
            <span className="text-xs font-bold text-green-500 flex items-center gap-1"><TrendingUp size={12} /> +24%</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Monthly Views</h3>
          <p className="text-2xl font-bold text-gray-800">45.2K</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users size={20} /></div>
            <span className="text-xs font-bold text-gray-400">Stable</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Active Publishers</h3>
          <p className="text-2xl font-bold text-gray-800">12</p>
        </div>
      </div>
      
      {/* Needs dynamic data integration later */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 line-through opacity-50">
         <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity (To be implemented)</h2>
         <p className="text-sm text-gray-500">Connecting to API...</p>
      </div>
    </div>
  );
}
