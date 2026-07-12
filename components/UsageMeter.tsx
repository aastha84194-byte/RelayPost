"use client";

/**
 * UsageMeter — displays remaining uses for a feature in a compact bar/badge.
 * Used in profile pages, article pages, and other places with usage limits.
 */
import React from "react";
import Link from "next/link";
import { useTier } from "./TierProvider";
import type { Tier } from "@/lib/tier";

interface UsageMeterProps {
  feature: string;
  label?: string;         // e.g. "AI Summaries"
  className?: string;
  showBar?: boolean;      // show a progress bar below the count
}

const FEATURE_LABELS: Record<string, string> = {
  ai_summary:       "AI Summaries",
  ask_ai:           "Ask AI",
  cross_article:    "Cross-Article Synthesis",
  research_mode:    "Research Reports",
  weekly_report:    "Weekly Reports",
  bookmarks:        "Bookmarks",
  followed_topics:  "Followed Topics",
  export:           "Exports",
  news_ai_summary:  "News AI Summaries",
};

export function UsageMeter({ feature, label, className, showBar = true }: UsageMeterProps) {
  const { tier, usageStatus, isLoading } = useTier();

  if (isLoading || !usageStatus) {
    return <div className={`h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />;
  }

  const featureUsage = usageStatus.features?.[feature];
  if (!featureUsage) return null;

  const { remaining, limit, reset_at } = featureUsage;

  // Unlimited
  if (limit === -1 || remaining === -1) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        {label || FEATURE_LABELS[feature] || feature}: Unlimited
      </div>
    );
  }

  const pct = limit > 0 ? Math.max(0, (remaining / limit) * 100) : 0;
  const isLow = pct <= 25;
  const isExhausted = remaining === 0;

  const barColor = isExhausted
    ? "bg-red-500"
    : isLow
    ? "bg-amber-500"
    : "bg-indigo-500";

  const textColor = isExhausted
    ? "text-red-600 dark:text-red-400"
    : isLow
    ? "text-amber-600 dark:text-amber-400"
    : "text-slate-600 dark:text-slate-400";

  const resetDate = reset_at
    ? new Date(reset_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium ${textColor}`}>
          {label || FEATURE_LABELS[feature] || feature}
        </span>
        <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
          {isExhausted ? (
            <Link href="/pricing" className="underline underline-offset-2">Upgrade</Link>
          ) : (
            `${remaining} / ${limit}`
          )}
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {resetDate && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Resets {resetDate}
        </p>
      )}
    </div>
  );
}

export default UsageMeter;
