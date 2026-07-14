"use client";

import React, { useState, useEffect } from "react";
import { Article, ContentBlock, Reflection } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar, Share, ThumbsUp, ChevronRight, Quote as QuoteIcon, Trophy, Sparkles, MessageSquare, Send, Zap, Shield, Target, Bookmark, Brain, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import ParticleEffect from "../ParticleEffect";
import InteractiveHero from "./InteractiveHero";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, AreaChart, Area, Cell } from 'recharts';
import { recordArticleView, toggleLike, submitReflection, getArticlesBySection, updateArticleDuration } from "@/lib/articles";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Footer from "../Footer";
import { API_BASE } from "@/lib/config";
import GoUnlimited from '../../components/GoUnlimited';
import { getPopularKeywords } from '@/lib/articles';
import InlineSubscriptionCTA from '../../components/InlineSubscriptionCTA';
import CommunityPulse from '../CommunityPulse';

import { getCategorySlugForArticle } from "@/lib/categoryMapping";
interface ArticleRendererProps {
  article: Article;
  sidebarComponent?: React.ReactNode;
}

const FONT_CLASSES: Record<string, string> = {
  "Inter": "font-sans",
  "Merriweather": "font-serif",
  "JetBrains Mono": "font-mono text-sm",
  "Outfit": "font-sans tracking-tight",
};

interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ArticleRenderer({ article, sidebarComponent }: ArticleRendererProps) {
  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(article.likes_count || 0);
  const [reflections, setReflections] = React.useState<Reflection[]>(article.reflections || []);
  const [relatedArticles, setRelatedArticles] = React.useState<Article[]>([]);
  const [reflectionContent, setReflectionContent] = React.useState("");
  const [showReflectionForm, setShowReflectionForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLiking, setIsLiking] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState(article.ai_summary || "");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [displayedSummary, setDisplayedSummary] = useState("");
  const [summaryLimitReached, setSummaryLimitReached] = useState<string | false>(false);

  // Ask AI state
  const [askAiOpen, setAskAiOpen] = React.useState(false);
  const [aiMessages, setAiMessages] = React.useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [aiLimitReached, setAiLimitReached] = React.useState<string | false>(false);
  const aiMessageContainerRef = React.useRef<HTMLDivElement>(null);
  const askAiWrapperRef = React.useRef<HTMLDivElement>(null);
  const [fabBottom, setFabBottom] = React.useState(24);
  const [isKeywordsLoading, setIsKeywordsLoading] = React.useState(true);
  const [derivedKeywords, setDerivedKeywords] = React.useState<string[]>([]);
  

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    setIsKeywordsLoading(true);
    getPopularKeywords(10)
          .then((data) => {
            setDerivedKeywords(data);
            setIsKeywordsLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setIsKeywordsLoading(false);
          });

    const token = Cookies.get("access_token");
    if (token) {
      setIsLoggedIn(true);
      fetch(`${API_BASE}/usage/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
         if (data?.features?.ask_ai?.allowed === false) {
            setAiLimitReached(data.tier || "free");
         }
         if (data?.features?.ai_summary?.allowed === false) {
            setSummaryLimitReached(data.tier || "free");
         }
      })
      .catch(err => console.error("Error fetching usage status:", err));
    }
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (askAiOpen && askAiWrapperRef.current && !askAiWrapperRef.current.contains(event.target as Node)) {
        setAskAiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [askAiOpen]);

  React.useEffect(() => {
    if (askAiOpen && aiMessageContainerRef.current) {
      const container = aiMessageContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [aiMessages, aiLoading, askAiOpen]);

  React.useEffect(() => {
    if (aiSummary && summaryModalOpen) {
      let i = 0;
      setDisplayedSummary("");
      const interval = setInterval(() => {
        i += 4;
        setDisplayedSummary(aiSummary.substring(0, i));
        if (i >= aiSummary.length) {
          setDisplayedSummary(aiSummary);
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    }
  }, [aiSummary, summaryModalOpen]);

  const handleGenerateSummary = async () => {
    setSummaryModalOpen(true);
    if (aiSummary) {
      return;
    }
    const token = Cookies.get("access_token");
    if (!token) {
      setSummaryError("Please log in to generate an AI summary.");
      return;
    }
    if (summaryLimitReached) {
      setSummaryError(`LIMIT_REACHED:${summaryLimitReached}`);
      return;
    }
    setSummaryLoading(true);
    setSummaryError(null);
    setDisplayedSummary("");
    
    try {
      const [res] = await Promise.all([
        fetch(`${API_BASE}/premium/ai/summary/${article.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        }),
        new Promise(resolve => setTimeout(resolve, 2000))
      ]);
      if (res.status === 403 || res.status === 429) {
        const data = await res.json();
        const tier = data.detail?.tier || data.detail?.current_tier || "free";
        setSummaryError(`LIMIT_REACHED:${tier}`);
      } else if (!res.ok) {
        throw new Error("AI service error");
      } else {
        const data = await res.json();
        setAiSummary(data.summary);
      }
    } catch {
      setSummaryError("Failed to fetch summary. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading || aiLimitReached) return;
    const token = Cookies.get("access_token");
    if (!token) {
      setAiError("Please log in to use Ask AI.");
      return;
    }
    const question = aiInput.trim();
    setAiMessages(prev => [...prev, { role: "user", content: question }]);
    setAiInput("");
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_BASE}/premium/ai/ask/${article.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question }),
      });
      if (res.status === 403 || res.status === 429) {
        const data = await res.json();
        setAiMessages(prev => prev.slice(0, -1));
        const tier = data.detail?.tier || data.detail?.current_tier || "free";
        setAiLimitReached(tier);
      } else if (!res.ok) {
        throw new Error("AI service error");
      } else {
        const data = await res.json();
        setAiMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
      }
    } catch {
      setAiError("Something went wrong. Please try again.");
      setAiMessages(prev => prev.slice(0, -1));
    } finally {
      setAiLoading(false);
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const footerWrapper = document.getElementById('relaypost-footer-wrapper');
      if (footerWrapper) {
        const rect = footerWrapper.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (rect.top < viewportHeight) {
          const overlap = viewportHeight - rect.top;
          setFabBottom(24 + overlap);
          if (window.innerWidth < 768 && overlap > 20) {
             setAskAiOpen(false);
          }
        } else {
          setFabBottom(24);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (article.id) {
       const token = Cookies.get("access_token");
       if (token) {
         recordArticleView(article.id);
       }
       
       // Fetch related articles if possible
       if (article.homepage_section) {
          getArticlesBySection(article.homepage_section).then(articles => {
             setRelatedArticles(articles.filter(a => a.slug !== article.slug).slice(0, 3));
          });
       }

       // Fetch initial bookmark state
       if (token) {
         fetch(`${API_BASE}/bookmarks?source_type=article&limit=100`, {
           headers: { Authorization: `Bearer ${token}` }
         })
         .then(res => res.ok ? res.json() : null)
         .then(data => {
           if (data && data.bookmarks) {
             const isBookmarked = data.bookmarks.some((b: any) => b.article_id === article.id);
             setIsSaved(isBookmarked);
           }
         })
         .catch(err => console.error("Error loading bookmark state", err));
       }
    }
  }, [article.id, article.homepage_section, article.slug]);

  // Track active reading time
  React.useEffect(() => {
    const articleId = article.id;
    if (!articleId) return;
    const token = Cookies.get("access_token");
    if (!token) return; // Do not track duration if not logged in

    let lastPingTime = Date.now();

    const sendPing = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastPingTime) / 1000);
      if (elapsed > 0) {
        updateArticleDuration(articleId, elapsed);
      }
      lastPingTime = now;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendPing();
      } else {
        lastPingTime = Date.now();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      if (!document.hidden) {
        sendPing();
      }
    };
  }, [article.id]);

  const handleLike = async () => {
    if (isLiking) return;
    const token = Cookies.get("access_token");
    if (!token) {
       toast.error("Please login to like this article");
       return;
    }
    
    setIsLiking(true);
    setLiked(true);
    if (!liked) {
       setLikesCount(prev => prev + 1);
    }
    
    try {
       const res = await toggleLike(article.id!, token);
       if (res) {
          setLiked(res.liked);
          // If server says we unliked it (shouldn't happen on first click, but sync state)
          if (!res.liked && !liked) {
            setLikesCount(prev => prev - 1);
          }
       }
    } catch (err) {
       setLiked(liked);
       if (!liked) {
         setLikesCount(prev => prev - 1);
       }
       toast.error("Failed to record like");
    } finally {
       setTimeout(() => setIsLiking(false), 1000);
    }
  };

  const handleBookmark = async () => {
    if (isSaving) return;
    const token = Cookies.get("access_token");
    if (!token) {
       toast.error("Please login to save this article", { id: "article-bookmark-auth" });
       return;
    }
    
    setIsSaving(true);
    setIsSaved(!isSaved);
    
    try {
        const response = await fetch(`${API_BASE}/profile/articles/${article.id}/save`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            setIsSaved(data.saved);
            if (data.saved) {
                toast.success("Article saved to your profile!", { id: `article-bookmark-${article.id}` });
            } else {
                toast.success("Removed from saved list.", { id: `article-bookmark-${article.id}` });
            }
        } else {
            throw new Error('Failed to save');
        }
    } catch (err) {
        setIsSaved(isSaved);
        toast.error("Failed to update bookmark", { id: `article-bookmark-err-${article.id}` });
    } finally {
        setIsSaving(false);
    }
  };

  const handleReflectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionContent.trim()) return;
    
    setIsSubmitting(true);
    const res = await submitReflection(article.id!, reflectionContent, true); // Anonymous by default as per request
    if (res) {
       setReflections(prev => [res, ...prev]);
       setReflectionContent("");
       setShowReflectionForm(false);
    }
    setIsSubmitting(false);
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const theme = article.theme || "standard";
  
  const themeClasses = {
    standard: {
      body: "bg-[#f0f2f5] dark:bg-slate-950",
      card: "bg-white dark:bg-slate-900 border-transparent",
      text: "text-slate-700 dark:text-slate-300",
      heading: "text-slate-900 dark:text-white",
      accent: "text-brand",
      button: "bg-brand text-white hover:bg-brand-dark"
    },
    intelligence: {
      body: "bg-slate-900 dark:bg-[#0A0D1F]",
      card: "bg-slate-800 dark:bg-slate-900 border-indigo-500/20",
      text: "text-slate-300 dark:text-slate-400",
      heading: "text-white dark:text-indigo-100",
      accent: "text-indigo-400 font-serif",
      button: "bg-indigo-600 text-white hover:bg-indigo-700"
    },
    sports: {
      body: "bg-orange-50 dark:bg-orange-950/20",
      card: "bg-white dark:bg-slate-900 border-orange-500/10",
      text: "text-slate-800 dark:text-slate-200",
      heading: "text-slate-900 dark:text-white font-black italic",
      accent: "text-orange-600",
      button: "bg-orange-600 text-white hover:bg-orange-700"
    }
  }[theme] || {
    body: "bg-[#f0f2f5] dark:bg-slate-950",
    card: "bg-white dark:bg-slate-900 border-transparent",
    text: "text-slate-700 dark:text-slate-300",
    heading: "text-slate-900 dark:text-white",
    accent: "text-brand",
    button: "bg-brand text-white hover:bg-brand-dark"
  };

  return (
    <div className={`${themeClasses.body} min-h-screen font-sans selection:bg-brand selection:text-white transition-colors duration-300 ${theme === 'intelligence' ? 'dark' : ''}`}>
      <div className="relative min-h-screen">
      {/* Floating Ask AI Chatbot (Fixed to bottom right minus offset) */}
      <div className="fixed right-6 z-50 pointer-events-none flex flex-col items-end transition-all duration-200" style={{ bottom: `${fabBottom}px` }}>
        <div ref={askAiWrapperRef} className="pointer-events-auto flex flex-col items-end">
           <AnimatePresence>
             {askAiOpen && (
               <motion.div
                 initial={{ opacity: 0, y: 20, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 20, scale: 0.95 }}
                 transition={{ duration: 0.2 }}
                 className="mb-4 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
               >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#4f46e5] to-[#0ea5e9] p-4 flex items-center justify-between text-white shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                           <Brain size={20} className="text-white" />
                        </div>
                        <div>
                           <h3 className="font-bold text-sm leading-tight">RelayPost AI</h3>
                           <p className="text-[10px] text-white/80 font-medium tracking-wide">Ask questions about this article</p>
                        </div>
                     </div>
                     <button onClick={() => setAskAiOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                  </div>

                  {/* Message List */}
                  <div ref={aiMessageContainerRef} className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                    {aiMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-80">
                         <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Sparkles size={24} className="text-indigo-600 dark:text-indigo-400" />
                         </div>
                         <div>
                            <p className="text-slate-800 dark:text-slate-200 font-bold">Welcome! 👋</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-[200px] leading-relaxed">
                               Ask me anything about this article. I'll summarize, explain, or find specific details for you.
                            </p>
                         </div>
                      </div>
                    )}
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
                          <Loader2 size={14} className="animate-spin text-indigo-500" />
                          <span className="text-xs text-slate-500">thinking...</span>
                        </div>
                      </div>
                    )}
                    {aiError && (
                      <div className="text-center py-2">
                        <p className="text-xs text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded-lg border border-red-100 dark:border-red-900/30">{aiError}</p>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  {!isLoggedIn ? (
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3">
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-full p-1 pl-4 opacity-70">
                         <input
                           type="text"
                           placeholder="Ask a Question..."
                           disabled={true}
                           className="flex-1 text-sm bg-transparent border-none outline-none dark:text-white placeholder:text-slate-400 cursor-not-allowed"
                         />
                         <button disabled className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center shrink-0 cursor-not-allowed">
                           <Send size={16} className="ml-1" />
                         </button>
                      </div>
                      <Link href="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl text-center shadow-md transition-colors w-full">
                         Log In to Ask AI
                      </Link>
                    </div>
                  ) : aiLimitReached ? (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-amber-50 dark:bg-amber-950/20">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                             {aiLimitReached === 'plus' ? 'Daily limit reached' : 'Monthly limit reached'}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Upgrade to keep asking questions.</p>
                        </div>
                        <Link
                          href="/pricing"
                          className="shrink-0 text-[10px] font-bold px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
                        >
                          Upgrade
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleAskAi} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-full p-1 pl-4 border border-transparent focus-within:border-indigo-500/30 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors">
                         <input
                           type="text"
                           value={aiInput}
                           onChange={e => setAiInput(e.target.value)}
                           placeholder="Ask a Question..."
                           disabled={aiLoading}
                           className="flex-1 text-sm bg-transparent border-none outline-none dark:text-white placeholder:text-slate-400"
                         />
                         <button
                           type="submit"
                           disabled={aiLoading || !aiInput.trim()}
                           className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-all shadow-md"
                         >
                           <Send size={16} className="ml-1" />
                         </button>
                      </div>
                    </form>
                  )}
               </motion.div>
             )}
           </AnimatePresence>

           <button 
             onClick={() => setAskAiOpen(o => !o)} 
             className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#4f46e5] text-white flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] hover:scale-105 hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.6)] transition-all"
           >
              <AnimatePresence mode="wait" initial={false}>
                 {askAiOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </motion.div>
                 ) : (
                    <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                       <MessageSquare size={24} />
                    </motion.div>
                 )}
              </AnimatePresence>
           </button>
        </div>
      </div>
      {/* Premium Hero Section (Maritime Style) */}
      <section className="relative h-[60vh] md:h-[85vh] min-h-[400px] md:min-h-[600px] overflow-hidden bg-[#0A0D1F]">
        <InteractiveHero imageSrc={article.hero_image || ""} />
        <ParticleEffect mode="attract" />
        
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
          <button onClick={handleGenerateSummary} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] transition-all border border-white/20 hover:scale-105">
            <Sparkles size={14} /> AI Summary
          </button>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0D1F]/40 to-[#0A0D1F] pointer-events-none" />
        
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4 md:p-8 w-full md:max-w-5xl md:mx-auto z-20">
          <motion.div {...fadeIn} className="space-y-4 md:space-y-8">
            <div className="flex justify-center gap-3">
              {/* Template badge removed for cleaner look */}
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white leading-tight md:leading-[1.1] tracking-tighter drop-shadow-2xl">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                {(() => {
                  const names = ["Kartik Kalra", "Astha Jadon", "Prince Verma"];
                  const nameIndex = article.title ? article.title.length % 3 : 0;
                  const authorName = names[nameIndex];
                  return (
                    <>
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand/50 shadow-inner bg-slate-800 flex items-center justify-center">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${authorName}&backgroundColor=0f172a&textColor=ffffff`} alt="Author" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-black text-[10px] tracking-widest uppercase mb-0.5 opacity-60">Published By</p>
                        <p className="text-brand text-xs font-black tracking-widest uppercase">
                          {authorName}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="flex items-center gap-8 text-white/60 text-[10px] font-black uppercase tracking-[0.15em]">
                <div className="flex items-center gap-2">
                   <Calendar size={14} className="text-brand" />
                   {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Draft'}
                </div>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                   <User size={14} className="text-brand" /> {article.views_count || 0} VIEWS
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Card (Floating Style) */}
      <main className="w-full md:max-w-7xl md:mx-auto px-4 md:px-8 -mt-12 md:-mt-24 relative z-30 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="hidden lg:block lg:col-span-1" />

        {/* Article Body */}
        <div className={`lg:col-span-7 ${themeClasses.card} rounded-[2.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.15)] p-6 md:p-12 lg:p-20 border overflow-hidden`}>
          
          <div className="space-y-8 md:space-y-12">
            {article.content_blocks.map((block: ContentBlock, idx: number) => {
               const fontClass = FONT_CLASSES[block.styles?.fontFamily || "Inter"] || "font-sans";
               const blockStyle = {
                  color: block.styles?.color,
                  textAlign: block.styles?.align as any,
                  fontSize: block.styles?.fontSize,
               };

               return (
                 <motion.section 
                   key={block.id} 
                   {...fadeIn} 
                   transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                   className={`${fontClass} leading-relaxed dark:text-slate-200`}
                 >
                   {/* {idx === Math.floor(article.content_blocks.length / 2) && (
                     <InlineSubscriptionCTA />
                   )} */}
                   
                   {block.type === 'heading' && React.createElement(`h${block.metadata?.level || 2}`, {
                      className: `font-black tracking-tighter ${themeClasses.heading} ${
                        block.metadata?.level === 1 ? 'text-3xl md:text-5xl lg:text-6xl mb-8 md:mb-12' :
                        block.metadata?.level === 3 ? 'text-xl md:text-3xl mb-4 md:mb-6' : 
                        'text-lg md:text-2xl mb-3 md:mb-4'
                      }`,
                      style: blockStyle
                   }, block.content)}

                   {block.type === 'paragraph' && (
                     <p 
                       className={`text-[17px] md:text-xl ${themeClasses.text} leading-[1.8] mb-6 md:mb-8 ${idx === 0 ? `first-letter:text-6xl md:first-letter:text-7xl first-letter:font-black first-letter:${themeClasses.accent.split(' ')[0]} first-letter:mr-3 first-letter:float-left` : ''}`} 
                       style={blockStyle}
                     >
                       {block.content}
                     </p>
                   )}

                   {block.type === 'bullet_list' && (
                     <ul className="space-y-4 mb-8 pl-6 list-outside">
                        {(block.metadata?.items || []).map((item: string, i: number) => (
                           <li key={i} className="relative pl-6 text-lg text-slate-700 dark:text-slate-300 dark:text-slate-200 transition-colors duration-300">
                             <span className="absolute left-0 top-3 w-1.5 h-1.5 bg-brand rounded-full shadow-sm shadow-brand/50 dark:shadow-none transition-colors duration-300" />
                             {item}
                           </li>
                        ))}
                     </ul>
                   )}

                   {block.type === 'numbered_list' && (
                     <ol className="space-y-4 mb-8 pl-6 list-decimal">
                        {(block.metadata?.items || []).map((item: string, i: number) => (
                           <li key={i} className="pl-2 text-lg text-slate-700 dark:text-slate-300 font-medium dark:text-slate-200 transition-colors duration-300">
                             {item}
                           </li>
                        ))}
                     </ol>
                   )}

                   {block.type === 'quote' && (
                       <div className="my-10 md:my-16 relative">
                          <QuoteIcon className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-12 h-12 md:w-20 md:h-20 text-brand/10 -rotate-12" />
                          <blockquote className="relative z-10 text-xl md:text-3xl font-serif italic text-slate-800 dark:text-slate-100 leading-snug text-center max-w-3xl mx-auto">
                            "{block.content}"
                         </blockquote>
                         {block.metadata?.caption && (
                            <cite className="block mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-brand text-center not-italic">
                               — {block.metadata.caption}
                            </cite>
                         )}
                      </div>
                   )}

                   {block.type === 'image' && (
                      <figure className="my-14 space-y-4">
                         <div className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5">
                            <img src={block.content} alt={block.metadata?.altText || "Report Image"} className="w-full h-auto" />
                         </div>
                         {block.metadata?.caption && (
                            <figcaption className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{block.metadata.caption}</figcaption>
                         )}
                      </figure>
                   )}

                    {block.type === 'table' && block.metadata?.tableData && (
                       <div className="my-8 md:my-14 overflow-x-auto rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl">
                          <table className="w-full text-left border-collapse">
                             <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800">
                                   {block.metadata.tableData.headers?.map((header: string, i: number) => (
                                      <th key={i} className="p-4 md:p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/10">{header}</th>
                                   ))}
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {block.metadata.tableData.rows?.map((row: string[], i: number) => (
                                   <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                      {row.map((cell, j) => (
                                         <td key={j} className="p-4 md:p-6 text-sm font-medium text-slate-700 dark:text-slate-300">{cell}</td>
                                      ))}
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    )}

                   {block.type === 'graph' && block.metadata?.chartData && (
                       <div className="my-8 md:my-14 p-6 md:p-10 bg-[#f8fafc] dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
                         <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
                            <div className="space-y-1">
                               <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase dark:text-slate-100 transition-colors duration-300">{block.metadata?.caption || 'Data Analysis'}</h4>
                               <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{block.metadata?.altText || 'Executive Insight'}</p>
                            </div>
                            <div className="text-left md:text-right">
                               <p className="text-3xl font-black text-brand tracking-tighter">+18.4%</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">YTD Growth</p>
                            </div>
                         </div>
                         <div className="w-full h-[250px] md:h-[350px]">
                           <ResponsiveContainer width="100%" height="100%">
                              {block.metadata.chartType === 'line' ? (
                                <LineChart data={block.metadata.chartData}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={idx % 2 === 0 ? "#E2E8F0" : "#334155"} />
                                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                   <YAxis hide />
                                   <Tooltip contentStyle={{ borderRadius: '16px', border: theme === 'intelligence' ? '1px solid rgba(255,255,255,0.1)' : 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', backgroundColor: theme === 'intelligence' ? '#0f172a' : '#ffffff', color: theme === 'intelligence' ? '#f8fafc' : '#0f172a' }} itemStyle={{ color: theme === 'intelligence' ? '#cbd5e1' : '#334155' }} />
                                   <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1' }} activeDot={{ r: 8 }} />
                                </LineChart>
                              ) : (
                                <BarChart data={block.metadata.chartData}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                   <YAxis hide />
                                   <Tooltip contentStyle={{ borderRadius: '16px', border: theme === 'intelligence' ? '1px solid rgba(255,255,255,0.1)' : 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', backgroundColor: theme === 'intelligence' ? '#0f172a' : '#ffffff', color: theme === 'intelligence' ? '#f8fafc' : '#0f172a' }} itemStyle={{ color: theme === 'intelligence' ? '#cbd5e1' : '#334155' }} />
                                   <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                      {block.metadata.chartData.map((_: any, index: number) => (
                                        <Cell key={index} fill={index % 2 === 0 ? '#6366f1' : '#4338ca'} />
                                      ))}
                                   </Bar>
                                </BarChart>
                              )}
                           </ResponsiveContainer>
                        </div>
                      </div>
                   )}

                   {block.type === 'code_block' && (
                      <div className="my-6 md:my-8 rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-white/5">
                        <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{block.metadata?.language || 'typescript'}</span>
                           <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                           </div>
                        </div>
                        <pre className="p-8 overflow-x-auto text-sm font-mono text-indigo-300 leading-relaxed">
                           <code>{block.content}</code>
                        </pre>
                      </div>
                   )}

                   {block.type === 'callout' && (
                       <div className={`my-8 p-5 md:p-8 rounded-3xl border flex flex-col sm:flex-row gap-4 md:gap-6 items-start ${
                        block.metadata?.calloutType === 'warning' ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-500/20' :
                        'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-500/20'
                      }`}>
                         <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0 dark:bg-slate-900 dark:shadow-none transition-colors duration-300">
                            <span className="text-2xl">{block.metadata?.icon || '💡'}</span>
                         </div>
                         <div>
                            <p className="text-lg font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{block.metadata?.title || 'Editorial Note'}</p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed dark:text-slate-300 transition-colors duration-300">{block.content}</p>
                         </div>
                      </div>
                   )}

                   {block.type === 'faq_block' && (
                      <div className="my-12 space-y-4">
                         <h4 className="text-sm font-black text-brand uppercase tracking-[0.2em] mb-6">Dispatch Intelligence FAQ</h4>
                         {(block.metadata?.questions || []).map((faq: any, i: number) => (
                            <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <p className="font-bold text-slate-900 dark:text-white mb-2">{faq.question}</p>
                               <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed dark:text-slate-300 transition-colors duration-300">{faq.answer}</p>
                            </div>
                         ))}
                      </div>
                   )}

                   {block.type === 'cta_block' && (
                      <div className="my-10 md:my-16 p-8 md:p-12 bg-gradient-to-br from-brand to-indigo-900 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                         <div className="relative z-10 space-y-4 md:space-y-6">
                            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{block.metadata?.title || 'Connect with Intelligence'}</h3>
                            <p className="text-white/80 max-w-lg mx-auto leading-relaxed">{block.content}</p>
                            <button className="px-10 py-4 bg-white text-brand font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-all shadow-xl dark:bg-slate-900">
                               {block.metadata?.buttonText || 'Contact Us'}
                            </button>
                         </div>
                      </div>
                   )}

                   {block.type === 'youtube_embed' && (
                      <div className="my-12 aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 border-4 border-white/10">
                         <iframe 
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${block.metadata?.videoId}`} 
                            title="YouTube video player" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                         />
                      </div>
                   )}

                   {block.type === 'divider' && <div className="h-px bg-slate-100 dark:bg-white/5 my-16 max-w-xs mx-auto" />}

                 </motion.section>
               )
            })}
          </div>

          {/* Tags */}
          <div className="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
             <div className="flex flex-wrap gap-2">
                {article.secondary_keywords?.map(tag => {
                   const cleanTag = tag.replace('#', '');
                   const urlTag = cleanTag.replace(/ /g, '-').toLowerCase();
                   return (
                     <Link href={`/tag/${urlTag}`} key={tag}>
                       <span className="px-4 py-2 bg-[#f0f2f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black rounded-full hover:bg-brand hover:text-white transition-all cursor-pointer uppercase tracking-widest shadow-sm dark:shadow-none inline-block">
                          #{cleanTag}
                       </span>
                     </Link>
                   );
                })}
             </div>
              <div className="flex gap-6">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="flex items-center gap-2 group"
                >                   
                   <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all group-hover:bg-brand/10">
                      <Share size={16} className="text-slate-400 group-hover:text-brand" />
                   </div>
                </button>
                <button 
                  onClick={handleBookmark}
                  className="flex items-center gap-2 group"
                >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSaved ? 'bg-brand/10 text-brand' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-brand/10 group-hover:text-brand'}`}>
                      <Bookmark size={16} className={isSaved ? "fill-brand text-brand" : "text-slate-400 group-hover:text-brand"} />
                   </div>
                </button>
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${
                    liked ? 'bg-brand text-white' : 'bg-brand/5 text-brand hover:bg-brand hover:text-white'
                  } dark:shadow-none`}
                >
                   <ThumbsUp size={16} /> {liked ? 'Insightful' : `${likesCount} Likes`}
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar Container */}
        <aside className="lg:col-span-4 space-y-8">
          
          <div className={`${themeClasses.card} rounded-[2.5rem] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] p-8 border space-y-8`}>
             <h3 className="text-[11px] font-black text-brand uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-4 h-0.5 bg-brand" />
                Related Dispatches
             </h3>
             <div className="space-y-6">
                {relatedArticles.length > 0 ? relatedArticles.map((item, i) => (
                  <Link 
                    key={i} 
                    href={`/${getCategorySlugForArticle(item.category_name)}/${item.slug}`} 
                    className="flex gap-4 group cursor-pointer"
                  >
                     <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md dark:shadow-none transition-colors duration-300">
                        <img src={item.hero_image || "https://images.unsplash.com/photo-1544411047-c491574abb46?w=400&q=80"} alt="Thumb" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-brand tracking-widest uppercase">{item.category_name || 'INTELLIGENCE'}</p>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-snug group-hover:text-brand transition-colors">{item.title}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Analysis</p>
                     </div>
                  </Link>
                )) : (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">No related dispatches found.</p>
                )}
              </div>
           </div>

           {sidebarComponent && (
              <div className="mt-8">
                 {sidebarComponent}
              </div>
           )}

          {/* <div className="bg-gradient-to-br from-indigo-600 to-brand rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group text-center">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
             <div className="relative z-10 space-y-6 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                   <Trophy size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-black tracking-tight leading-none">Support Editorial Integrity</h3>
                <p className="text-slate-100/70 text-sm leading-relaxed font-medium">
                  Curated reports by members to provide deep-dive editorial without corporate bias. Join our network.
                </p>
                <button className="w-full py-5 bg-white text-brand font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all dark:bg-slate-900">
                  Become a Member
                </button>
             </div>
          </div> */}
          <GoUnlimited/>
              {isKeywordsLoading ? (
                <div className="h-[150px] bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] animate-pulse w-full mt-6" />
              ) : (
                derivedKeywords.length > 0 && <CommunityPulse keywords={derivedKeywords} />
              )}
          {/* <div className="bg-[#f8fafc] dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 space-y-6">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Trending Briefs</h3>
             <div className="flex flex-wrap gap-2 px-2">
                {['#Geopolitics', '#TradeRoutes', '#AIInPolicy', '#SupplyChainAI'].map(tag => (
                   <span key={tag} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded-xl shadow-sm cursor-pointer hover:text-brand transition-colors dark:bg-slate-900 dark:text-slate-300 dark:shadow-none">
                      {tag}
                   </span>
                ))}
             </div>
          </div> */}
        </aside>
      </main>

      {/* Reflections / Comments Section */}
      <section className="max-w-4xl mx-auto px-4 mt-16 md:mt-24 pb-24 space-y-8 md:space-y-12">
         <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Reflections</h2>
            <div className="h-0.5 grow mx-8 bg-slate-100 dark:bg-white/5" />
         </div>
         
         <div className="space-y-6">
            {reflections.length > 0 ? reflections.map((comment, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="p-8 bg-indigo-50/30 dark:bg-slate-900/50 rounded-[2rem] border border-indigo-100/50 dark:border-slate-800 flex gap-6"
              >
                 <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-brand/20 bg-slate-100 flex items-center justify-center">
                    {comment.is_anonymous || !comment.author_img ? (
                       <User size={24} className="text-slate-400" />
                    ) : (
                       <img src={comment.author_img} alt="Ava" className="w-full h-full object-cover" />
                    )}
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-3">
                       <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                          {comment.is_anonymous ? 'Anonymous Member' : (comment.author_name || 'Member')}
                       </p>
                       {/* <span className="w-1 h-1 bg-brand rounded-full" /> */}
                       {/* <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {comment.author_role || 'Verified Contribution'}
                       </p> */}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium dark:text-slate-200 transition-colors duration-300">
                       {comment.content}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-2">
                       {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                 </div>
              </motion.div>
            )) : (
              <p className="text-center text-slate-400 font-bold uppercase tracking-widest py-12">Be the first to share a reflection.</p>
            )}
         </div>

         <div className="pt-8 text-center">
            {!showReflectionForm ? (
               <button 
                  onClick={() => setShowReflectionForm(true)}
                  className="px-12 py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:border-brand hover:text-brand transition-all"
               >
                  Add Your Reflection
               </button>
            ) : (
               <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleReflectionSubmit}
                  className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 space-y-4"
               >
                  <textarea 
                    value={reflectionContent}
                    onChange={(e) => setReflectionContent(e.target.value)}
                    placeholder="Share your expert insights on this dispatch..."
                    className="w-full h-32 p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand outline-none text-slate-800 dark:text-white resize-none dark:text-slate-100 transition-colors duration-300"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                        Contributions are anonymous by default for editorial privacy.
                     </p>
                     <div className="flex gap-4">
                        <button 
                           type="button"
                           onClick={() => setShowReflectionForm(false)}
                           className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                           Cancel
                        </button>
                        <button 
                           type="submit"
                           disabled={isSubmitting || !reflectionContent.trim()}
                           className="px-8 py-3 bg-brand text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                        >
                           {isSubmitting ? 'Posting...' : 'Post Reflection'} <Send size={14} />
                        </button>
                     </div>
                  </div>
               </motion.form>
            )}
         </div>
      </section>


      <AnimatePresence>
        {summaryModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSummaryModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                       <Sparkles size={20} />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg text-slate-900 dark:text-white">AI Executive Summary</h3>
                       <p className="text-xs text-slate-500 font-medium">Strategic Overview</p>
                    </div>
                 </div>
                 <button onClick={() => setSummaryModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>
              <div className="p-8 min-h-[200px] flex flex-col justify-center text-slate-700 dark:text-slate-300 text-[17px] leading-relaxed font-medium">
                {summaryLoading ? (
                   <div className="flex flex-col items-center justify-center gap-4 py-8">
                      <Loader2 size={32} className="animate-spin text-indigo-500" />
                      <span className="text-sm font-semibold text-slate-500 animate-pulse">Generating strategic summary...</span>
                   </div>
                ) : summaryError ? (
                   <div className="text-center py-4">
                      {summaryError.startsWith("LIMIT_REACHED:") ? (
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex flex-col items-center">
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4">
                            <Brain size={24} />
                          </div>
                          <p className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-2">
                            {summaryError.split(":")[1] === "plus" ? "Daily limit reached" : "Monthly limit reached"}
                          </p>
                          <p className="text-sm text-amber-600 dark:text-amber-400 mb-6 max-w-[250px]">
                            Upgrade your plan to generate more strategic summaries.
                          </p>
                          <Link href="/pricing" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all w-full">
                            Upgrade Now
                          </Link>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <p className="text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-4 rounded-xl inline-block border border-red-100 dark:border-red-900/30 text-center">
                            {summaryError}
                          </p>
                          {summaryError.includes("log in") && (
                            <Link href="/login" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition-all">
                              Go to Login
                            </Link>
                          )}
                        </div>
                      )}
                   </div>
                ) : (
                   <div className="whitespace-pre-line relative">
                      {displayedSummary}
                      {displayedSummary.length < (aiSummary?.length || 0) && (
                         <span className="inline-block w-[2px] h-5 bg-indigo-500 ml-1 animate-pulse align-middle" />
                      )}
                   </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Corporate Footer */}
      <div id="relaypost-footer-wrapper">
        <Footer/>
      </div>
    </div>
  );
}
