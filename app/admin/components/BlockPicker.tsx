"use client";

import React from "react";
import {
  Type, Image as ImageIcon, BarChart3,
  Table as TableIcon, Quote as QuoteIcon,
  Minus, List as ListIcon, Video,
  Code as CodeIcon, MessageSquare, HelpCircle,
  Zap, AlignLeft, LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import { SectionType } from "@/lib/types";

interface BlockPickerProps {
  onAdd: (type: SectionType) => void;
  variant?: 'grid' | 'navbar';
}

const BLOCK_TYPES = [
  { id: 'heading', icon: Type, label: 'Heading', color: 'bg-indigo-500', desc: 'H1-H6 titles' },
  { id: 'paragraph', icon: AlignLeft, label: 'Text', color: 'bg-slate-500', desc: 'Standard content' },
  { id: 'image', icon: ImageIcon, label: 'Media', color: 'bg-emerald-500', desc: 'Images & GIFs' },
  { id: 'quote', icon: QuoteIcon, label: 'Quote', color: 'bg-amber-500', desc: 'Expert insights' },
  { id: 'bullet_list', icon: ListIcon, label: 'List', color: 'bg-blue-500', desc: 'Bulleted info' },
  { id: 'graph', icon: BarChart3, label: 'Visual', color: 'bg-rose-500', desc: 'Data charts' },
  { id: 'table', icon: TableIcon, label: 'Table', color: 'bg-cyan-500', desc: 'Grid data' },
  { id: 'code_block', icon: CodeIcon, label: 'Code', color: 'bg-slate-900', desc: 'Syntax display' },
  { id: 'faq_block', icon: MessageSquare, label: 'FAQ', color: 'bg-violet-500', desc: 'Q&A sections' },
  { id: 'callout', icon: HelpCircle, label: 'Insight', color: 'bg-orange-500', desc: 'Featured notes' },
  { id: 'cta_block', icon: Zap, label: 'Action', color: 'bg-red-500', desc: 'Click buttons' },
  { id: 'youtube_embed', icon: Video, label: 'Video', color: 'bg-pink-500', desc: 'YT/Vimeo frames' },
  { id: 'divider', icon: Minus, label: 'Space', color: 'bg-slate-200', desc: 'Visual separator' }
];

export default function BlockPicker({ onAdd, variant = 'grid' }: BlockPickerProps) {
  if (variant === 'navbar') {
    return (
      <div className="flex  items-center justify-center gap-0.5 w-max overflow-x-auto no-scrollbar">
        {BLOCK_TYPES.map((block) => (
          <motion.button
            key={block.id}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onAdd(block.id as SectionType)}
            className="group relative flex flex-col items-center justify-center min-w-[34px] h-8 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            title={block.label}
          >
            <div className={`w-7 h-7 ${block.color} rounded-md flex items-center justify-center text-white shadow-sm group-hover:shadow-indigo-200 transition-all`}>
              <block.icon size={14} />
            </div>
            
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] shadow-2xl">
              {block.label}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900" />
            </div>
          </motion.button>
        ))}
        <div className="h-4 w-[1px] bg-slate-200 mx-2 shrink-0" />
        <div className="px-1">
           <div className="flex -space-x-1.5">
              {[1, 2, 3].map(i => (
                 <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-[7px] font-black text-indigo-600">ID</div>
                 </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white  border-2 border-slate-900 rounded-[3rem] p-8 mt-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 text-slate-100 -mr-8 -mt-8 pointer-events-none group-hover:text-indigo-50 transition-all duration-700">
        <LayoutGrid size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex  items-center justify-between mb-8">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-1">Canvas Tools</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Drag to reorder after adding to stream</p>
          </div>
          <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest hidden md:block">
            {BLOCK_TYPES.length} Active Blocks
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {BLOCK_TYPES.map((block) => (
            <motion.button
              key={block.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAdd(block.id as SectionType)}
              className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-600/30 rounded-2xl transition-all group/btn text-left hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className={`w-12 h-12 ${block.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover/btn:scale-110 transition-transform`}>
                <block.icon size={20} />
              </div>
              <div className="flex-1 truncate">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-0.5">{block.label}</p>
                <p className="text-[9px] font-bold text-slate-400 group-hover/btn:text-indigo-400 transition-colors uppercase truncate">{block.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
