"use client";

/**
 * TierGate — Unified component to gate premium features in the frontend.
 * 
 * Usage:
 *   <TierGate requiredTier="plus" feature="ai_summary">
 *     <AISummaryButton />
 *   </TierGate>
 * 
 * Shows a blurred preview with an upgrade prompt if the user lacks access.
 * Also checks usage limits (remaining uses) from the tracking service.
 */
import React, { ReactNode } from "react";
import Link from "next/link";
import { Lock, Sparkles, Zap } from "lucide-react";
import { useTier } from "./TierProvider";
import { hasTierAccess, TIER_LABELS, type Tier } from "@/lib/tier";

interface TierGateProps {
  requiredTier: Tier;
  feature?: string;                    // optional: for usage limit check
  children: ReactNode;
  preview?: ReactNode;                 // optional blurred preview content
  compact?: boolean;                   // show compact pill instead of full overlay
  className?: string;
}

export function TierGate({ requiredTier, feature, children, preview, compact = false, className }: TierGateProps) {
  const { tier, usageStatus, isLoading } = useTier();

  // Check tier access
  const hasTier = hasTierAccess(tier, requiredTier);

  // Check usage limit (if feature is specified and user has tier access)
  let usageLimitExceeded = false;
  let usageRemaining = -1;
  let usageLimit = -1;
  let resetAt: string | null = null;

  if (hasTier && feature && usageStatus) {
    const featureUsage = usageStatus.features?.[feature];
    if (featureUsage && !featureUsage.allowed) {
      usageLimitExceeded = true;
    }
    if (featureUsage) {
      usageRemaining = featureUsage.remaining;
      usageLimit = featureUsage.limit;
      resetAt = featureUsage.reset_at;
    }
  }

  // User has full access
  if (hasTier && !usageLimitExceeded) {
    return <div className={className}>{children}</div>;
  }

  const tierLabel = TIER_LABELS[requiredTier];
  const TierIcon = requiredTier === "pro" ? Zap : Sparkles;

  // Usage limit hit (has tier, but exhausted quota)
  if (hasTier && usageLimitExceeded) {
    if (compact) {
      return (
        <div className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full ${className}`}>
          <Lock size={11} />
          Limit reached
        </div>
      );
    }
    return (
      <div className={`relative rounded-xl overflow-hidden ${className}`}>
        <div className="pointer-events-none select-none blur-[3px] opacity-40">
          {preview || children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 mb-3">
              <Lock size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">Daily limit reached</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {resetAt ? `Resets ${new Date(resetAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}` : "Upgrade for more"}
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-block text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Tier access blocked — upgrade prompt
  if (compact) {
    return (
      <Link
        href="/pricing"
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
          requiredTier === "pro"
            ? "bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400"
            : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400"
        } ${className}`}
      >
        <TierIcon size={11} />
        {tierLabel}
      </Link>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-[4px] opacity-30">
        {preview || children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/70 to-white/95 dark:from-slate-900/70 dark:to-slate-900/95 backdrop-blur-sm p-6">
        <div className="text-center max-w-xs">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${
            requiredTier === "pro"
              ? "bg-gradient-to-br from-violet-500 to-purple-600"
              : "bg-gradient-to-br from-indigo-500 to-blue-600"
          }`}>
            <TierIcon size={22} className="text-white" />
          </div>
          <p className="font-bold text-slate-900 dark:text-white text-base mb-1">
            {tierLabel} Feature
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {requiredTier === "pro"
              ? "Upgrade to Pro for advanced research, cross-article synthesis, and unlimited AI access."
              : "Upgrade to Plus for enhanced AI summaries, weekly reports, and unlimited bookmarks."}
          </p>
          <Link
            href="/pricing"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 ${
              requiredTier === "pro"
                ? "bg-gradient-to-r from-violet-600 to-purple-700"
                : "bg-gradient-to-r from-indigo-600 to-blue-700"
            }`}
          >
            <TierIcon size={14} />
            Upgrade to {tierLabel}
          </Link>
          <p className="mt-2 text-xs text-slate-400">7-day free trial · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}

export default TierGate;
