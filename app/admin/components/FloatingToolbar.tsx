"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Bold, Italic, Link as LinkIcon, Type, 
  ChevronDown, MessageSquare, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

export default function FloatingToolbar({ onFormat }: FloatingToolbarProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setIsVisible(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setPosition({
      top: rect.top + window.scrollY - 60,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setSelection(sel);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", updatePosition);
    document.addEventListener("keyup", updatePosition);
    return () => {
      document.removeEventListener("mouseup", updatePosition);
      document.removeEventListener("keyup", updatePosition);
    };
  }, [updatePosition]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        style={{ 
          position: "absolute", 
          top: position.top, 
          left: position.left, 
          transform: "translateX(-50%)" 
        }}
        className="z-[90] flex items-center bg-slate-900 text-white rounded-2xl shadow-2xl p-1.5 border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-1 px-1">
           <button 
             onClick={() => onFormat("bold")}
             className="p-2 hover:bg-white/10 rounded-xl transition-all"
           >
             <Bold size={16} className="text-indigo-400" />
           </button>
           <button 
             onClick={() => onFormat("italic")}
             className="p-2 hover:bg-white/10 rounded-xl transition-all"
           >
             <Italic size={16} className="text-indigo-400" />
           </button>
           <button 
             onClick={() => {
               const url = prompt("Enter URL:");
               if(url) onFormat("createLink", url);
             }}
             className="p-2 hover:bg-white/10 rounded-xl transition-all"
           >
             <LinkIcon size={16} className="text-indigo-400" />
           </button>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <div className="flex items-center gap-1 px-1">
           <button className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-slate-400">
             <Type size={14} /> Normal <ChevronDown size={10} />
           </button>
           <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20">
             <Sparkles size={14} /> AI Rewrite
           </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
