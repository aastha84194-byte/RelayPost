"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HARDCODED_CATEGORIES } from '@/lib/categoryMapping';
import { Check, ArrowRight, X, Sparkles } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { API_BASE } from '@/lib/config';

// Replace with a default placeholder if image is missing
const PLACEHOLDER_IMG = "/categories/technology.webp";

interface OnboardingOverlayProps {
  onClose: () => void;
}

export default function OnboardingOverlay({ onClose }: OnboardingOverlayProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // For exit animation

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      if (selectedIds.length > 0) {
        // We'll extract the user ID from the JWT token
        const token = localStorage.getItem('auth_token');
        if (!token) throw new Error("Not authenticated");
        
        // Very basic JWT decode to get user_id (sub)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub;

        // Fire requests to toggle follow for each
        const promises = selectedIds.map(id => 
          fetch(`${API_BASE}/public/follow/toggle`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              user_id: userId,
              target_id: id,
              target_type: "category"
            })
          }).then(res => res.json())
        );

        await Promise.all(promises);
      }
      
      toast.success("Preferences saved successfully!");
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Could not save all preferences, but you can update them later.");
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30">
              <div>
                <div className="flex items-center gap-2 mb-2">

                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Personalize Your Feed
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Select the topics that interest you most to get curated intelligence tailored to your needs.
                </p>
              </div>
              
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {HARDCODED_CATEGORIES.map((category, idx) => {
                  const isSelected = selectedIds.includes(category.id);
                  const Icon = category.icon;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleCategory(category.id)}
                      className={`relative cursor-pointer rounded-2xl overflow-hidden shadow-sm transition-all duration-200 border-2 ${
                        isSelected 
                          ? 'border-indigo-600 ring-4 ring-indigo-600/20' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Background Image */}
                      <div className="absolute inset-0 w-full h-full">
                        <Image 
                          src={category.image_url || PLACEHOLDER_IMG}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className={`object-cover transition-opacity duration-300 ${isSelected ? 'opacity-80' : 'opacity-40 dark:opacity-60'}`}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${isSelected ? 'from-indigo-900/90 via-slate-900/40 to-transparent' : 'from-slate-900 via-slate-900/70 to-slate-900/40'}`} />
                      </div>

                      {/* Content */}
                      <div className="relative p-6 h-full min-h-[160px] flex flex-col justify-end z-10">
                        <div className="absolute top-4 right-4 z-20">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/50' : 'bg-white/20 text-transparent'
                          }`}>
                            <Check size={14} />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/10 text-slate-300'} backdrop-blur-md`}>
                            <Icon size={18} />
                          </div>
                          <h3 className="font-bold text-white text-lg leading-tight drop-shadow-md">
                            {category.name}
                          </h3>
                        </div>
                        
                        <p className="text-xs text-slate-300 line-clamp-2 drop-shadow-md">
                          {category.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-30">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {selectedIds.length} {selectedIds.length === 1 ? 'Topic' : 'Topics'} Selected
              </span>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Skip
                </button>
                
                <button
                  onClick={handleContinue}
                  disabled={isLoading || selectedIds.length === 0}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
                    selectedIds.length > 0 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/25' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                  }`}
                >
                  {isLoading ? 'Saving...' : 'Start Exploring'}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
