"use client";

import React, { useEffect, useState } from "react";
import { 
  Users as UsersIcon, Edit2, Trash2, 
  Shield, UserCheck, UserX, Search,
  Plus, MoreVertical, Mail
} from "lucide-react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  avatar?: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    const token = Cookies.get("access_token");
    try {
      const res = await fetch("http://localhost:8000/admin/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const toggleUserStatus = async (user: User) => {
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`http://localhost:8000/admin/users/${user.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active: !user.is_active })
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                <UsersIcon size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">User Intelligence</h1>
           </div>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manage roles, permissions and platform access</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Find users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all w-64 shadow-sm"
              />
           </div>
           <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-200">
             <Plus size={16} /> Invite Member
           </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-300 gap-4">
           <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Syncing Authorization nodes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Role</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Context Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg shadow-inner overflow-hidden border border-slate-50">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.display_name[0]}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{user.display_name}</p>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                   <Mail size={12} />
                                   <p className="text-[10px] font-bold">{user.email}</p>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <div className="relative group">
                             <select 
                               value={user.role.toLowerCase()}
                               onChange={(e) => updateUserRole(user.id, e.target.value)}
                               className={`appearance-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest pr-10 border transition-all cursor-pointer ${user.role === 'admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : user.role === 'publisher' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                             >
                                <option value="viewer">Viewer</option>
                                <option value="publisher">Publisher</option>
                                <option value="admin">Admin</option>
                             </select>
                             <Shield className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={12} />
                          </div>
                       </td>
                       <td className="px-6 py-6">
                          <button 
                            onClick={() => toggleUserStatus(user)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.is_active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-200 text-slate-500'}`}
                          >
                             {user.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
                             {user.is_active ? 'Authorized' : 'Suspended'}
                          </button>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-2.5 hover:bg-white hover:shadow-lg rounded-xl transition-all text-slate-400 hover:text-indigo-600 group">
                                <Edit2 size={16} />
                             </button>
                             <button className="p-2.5 hover:bg-white hover:shadow-lg rounded-xl transition-all text-slate-400 hover:text-red-500 group">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </motion.tr>
                 ))}
                 {filteredUsers.length === 0 && (
                   <tr>
                     <td colSpan={4} className="py-20 text-center">
                        <UsersIcon size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zero nodes detected matching search parameters</p>
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      )}

      {/* Profile Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Node Distribution</h3>
              <div className="flex items-end gap-4 h-32">
                  <div className="flex-1 bg-indigo-600 rounded-t-xl" style={{height: '80%'}} />
                  <div className="flex-1 bg-emerald-500 rounded-t-xl" style={{height: '40%'}} />
                  <div className="flex-1 bg-slate-200 rounded-t-xl" style={{height: '20%'}} />
              </div>
          </div>
          <div className="col-span-2 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden text-white shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                 <Shield size={240} />
              </div>
              <div className="relative z-10 max-w-lg">
                 <h2 className="text-3xl font-black tracking-tight mb-4 leading-none">Authorization Protocol v2</h2>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">Administrators should exercise caution when escalating permissions. Automated audit logs capture all role mutations for system integrity.</p>
                 <div className="flex items-center gap-6">
                    <div>
                       <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Active Admins</p>
                       <p className="text-2xl font-black tracking-tighter">04</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                       <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Platform Publishers</p>
                       <p className="text-2xl font-black tracking-tighter">18</p>
                    </div>
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
}
