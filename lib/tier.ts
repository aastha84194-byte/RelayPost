/**
 * Tier system types and context for RelayPost frontend.
 * 
 * IMPORTANT: tier is verified server-side on every premium API call.
 * This context is used only for UI gating — the real enforcement
 * always happens on the backend.
 */

export type Tier = "free" | "plus" | "pro";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired" | "paused";

export interface TierStatus {
  user_id: string;
  tier: Tier;
  status: SubscriptionStatus;
  is_active: boolean;
  is_trial: boolean;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface FeatureUsage {
  allowed: boolean;
  remaining: number;    // -1 = unlimited
  limit: number;        // -1 = unlimited
  reset_at: string | null;
  reason?: string;
}

export interface UsageStatus {
  user_id: string;
  tier: Tier;
  features: Record<string, FeatureUsage>;
}

// Features and their minimum required tier
export const FEATURE_TIERS: Record<string, Tier> = {
  ai_summary:      "free",   // limited for free
  ask_ai:          "free",   // limited for free
  cross_article:   "pro",
  research_mode:   "pro",
  weekly_report:   "plus",
  bookmarks:       "free",   // limited for free
  followed_topics: "free",   // limited for free
  export:          "plus",
  news_ai_summary: "free",   // limited for free
};

export const TIER_LABELS: Record<Tier, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
};

export const TIER_COLORS: Record<Tier, string> = {
  free:  "var(--tier-free)",
  plus:  "var(--tier-plus)",
  pro:   "var(--tier-pro)",
};

export const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  plus: 1,
  pro:  2,
};

/** Returns true if currentTier meets the requiredTier */
export function hasTierAccess(currentTier: Tier, requiredTier: Tier): boolean {
  return TIER_HIERARCHY[currentTier] >= TIER_HIERARCHY[requiredTier];
}
