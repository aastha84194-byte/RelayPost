"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Bold, Italic, Link as LinkIcon, Type, 
  ChevronDown, MessageSquare, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onAIRewrite: (intent: string) => void;
}

const FONT_SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Title", value: "7" },
];

export default function FloatingToolbar({ onFormat, onAIRewrite }: FloatingToolbarProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setIsVisible(false);
      setShowSizes(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate center-top position relative to VIEWPORT (fixed)
    // No more window.scrollY/scrollX needed
    const top = rect.top - 60;
    const left = rect.left + rect.width / 2;

    setPosition({ top, left });
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // We only update position on mouseup/keyup outside the toolbar
    const handleEvents = (e: MouseEvent | KeyboardEvent) => {
      // If clicking inside the toolbar, don't re-calculate or hide (unless it's a specific action)
      const toolbar = document.getElementById("floating-toolbar");
      if (toolbar?.contains(e.target as Node)) return;
      
      updatePosition();
    };

    document.addEventListener("mouseup", handleEvents);
    document.addEventListener("keyup", handleEvents);
    window.addEventListener("scroll", updatePosition); // Also update on scroll
    return () => {
      document.removeEventListener("mouseup", handleEvents);
      document.removeEventListener("keyup", handleEvents);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [updatePosition]);

  const handleAIRewrite = async (intent: string) => {
    setIsAiLoading(true);
    await onAIRewrite(intent);
    setIsAiLoading(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        id="floating-toolbar"
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        style={{ 
          position: "fixed", 
          top: position.top, 
          left: position.left, 
          transform: "translateX(-50%)" 
        }}
        className="z-[100] flex items-center bg-slate-900 text-white rounded-2xl shadow-2xl p-1.5 border border-white/10 backdrop-blur-md"
      >
        <div className="flex items-center gap-1 px-1">
           <button 
             onMouseDown={(e) => e.preventDefault()}
             onClick={() => onFormat("bold")}
             className="p-2 hover:bg-white/10 rounded-xl transition-all"
             title="Bold"
           >
             <Bold size={16} className="text-white" />
           </button>
           <button 
             onMouseDown={(e) => e.preventDefault()}
             onClick={() => onFormat("italic")}
             className="p-2 hover:bg-white/10 rounded-xl transition-all"
             title="Italic"
           >
             <Italic size={16} className="text-white" />
           </button>
           <button 
             onMouseDown={(e) => e.preventDefault()}
             onClick={() => {
               const url = prompt("Enter URL:");
               if(url) onFormat("createLink", url);
             }}
             className="p-2 hover:bg-white/10 rounded-xl transition-all"
             title="Link"
           >
             <LinkIcon size={16} className="text-white" />
           </button>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <div className="flex items-center gap-1 px-1 relative">
           <button 
             onMouseDown={(e) => e.preventDefault()}
             onClick={() => setShowSizes(!showSizes)}
             className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-slate-300"
           >
             <Type size={14} /> Size <ChevronDown size={10} />
           </button>
           
           {showSizes && (
             <motion.div 
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute bottom-full mb-3 left-0 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[100px]"
             >
               {FONT_SIZES.map(s => (
                 <button 
                    key={s.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onFormat("fontSize", s.value);
                      setShowSizes(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-indigo-600 transition-colors"
                 >
                   {s.label}
                 </button>
               ))}
             </motion.div>
           )}

           <button 
             onMouseDown={(e) => e.preventDefault()}
             onClick={() => handleAIRewrite("professional")}
             disabled={isAiLoading}
             className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50"
           >
             <Sparkles size={14} className={isAiLoading ? 'animate-spin' : ''} />
             {isAiLoading ? 'Intellectualizing...' : 'AI Rewrite'}
           </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
