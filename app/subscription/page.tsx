"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  CreditCard, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Sparkles, Zap, ChevronRight, Calendar, Loader2,
} from "lucide-react";
import { AUTH_BASE } from "@/lib/config";
import { useTier } from "@/components/TierProvider";
import { TIER_LABELS } from "@/lib/tier";
import type { Tier } from "@/lib/tier";

interface SubscriptionData {
  id: string;
  tier: Tier;
  status: string;
  is_trial: boolean;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  payment_failed_at: string | null;
  grace_period_end: string | null;
  amount_paise: number | null;
  currency: string;
  billing_interval: string | null;
  payment_retry_count: number;
}

const STATUS_CONFIG = {
  active:    { label: "Active",       color: "emerald", icon: CheckCircle2 },
  trialing:  { label: "Trial",        color: "indigo",  icon: Sparkles },
  past_due:  { label: "Payment Due",  color: "amber",   icon: AlertTriangle },
  cancelled: { label: "Cancelled",    color: "slate",   icon: XCircle },
  expired:   { label: "Expired",      color: "red",     icon: XCircle },
  paused:    { label: "Paused",       color: "slate",   icon: RefreshCw },
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

function fmtAmount(paise: number | null) {
  if (!paise) return "—";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { tier, refresh } = useTier();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) { router.push("/auth/login"); return; }

    fetch(`${AUTH_BASE}/subscription/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setSubscription(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to turn off autopay? You'll keep access until the end of your billing period.")) return;
    setActionLoading(true);
    setMessage(null);
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${AUTH_BASE}/subscription/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "user_initiated" }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Autopay disabled. Your plan is active until the end of the billing period." });
        const data = await res.json();
        setSubscription((prev) => prev ? { ...prev, cancel_at_period_end: true } : prev);
        refresh();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.detail?.message || "Failed to cancel. Please try again." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    setMessage(null);
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${AUTH_BASE}/subscription/reactivate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Autopay reactivated. Your subscription will renew normally." });
        setSubscription((prev) => prev ? { ...prev, cancel_at_period_end: false } : prev);
        refresh();
      } else {
        setMessage({ type: "error", text: "Failed to reactivate. Please try again." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
        <Footer />
      </>
    );
  }

  const status = subscription?.status || "active";
  const statusCfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
  const StatusIcon = statusCfg.icon;

  const isFree = !subscription || subscription.tier === "free";
  const isPlus = subscription?.tier === "plus";
  const isPro = subscription?.tier === "pro";
  const TierIcon = isPro ? Zap : Sparkles;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-[#0a0f1e] pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Subscription</h1>

          {/* Status message */}
          {message && (
            <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {message.text}
            </div>
          )}

          {/* Current plan card */}
          <div className={`rounded-2xl border p-6 mb-6 ${
            isPro
              ? "bg-gradient-to-br from-violet-600 to-purple-800 border-violet-500 text-white"
              : isPlus
              ? "bg-gradient-to-br from-indigo-600 to-blue-700 border-indigo-500 text-white"
              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {!isFree && <TierIcon size={16} className="text-white/80" />}
                  <p className={`text-sm font-semibold ${isFree ? "text-slate-500 dark:text-slate-400" : "text-white/70"}`}>
                    Current Plan
                  </p>
                </div>
                <p className={`text-3xl font-extrabold ${isFree ? "text-slate-900 dark:text-white" : "text-white"}`}>
                  {TIER_LABELS[subscription?.tier || "free"]}
                </p>
                {!isFree && subscription?.amount_paise && (
                  <p className={`text-sm mt-0.5 ${isFree ? "text-slate-400" : "text-white/60"}`}>
                    {fmtAmount(subscription.amount_paise)} / {subscription.billing_interval || "month"}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                isFree ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                       : "bg-white/20 text-white"
              }`}>
                <StatusIcon size={12} />
                {statusCfg.label}
              </div>
            </div>

            {/* Trial info */}
            {subscription?.is_trial && subscription.trial_end && (
              <div className="mt-4 flex items-center gap-2 text-sm text-white/70 bg-white/10 rounded-lg px-3 py-2">
                <Calendar size={14} />
                Trial ends {fmtDate(subscription.trial_end)} — your card will be charged automatically
              </div>
            )}

            {/* Payment due warning */}
            {status === "past_due" && subscription?.grace_period_end && (
              <div className="mt-4 flex items-center gap-2 text-sm text-amber-200 bg-amber-600/30 rounded-lg px-3 py-2">
                <AlertTriangle size={14} />
                Payment failed. Grace period ends {fmtDate(subscription.grace_period_end)} — update your payment method to avoid downgrade.
              </div>
            )}

            {/* Cancel-at-end info */}
            {subscription?.cancel_at_period_end && subscription.current_period_end && (
              <div className="mt-4 flex items-center gap-2 text-sm text-white/70 bg-white/10 rounded-lg px-3 py-2">
                <Calendar size={14} />
                Access until {fmtDate(subscription.current_period_end)} — autopay is off
              </div>
            )}
          </div>

          {/* Details grid */}
          {!isFree && subscription && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "Next billing", value: subscription.cancel_at_period_end ? "None (cancelled)" : fmtDate(subscription.current_period_end) },
                { label: "Billing cycle", value: subscription.billing_interval?.charAt(0).toUpperCase() + (subscription.billing_interval?.slice(1) || "") || "—" },
                { label: "Trial end", value: subscription.is_trial ? fmtDate(subscription.trial_end) : "—" },
                { label: "Amount", value: fmtAmount(subscription.amount_paise) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3">
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {/* Free tier — upgrade prompt */}
            {isFree && (
              <Link
                href="/pricing"
                className="flex items-center justify-between w-full px-5 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Upgrade to Plus or Pro
                </div>
                <ChevronRight size={16} />
              </Link>
            )}

            {/* Cancel autopay */}
            {!isFree && !subscription?.cancel_at_period_end && status !== "expired" && status !== "cancelled" && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                Turn off autopay
              </button>
            )}

            {/* Reactivate */}
            {subscription?.cancel_at_period_end && (
              <button
                onClick={handleReactivate}
                disabled={actionLoading}
                className="w-full px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Reactivate autopay
              </button>
            )}

            {/* Upgrade from Plus to Pro */}
            {isPlus && (
              <Link
                href="/pricing"
                className="flex items-center justify-between w-full px-5 py-3 rounded-xl border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 font-medium text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} />
                  Upgrade to Pro
                </div>
                <ChevronRight size={14} />
              </Link>
            )}

            {/* Expired — resubscribe */}
            {(status === "expired" || status === "cancelled") && (
              <Link
                href="/pricing"
                className="flex items-center justify-between w-full px-5 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <span>Resubscribe</span>
                <ChevronRight size={16} />
              </Link>
            )}
          </div>

          <p className="mt-6 text-xs text-slate-400 text-center">
            Payments processed securely by Razorpay. Need help? <Link href="/contact" className="underline underline-offset-2">Contact support</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
