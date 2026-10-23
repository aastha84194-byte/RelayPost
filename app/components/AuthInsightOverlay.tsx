"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, TrendingUp, ShieldCheck, ArrowRight, X, Lock, CheckCircle2, Mail, BookOpen } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { RedirectHelper } from "@/lib/redirectHelper";

export interface AuthInsightOverlayProps {
  title?: string;
  category?: string;
  slug?: string;
  type?: "article" | "news";
}

export default function AuthInsightOverlay({
  title,
  category,
  slug,
  type = "article",
}: AuthInsightOverlayProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if user is actively authenticated (valid non-expired JWT)
    const cookieToken = Cookies.get("access_token");
    const localToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const token = cookieToken || localToken;

    if (token) {
      let isValid = false;
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const sanitizedPayload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(decodeURIComponent(escape(atob(sanitizedPayload))));
          // Token is valid if it has no exp or expiration timestamp is in the future
          if (!payload.exp || payload.exp * 1000 > Date.now()) {
            isValid = true;
          }
        }
      } catch {
        isValid = false;
      }

      if (isValid) {
        return;
      } else {
        // Clear stale/expired token
        Cookies.remove("access_token");
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
      }
    }

    // 2. Check if user dismissed the prompt for this specific item in this session
    const storageKey = slug ? `relaypost_auth_overlay_dismissed_${slug}` : "relaypost_auth_overlay_dismissed";
    const dismissedInSession = typeof window !== "undefined" && sessionStorage.getItem(storageKey) === "true";
    if (dismissedInSession) {
      return;
    }

    // 3. Trigger after brief delay for smooth entrance
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleDismiss = () => {
    const storageKey = slug ? `relaypost_auth_overlay_dismissed_${slug}` : "relaypost_auth_overlay_dismissed";
    if (typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, "true");
    }
    setIsDismissed(true);
    setTimeout(() => setIsOpen(false), 250);
  };

  const handleSignUp = () => {
    RedirectHelper.saveTarget();
    router.push("/register");
  };

  const handleLogin = () => {
    RedirectHelper.saveTarget();
    router.push("/login");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {!isDismissed && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
          {/* Glassmorphic Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            onClick={handleDismiss}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.35)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden z-10 p-6 sm:p-8 text-slate-900 dark:text-white"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/20 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              aria-label="Close modal"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header Badge */}
            {/* <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                RelayPost Intelligence
              </span>
              {category && (
                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  {category}
                </span>
              )}
            </div> */}

            {/* Title & Subtitle */}
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2 text-slate-900 dark:text-white">
              Unlock Deep Insights & Weekly digest
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Get full access to our curated weekly digest, executive AI breakdowns, and high-signal reporting across technology, markets, and global culture.
            </p>

            {/* Key Benefits List */}
            <div className="space-y-3 mb-6 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Curated Sunday Digest
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The week&apos;s highest-signal developments and deep-dive analysis delivered directly to you every Sunday.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Instant AI Syntheses & Q&A
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Grasp complex narratives in seconds with concise executive summaries, critical metrics, and smart answers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Tailored Radar & Saved Reads
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Follow topics matched to your industry, bookmark high-value articles, and track emerging systemic shifts.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions / CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <button
                onClick={handleSignUp}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Get Started — Sign Up Free</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleLogin}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200"
              >
                Log In
              </button>
            </div>

            {/* Guest dismiss link */}
            <div className="text-center">
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium transition-colors"
              >
                Continue reading preview as guest →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
