"use client";

import React, { useState } from "react";
import { 
   Search, LayoutDashboard, FileText, Tags, Users, Inbox, Settings, 
   Zap, ChevronLeft, LogOut, Bell, Maximize2, MoreHorizontal, 
   CheckCircle2, Clock, AlertCircle, User as UserIcon, Filter, 
   ChevronRight, ChevronLeft as ChevronLeftIcon, Mail, Plus
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_INQUIRIES = [
   { 
      id: 1, 
      user: { name: "John Doe", email: "john.doe@sample.com", avatar: "https://i.pravatar.cc/150?u=john" },
      status: "New",
      assignedTo: { name: "Admin", avatar: "https://i.pravatar.cc/150?u=admin" },
      priority: "High",
      impact: "High",
      received: "5 mins ago"
   },
   { 
      id: 2, 
      user: { name: "Jane Smith", email: "jane.smith@example.com", avatar: "https://i.pravatar.cc/150?u=jane" },
      status: "Open",
      assignedTo: { name: "John Doe", avatar: "https://i.pravatar.cc/150?u=john" },
      priority: "Normal",
      impact: "Normal",
      received: "1 hour ago"
   },
   { 
      id: 3, 
      user: { name: "Alex Johnson", email: "alex.johnson@example.com", avatar: "https://i.pravatar.cc/150?u=alex" },
      status: "Open",
      assignedTo: { name: "Unassigned", avatar: null },
      priority: "Medium",
      impact: "Medium",
      received: "2 hours ago"
   },
   { 
      id: 4, 
      user: { name: "Emily Davis", email: "emily.davis@example.com", avatar: "https://i.pravatar.cc/150?u=emily" },
      status: "Closed",
      assignedTo: { name: "Jane Smith", avatar: "https://i.pravatar.cc/150?u=jane" },
      priority: "Low",
      impact: "Low",
      received: "1 day ago"
   },
   { 
      id: 5, 
      user: { name: "Daniel Brown", email: "daniel.brown@sample.com", avatar: "https://i.pravatar.cc/150?u=daniel" },
      status: "New",
      assignedTo: { name: "Unassigned", avatar: null },
      priority: "High",
      impact: "High",
      received: "2 days ago"
   },
   { 
      id: 6, 
      user: { name: "Sarah Wilson", email: "sarah.wilson@example.com", avatar: "https://i.pravatar.cc/150?u=sarah" },
      status: "Open",
      assignedTo: { name: "Admin", avatar: "https://i.pravatar.cc/150?u=admin" },
      priority: "Normal",
      impact: "Normal",
      received: "3 days ago"
   }
];

export default function InquiriesPage() {
   const [activeTab, setActiveTab] = useState("unread");
   const [searchTerm, setSearchTerm] = useState("");

   const getStatusStyles = (status: string) => {
      switch (status.toLowerCase()) {
         case 'new': return 'bg-blue-500 text-white';
         case 'open': return 'bg-emerald-500 text-white';
         case 'closed': return 'bg-slate-400 text-white';
         default: return 'bg-slate-100 text-slate-500';
      }
   };

   const getPriorityStyles = (priority: string, type: 'primary' | 'secondary' = 'primary') => {
      if (type === 'primary') {
         switch (priority.toLowerCase()) {
            case 'high': return 'bg-teal-500 text-white';
            case 'normal': return 'bg-slate-700 text-white';
            case 'medium': return 'bg-orange-400 text-white';
            case 'low': return 'bg-blue-300 text-white';
            default: return 'bg-slate-100 text-slate-500';
         }
      } else {
         switch (priority.toLowerCase()) {
            case 'high': return 'bg-rose-500 text-white';
            case 'normal': return 'bg-indigo-500 text-white';
            case 'medium': return 'bg-amber-500 text-white';
            case 'low': return 'bg-slate-400 text-white';
            default: return 'bg-slate-100 text-slate-500';
         }
      }
   };

   return (
      <div className="flex ml-5 h-screen bg-[#F1F5F9] overflow-hidden font-sans relative">
         
         {/* Global Header */}
         <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-2xl border-b border-slate-200 z-[200] flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200/50">
                  <Inbox size={14} className="text-slate-900" />
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Inquiries</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <button className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Bell size={18} />
               </button>
               <button className="text-slate-400 hover:text-slate-900 transition-colors">
                  <Maximize2 size={18} />
               </button>
               <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">N</div>
               </div>
            </div>
         </div>

        

         {/* Main Content Card */}
         <main className="flex-1 m-6 ml-0 mt-20 bg-white rounded-[1.5rem] border border-slate-200/50 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
            
            {/* Dashboard Header */}
            <div className="p-10 pb-6 border-b border-slate-50">
               <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer <span className="italic font-serif text-slate-400">Inquiries</span></h1>
                  <div className="relative w-80">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                        type="text" 
                        placeholder="Search inquiries..." 
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
               </div>
               <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
                  Manage and respond to user <span className="font-bold text-slate-900">Inquiries</span> and messages. Respond promptly to ensure customer satisfaction.
               </p>
            </div>

            {/* Tabs & Actions */}
            <div className="px-10 py-4 flex items-center justify-between bg-slate-50/30">
               <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all">
                     <Filter size={12} /> All
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 transition-all">
                     Unread <span className="bg-white/20 px-1.5 rounded-md">6</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-all">
                     <UserIcon size={12} /> Assigned
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-all">
                     <CheckCircle2 size={12} /> Closed
                  </button>
               </div>

               <div className="flex items-center gap-3">
                  <button className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-3 hover:bg-slate-50 transition-all">
                     Bulk Actions <ChevronDown size={14} />
                  </button>
                  <button className="px-6 py-2 rounded-xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 flex items-center gap-2">
                     <Users size={14} /> Assign
                  </button>
               </div>
            </div>

            {/* Inquiries Table */}
            <div className="flex-1 overflow-y-auto px-6">
               <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                     <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="pl-6 py-2"><input type="checkbox" className="rounded border-slate-300" /></th>
                        <th className="py-2">User</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Assigned To</th>
                        <th className="py-2">Priority</th>
                        <th className="py-2">Priority</th>
                        <th className="py-2 text-right pr-6">Received</th>
                     </tr>
                  </thead>
                  <tbody>
                     {MOCK_INQUIRIES.map((inquiry) => (
                        <motion.tr 
                           key={inquiry.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="group hover:bg-slate-50/50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md border border-slate-100"
                        >
                           <td className="pl-6 py-6 bg-white first:rounded-l-2xl border-y border-l border-slate-100">
                              <input type="checkbox" className="rounded border-slate-300" />
                           </td>
                           <td className="py-4 bg-white border-y border-slate-100">
                              <div className="flex items-center gap-4">
                                 <img src={inquiry.user.avatar} className="w-10 h-10 rounded-full border-2 border-slate-50 shadow-sm" alt={inquiry.user.name} />
                                 <div>
                                    <p className="text-xs font-black text-slate-900">{inquiry.user.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{inquiry.user.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 bg-white border-y border-slate-100">
                              <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(inquiry.status)}`}>
                                 {inquiry.status}
                              </span>
                           </td>
                           <td className="py-4 bg-white border-y border-slate-100">
                              <div className="flex items-center gap-3">
                                 {inquiry.assignedTo.avatar ? (
                                    <img src={inquiry.assignedTo.avatar} className="w-6 h-6 rounded-full border border-slate-100" />
                                 ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200" />
                                 )}
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-700">{inquiry.assignedTo.name}</span>
                                    {inquiry.assignedTo.name !== 'Unassigned' && <span className="text-[8px] font-bold text-slate-400">Admin</span>}
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 bg-white border-y border-slate-100">
                              <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getPriorityStyles(inquiry.priority, 'primary')}`}>
                                 {inquiry.priority}
                              </span>
                           </td>
                           <td className="py-4 bg-white border-y border-slate-100">
                              <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getPriorityStyles(inquiry.priority, 'secondary')}`}>
                                 {inquiry.priority}
                              </span>
                           </td>
                           <td className="py-4 bg-white border-y border-r border-slate-100 last:rounded-r-2xl text-right pr-6">
                              <div className="flex flex-col items-end">
                                 <span className="text-[10px] font-black text-slate-600">{inquiry.received}</span>
                                 <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-50 rounded-lg">
                                    <MoreHorizontal size={14} className="text-slate-400" />
                                 </button>
                              </div>
                           </td>
                        </motion.tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            <div className="p-8 px-10 border-t border-slate-50 flex items-center justify-between bg-slate-50/10">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1-6 of 234</span>
               <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                     <ChevronLeftIcon size={14} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border-2 border-indigo-600 text-indigo-600 text-[10px] font-black">
                     1
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all">
                     <ChevronRight size={14} />
                  </button>
               </div>
            </div>
         </main>
      </div>
   );
}

function ChevronDown({ size, className }: { size?: number, className?: string }) {
   return (
      <svg 
         width={size || 16} 
         height={size || 16} 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="2" 
         strokeLinecap="round" 
         strokeLinejoin="round" 
         className={className}
      >
         <path d="m6 9 6 6 6-6"/>
      </svg>
   )
}
