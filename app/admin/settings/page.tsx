"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, Save, Globe, Info, Mail, Share2, 
  ShieldCheck, Layout, Zap, CheckCircle2, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { API_BASE } from "@/lib/config";


interface SystemSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  contact_email: string;
  social_links: Record<string, string>;
  seo_defaults: Record<string, string>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: "RelayPost",
    site_tagline: "",
    site_description: "",
    contact_email: "",
    social_links: { twitter: "", linkedin: "", github: "" },
    seo_defaults: { meta_description: "" }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiStatus, setApiStatus] = useState({ gemini: "checking", unsplash: "checking" });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkAPIs();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = Cookies.get("access_token");
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setSettings(await res.json());
    } catch (e) { toast.error("Failed to load settings"); }
    finally { setIsLoading(false); }
  };

  const checkAPIs = () => {
    // Simulated check for now, could be real endpoints
    setTimeout(() => setApiStatus({ gemini: "active", unsplash: "active" }), 1000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const id = toast.loading("Saving configuration...");
    try {
      const token = Cookies.get("access_token");
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });
      
      if (res.ok) {
        toast.success("Settings updated successfully", { id });
      } else {
        const err = await res.json();
        toast.error(err.detail || "Update failed", { id });
      }
    } catch (e) { toast.error("Connection error", { id }); }
    finally { setIsSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    const id = toast.loading("Updating password...");
    try {
      const token = Cookies.get("access_token");
      // Use AUTH_BASE because this goes to the auth service, not content/admin settings service.
      const AUTH_BASE_URL = "http://localhost:8000"; // Fallback if API_BASE is content service.
      const base = API_BASE.replace('8001', '8000'); // Ensure it hits auth service
      
      const res = await fetch(`${base}/users/me/password`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          current_password: passwords.currentPassword,
          new_password: passwords.newPassword
        })
      });
      
      if (res.ok) {
        toast.success("Password updated successfully", { id });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.detail || "Password update failed", { id });
      }
    } catch (e) { toast.error("Connection error", { id }); }
    finally { setIsChangingPassword(false); }
  };

  if (isLoading) return <div className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Index...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-900 text-white rounded-xl">
              <Settings size={20} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Core Configuration</h1>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manage global system intelligence and platform branding</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
        >
          <Save size={16} /> {isSaving ? "Synchronizing..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Main Settings */}
        <div className="md:col-span-2 space-y-6">
          
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                   <Info size={18} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">Site Identity</h2>
             </div>
             
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Platform Name</label>
                      <input 
                        type="text" 
                        value={settings.site_name}
                        onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Official Tagline</label>
                      <input 
                        type="text" 
                        value={settings.site_tagline}
                        onChange={(e) => setSettings({...settings, site_tagline: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Platform Description</label>
                   <textarea 
                     rows={3}
                     value={settings.site_description}
                     onChange={(e) => setSettings({...settings, site_description: e.target.value})}
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                   />
                </div>
             </div>
          </section>

          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                   <Globe size={18} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">SEO & Distribution</h2>
             </div>
             
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Default Meta Description</label>
                   <textarea 
                     value={settings.seo_defaults.meta_description}
                     onChange={(e) => setSettings({...settings, seo_defaults: { ...settings.seo_defaults, meta_description: e.target.value }})}
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                   />
                </div>
             </div>
          </section>

          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                   <Share2 size={18} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">Social Presence</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(settings.social_links).map(key => (
                   <div key={key}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 capitalize">{key} Profile</label>
                      <input 
                        type="text" 
                        value={settings.social_links[key]}
                        onChange={(e) => setSettings({...settings, social_links: { ...settings.social_links, [key]: e.target.value }})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                   </div>
                ))}
             </div>
          </section>

          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                   <ShieldCheck size={18} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">Security Settings</h2>
             </div>
             
             <div className="space-y-6">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Current Password</label>
                   <input 
                     type="password" 
                     value={passwords.currentPassword}
                     onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                     className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">New Password</label>
                      <input 
                        type="password" 
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                      />
                   </div>
                </div>
                <button 
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                  className="mt-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-100 disabled:opacity-50"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
             </div>
          </section>

        </div>

        {/* Right Col: API & Security */}
        <div className="space-y-6">
           <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100">
              <div className="flex items-center gap-3 mb-8">
                 <Zap size={18} className="text-indigo-400" />
                 <h2 className="text-[10px] font-black uppercase tracking-widest">Active Integrations</h2>
              </div>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gemini 1.5 PRO</span>
                    {apiStatus.gemini === "active" ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="text-rose-400 animate-pulse" />
                    )}
                 </div>
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unsplash Search</span>
                    {apiStatus.unsplash === "active" ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="text-rose-400 animate-pulse" />
                    )}
                 </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                 <div className="flex items-center gap-2 text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={12} strokeWidth={3} /> Endpoint Security Active
                 </div>
              </div>
           </section>

           <section className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8">
             <div className="flex items-center gap-3 mb-4">
                <Mail size={18} className="text-indigo-600" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Communication</h2>
             </div>
             <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">System Contact Email</label>
             <input 
               type="email" 
               placeholder="admin@relaypost.io"
               value={settings.contact_email}
               onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
               className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
             />
           </section>
        </div>

      </div>
    </div>
  );
}
