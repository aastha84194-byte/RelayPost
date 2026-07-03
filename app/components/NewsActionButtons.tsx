"use client";
import React from 'react';
import { Share2, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function NewsActionButtons() {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleBookmark = () => {
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error("You need to sign in to save articles");
      return;
    }
    toast.success("Article saved to your profile!");
  };

  return (
    <div className="flex gap-4">
      <button onClick={handleShare} className="p-2 rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-colors">
        <Share2 size={18} />
      </button>
      <button onClick={handleBookmark} className="p-2 rounded-full border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-colors">
        <Bookmark size={18} />
      </button>
    </div>
  );
}
