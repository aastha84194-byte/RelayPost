"use client";

import React, { useEffect, useState } from "react";
import { 
  Users as UsersIcon, Edit2, Trash2, 
  Shield, UserCheck, UserX, Search,
  Plus, MoreVertical, Mail, UserPlus
} from "lucide-react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { AUTH_BASE } from "@/lib/config";


interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  avatar?: string;
  created_at?: string;
  tier: string;
  subscription_status: string;
  country?: string;
  state?: string;
  city?: string;
  timezone?: string;
}


export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${AUTH_BASE}/admin/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${AUTH_BASE}/admin/invites`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      if (res.ok) {
        setIsInviteModalOpen(false);
        setInviteEmail("");
        toast.success("Invitation sent successfully!");
      } else {
        const err = await res.json();
        const errMsg = typeof err.detail === 'string' ? err.detail : (Array.isArray(err.detail) ? err.detail[0]?.msg : null);
        toast.error(errMsg || "Invitation failed");
      }
    } catch (e) { toast.error("Invitation failed"); }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${AUTH_BASE}/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
           display_name: selectedUser.display_name,
           role: selectedUser.role,
           is_active: selectedUser.is_active
        })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchUsers();
        toast.success("User protocol updated");
      } else {
        const err = await res.json();
        const errMsg = typeof err.detail === 'string' ? err.detail : (Array.isArray(err.detail) ? err.detail[0]?.msg : null);
        toast.error(errMsg || "Update failed");
      }
    } catch (e) { toast.error("Update failed"); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This will deactivate their account.")) return;

    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${AUTH_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("User deleted successfully");
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const err = await res.json();
        const errMsg = typeof err.detail === 'string' ? err.detail : (Array.isArray(err.detail) ? err.detail[0]?.msg : null);
        toast.error(errMsg || "Deletion failed");
      }
    } catch (e) { toast.error("Deletion failed"); }
  };

  const handleOverrideSubscription = async () => {
    if (!selectedUser) return;
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${AUTH_BASE}/admin/users/${selectedUser.id}/subscription`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tier: selectedUser.tier || "free" })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchUsers();
        toast.success("Subscription tier updated");
      } else {
        const err = await res.json();
        const errMsg = typeof err.detail === 'string' ? err.detail : (Array.isArray(err.detail) ? err.detail[0]?.msg : null);
        toast.error(errMsg || "Subscription update failed");
      }
    } catch (e) { toast.error("Subscription update failed"); }
  };


  const toggleUserStatus = async (user: User) => {
    const token = Cookies.get("access_token");
    try {
      await fetch(`${AUTH_BASE}/admin/users/${user.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                <UsersIcon size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">User Nodes</h1>
           </div>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manage access levels and identity permissions</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200"
        >
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
           <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Syncing identity repository...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tier</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {users.map((user) => (
                    <motion.tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-sm uppercase">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" /> : user.display_name?.charAt(0) || user.email.charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{user.display_name || "New Node"}</p>
                                <p className="text-[10px] font-bold text-slate-400">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            user.role === 'publisher' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                             {user.role}
                          </span>
                       </td>
                       <td className="px-6 py-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            user.tier === 'pro' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                            user.tier === 'plus' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                             {user.tier}
                          </span>
                       </td>
                       <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{user.city ? `${user.city}, ${user.country}` : (user.country || 'Unknown')}</span>
                            <span className="text-[10px] text-slate-400">{user.timezone || 'N/A'}</span>
                          </div>
                       </td>
                       <td className="px-6 py-6 font-bold text-xs uppercase text-slate-500">
                          <button 
                            onClick={() => toggleUserStatus(user)}
                            className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-all ${user.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}
                          >
                             <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{user.is_active ? 'Active' : 'Offline'}</span>
                          </button>
                       </td>
                       <td className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Historical'}
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                               className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                               onClick={() => handleDeleteUser(user.id)}
                               className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </motion.tr>
                 ))}
                 {users.length === 0 && !isLoading && (
                   <tr>
                     <td colSpan={7} className="py-20 text-center">
                        <UsersIcon size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zero nodes detected</p>
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      )}

      {/* Invitation Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)} />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-slate-100"
             >
                <div className="mb-8">
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase mb-2">Team Expansion</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connect new nodes to the intelligence network</p>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Node Email</label>
                      <input 
                        type="email" 
                        placeholder="identity@relaypost.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Access Protocol (Role)</label>
                      <select 
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      >
                         <option value="viewer">Viewer (Read Only)</option>
                         <option value="publisher">Publisher (Editor)</option>
                         <option value="admin">Administrator (Manager)</option>
                      </select>
                   </div>

                   <div className="pt-4 flex gap-3">
                      <button 
                        onClick={() => setIsInviteModalOpen(false)}
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                      >
                         Abort
                      </button>
                      <button 
                        onClick={handleInvite}
                        disabled={!inviteEmail}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                         Authorize & Send
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }} 
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-slate-100"
             >
                <div className="mb-8 text-center">
                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
                      {selectedUser.display_name?.charAt(0) || selectedUser.email.charAt(0)}
                   </div>
                   <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-1">Modify Node</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedUser.email}</p>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Display Identity</label>
                      <input 
                        type="text" 
                        value={selectedUser.display_name || ""}
                        onChange={(e) => setSelectedUser({...selectedUser, display_name: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                   </div>

                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Access Protocol</label>
                      <select 
                        value={selectedUser.role}
                        onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as any})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all"
                      >
                         <option value="viewer">Viewer</option>
                         <option value="publisher">Publisher</option>
                         <option value="admin">Administrator</option>
                      </select>
                   </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Subscription Tier (Override)</label>
                       <select 
                         value={selectedUser.tier || "free"}
                         onChange={(e) => setSelectedUser({...selectedUser, tier: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none transition-all"
                       >
                          <option value="free">Free</option>
                          <option value="plus">Plus</option>
                          <option value="pro">Pro</option>
                       </select>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                       <div className="flex gap-3">
                         <button 
                           onClick={() => setIsEditModalOpen(false)}
                           className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                         >
                            Cancel
                         </button>
                         <button 
                           onClick={handleUpdateUser}
                           className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                         >
                            Update Access
                         </button>
                       </div>
                       <button 
                         onClick={handleOverrideSubscription}
                         className="w-full py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-100 hover:bg-violet-700 transition-all"
                       >
                          Override Subscription Tier
                       </button>
                    </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
