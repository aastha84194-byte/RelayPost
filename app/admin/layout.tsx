"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, Users, Tags, LogOut, ChevronLeft, Inbox } from "lucide-react";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [unreadInquiries, setUnreadInquiries] = useState(0);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Basic JWT decode for the payload
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      if (decodedPayload.role === "admin" || decodedPayload.role === "ADMIN" || decodedPayload.role === "publisher" || decodedPayload.role === "PUBLISHER") {
        setRole(decodedPayload.role.toUpperCase());
        setIsAuthorized(true);
      } else {
        router.push("/"); // Not authorized
      }
    } catch (e) {
      console.error("Token decoding failed", e);
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthorized || role !== 'ADMIN') return;
      try {
        const token = Cookies.get("access_token");
        const res = await fetch(`${API_BASE}/admin/inquiries/notifications`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadInquiries(data.unread_count);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthorized, role]);

  const handleLogout = () => {
    Cookies.remove("access_token");
    router.push("/");
  };

  if (!isAuthorized) {
    return <div className="h-screen w-full flex items-center justify-center">Authenticating...</div>;
  }

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">Relay Workspace</h1>
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider px-1.5 py-0.5 bg-indigo-50 rounded bg-opacity-50">{role}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors font-medium text-sm">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/articles" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors font-medium text-sm">
            <FileText size={18} /> Articles
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors font-medium text-sm">
            <Tags size={18} /> Categories & Tags
          </Link>
          
          {role === 'ADMIN' && (
            <>
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors font-medium text-sm">
                <Users size={18} /> Users & Roles
              </Link>
              <Link href="/admin/inquiries" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors font-medium text-sm">
                <div className="flex items-center gap-3">
                  <Inbox size={18} /> Inquiries
                </div>
                {unreadInquiries > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadInquiries}
                  </span>
                )}
              </Link>
            </>
          )}

          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-colors font-medium text-sm">
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
           <Link href="/" className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-800 text-xs font-semibold rounded-lg transition-colors border border-gray-200 justify-center">
             <ChevronLeft size={14} /> Back to Live Site
           </Link>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
           >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>
    </div>
  );
}
