"use client";

import React, { useEffect, useState } from "react";
import { 
  Inbox, CheckCircle, XCircle, 
  Eye, MessageSquare, Clock, 
  Trash2, User, FileText, ExternalLink,
  ChevronRight, Filter, Search
} from "lucide-react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

interface Contribution {
  id: string;
  user_id: string;
  content_type: string;
  header: string;
  main_content: string;
  status: string;
  admin_notes?: string;
  created_at: string;
}

export default function ContributionsManagement() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  useEffect(() => {
    fetchContributions();
  }, [filterStatus]);

  const fetchContributions = async () => {
    setIsLoading(true);
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`http://localhost:8001/admin/contributions?status=${filterStatus}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setContributions(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch contributions", e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes: string = "") => {
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`http://localhost:8001/admin/contributions/${id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, admin_notes: notes })
      });
      if (res.ok) {
         fetchContributions();
         setSelectedContribution(null);
      }
    } catch (e) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-8 h-[calc(100vh-120px)] overflow-hidden">
      {/* Left Sidebar: List */}
      <div className="w-1/3 flex flex-col gap-6 overflow-hidden">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                <Inbox size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Intelligence Queue</h1>
           </div>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Inbound submissions and research contributions</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
           {['pending', 'approved', 'rejected'].map(s => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s)}
                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${filterStatus === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {s}
              </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
           {isLoading ? (
             <div className="text-center py-20 text-[10px] font-black uppercase text-slate-300 animate-pulse">Scanning Inbound Packets...</div>
           ) : contributions.length > 0 ? (
             contributions.map((c) => (
                <button 
                  key={c.id}
                  onClick={() => setSelectedContribution(c)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all hover:scale-[1.02] group ${selectedContribution?.id === c.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100'}`}
                >
                   <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${selectedContribution?.id === c.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                         {c.content_type}
                      </span>
                      <span className={`text-[8px] font-bold ${selectedContribution?.id === c.id ? 'text-white/60' : 'text-slate-400'}`}>
                         {new Date(c.created_at).toLocaleDateString()}
                      </span>
                   </div>
                   <h4 className={`text-sm font-black mb-1 line-clamp-2 ${selectedContribution?.id === c.id ? 'text-white' : 'text-slate-800'}`}>{c.header}</h4>
                   <p className={`text-[10px] line-clamp-2 leading-relaxed ${selectedContribution?.id === c.id ? 'text-white/70' : 'text-slate-500'}`}>
                      {c.main_content}
                   </p>
                </button>
             ))
           ) : (
             <div className="text-center py-24 text-slate-300">
                <Clock size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">Queue Clear</p>
             </div>
           )}
        </div>
      </div>

      {/* Right Content: Detail View */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
          {selectedContribution ? (
             <>
               <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                        <User size={28} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Contributor ID: {selectedContribution.user_id.slice(0, 8)}</p>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Analysis Request</h3>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => updateStatus(selectedContribution.id, 'rejected')}
                       className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                     >
                        <XCircle size={20} />
                     </button>
                     <button 
                       onClick={() => updateStatus(selectedContribution.id, 'approved')}
                       className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
                     >
                        <CheckCircle size={18} /> Approve Entry
                     </button>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-8">
                  <div className="space-y-2">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight uppercase">{selectedContribution.header}</h2>
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Verified Source Contribution</span>
                     </div>
                  </div>
                  
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                     <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        {selectedContribution.main_content}
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                        <h5 className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Transmission Type</h5>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                           <FileText size={16} className="text-indigo-600" />
                           {selectedContribution.content_type} dispatch
                        </p>
                     </div>
                     <div className="p-6 bg-white border border-slate-100 rounded-2xl">
                        <h5 className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">System Priority</h5>
                        <p className="text-sm font-black text-emerald-600 uppercase tracking-tight flex items-center gap-2">
                           <Clock size={16} />
                           High Fidelity
                        </p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Administrative Notes</label>
                     <textarea 
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 min-h-[120px]"
                       placeholder="Enter technical assessment or feedback for the contributor..."
                     />
                  </div>
               </div>
             </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                   <Inbox size={64} className="opacity-10" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-[0.4em]">Node Selection Required</h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest">Select a contribution packet from the queue to begin review</p>
             </div>
          )}
      </div>
    </div>
  );
}
