"use client";

import React, { useEffect, useState } from "react";
import { 
   Search, LayoutDashboard, FileText, Tags, Users, Inbox, Settings, 
   Zap, ChevronLeft, LogOut, Bell, Maximize2, MoreHorizontal, 
   CheckCircle2, Clock, AlertCircle, User as UserIcon, Filter, 
   ChevronRight, ChevronLeft as ChevronLeftIcon, Mail, Plus
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { API_BASE } from "@/lib/config";
import toast from "react-hot-toast";

interface Inquiry {
   id: string;
   full_name: string;
   email: string;
   subject: string;
   message: string;
   status: string;
   created_at: string;
}

export default function InquiriesPage() {
   const [inquiries, setInquiries] = useState<Inquiry[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

   const fetchInquiries = async () => {
      try {
         setIsLoading(true);
         const token = Cookies.get("access_token");
         const res = await fetch(`${API_BASE}/admin/inquiries`, {
            headers: {
               "Authorization": `Bearer ${token}`
            }
         });
         if (res.ok) {
            const data = await res.json();
            setInquiries(data);
         } else {
            toast.error("Failed to load inquiries");
         }
      } catch (err) {
         console.error(err);
         toast.error("Error connecting to server");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchInquiries();
   }, []);

   const updateStatus = async (inquiryId: string, newStatus: string) => {
      try {
         const token = Cookies.get("access_token");
         const res = await fetch(`${API_BASE}/admin/inquiries/${inquiryId}/status`, {
            method: "PATCH",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
         });
         if (res.ok) {
            toast.success(`Marked as ${newStatus}`);
            setInquiries(inquiries.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus } : inq));
         } else {
            toast.error("Failed to update status");
         }
      } catch (err) {
         console.error(err);
         toast.error("Error connecting to server");
      }
   };

   const getStatusStyles = (status: string) => {
      switch (status?.toLowerCase()) {
         case 'unread': return 'bg-blue-500 text-white';
         case 'read': return 'bg-emerald-500 text-white';
         case 'archived': return 'bg-slate-400 text-white';
         default: return 'bg-slate-100 text-slate-500';
      }
   };

   // Filter inquiries based on search term
   const filteredInquiries = inquiries.filter(inq => 
      inq.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.subject.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const unreadCount = inquiries.filter(i => i.status === 'unread').length;

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
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">A</div>
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
                     Unread <span className="bg-white/20 px-1.5 rounded-md">{unreadCount}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-all">
                     <CheckCircle2 size={12} /> Archived
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
                        <th className="py-2">Subject</th>
                        <th className="py-2">Message</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-right pr-6">Received</th>
                     </tr>
                  </thead>
                  <tbody>
                     {isLoading ? (
                        <tr>
                           <td colSpan={6} className="text-center py-10 text-slate-400 text-xs font-bold">Loading inquiries...</td>
                        </tr>
                     ) : filteredInquiries.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="text-center py-10 text-slate-400 text-xs font-bold">No inquiries found</td>
                        </tr>
                     ) : (
                        filteredInquiries.map((inquiry) => (
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
                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold uppercase">
                                       {inquiry.full_name.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="text-xs font-black text-slate-900">{inquiry.full_name}</p>
                                       <p className="text-[10px] font-bold text-slate-400">{inquiry.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-4 bg-white border-y border-slate-100">
                                 <span className="text-[10px] font-black text-slate-700">
                                    {inquiry.subject}
                                 </span>
                              </td>
                              <td className="py-4 bg-white border-y border-slate-100">
                                 <div 
                                    className="cursor-pointer group/msg relative"
                                    onClick={() => setSelectedInquiry(inquiry)}
                                    title="Click to view full message"
                                 >
                                    <span className="text-[10px] font-medium text-slate-500 line-clamp-2 max-w-[200px] group-hover/msg:text-indigo-600 transition-colors">
                                       {inquiry.message}
                                    </span>
                                 </div>
                              </td>
                              <td className="py-4 bg-white border-y border-slate-100">
                                 <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(inquiry.status)}`}>
                                    {inquiry.status}
                                 </span>
                              </td>
                              <td className="py-4 bg-white border-y border-r border-slate-100 last:rounded-r-2xl text-right pr-6">
                                 <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-black text-slate-600">
                                       {new Date(inquiry.created_at).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       {inquiry.status === 'unread' && (
                                          <button 
                                             onClick={() => updateStatus(inquiry.id, 'read')}
                                             className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded"
                                          >
                                             Mark Read
                                          </button>
                                       )}
                                       {inquiry.status !== 'archived' && (
                                          <button 
                                             onClick={() => updateStatus(inquiry.id, 'archived')}
                                             className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded"
                                          >
                                             Archive
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              </td>
                           </motion.tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </main>
            {/* Message Overlay Modal */}
         <AnimatePresence>
            {selectedInquiry && (
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                  onClick={() => setSelectedInquiry(null)}
               >
                  <motion.div 
                     initial={{ scale: 0.95, opacity: 0, y: 10 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0.95, opacity: 0, y: 10 }}
                     onClick={(e) => e.stopPropagation()}
                     className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
                  >
                     <button 
                        onClick={() => setSelectedInquiry(null)}
                        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors text-lg pb-1"
                     >
                        &times;
                     </button>
                     
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 font-bold uppercase text-lg">
                           {selectedInquiry.full_name.charAt(0)}
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-slate-900">{selectedInquiry.full_name}</h3>
                           <p className="text-[10px] font-bold text-slate-400">{selectedInquiry.email}</p>
                        </div>
                     </div>
                     
                     <div className="mb-6">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Subject</h4>
                        <p className="text-sm font-bold text-slate-700">{selectedInquiry.subject}</p>
                     </div>
                     
                     <div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Message</h4>
                        <div className="text-xs font-medium text-slate-600 whitespace-pre-wrap max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar leading-relaxed">
                           {selectedInquiry.message}
                        </div>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
