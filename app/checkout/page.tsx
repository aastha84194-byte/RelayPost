"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { AUTH_BASE } from "@/lib/config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader2, ShieldCheck, RefreshCw, AlertCircle, ArrowLeft, XCircle, CheckCircle2, Heart, Lock, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

interface RazorpaySuccessResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
}

interface RazorpayErrorResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: RazorpayErrorResponse) => void) => void;
}

interface RazorpayOptions {
  key?: string;
  subscription_id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  handler?: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpaySubscriptionResponseData {
  razorpay_key_id?: string;
  razorpay_subscription_id?: string;
  is_upgrade_eligible?: boolean;
  is_fallback_upgrade?: boolean;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
  }
}

type CheckoutStatus =
  | "initializing"
  | "waiting"
  | "activating"
  | "cancelled"
  | "failed"
  | "error"
  | "upgrade_eligible"
  | "fallback_upgrade"
  | "contribution_ready";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plan = searchParams.get("plan");
  const billing = searchParams.get("billing");
  const type = searchParams.get("type");
  const initialAmount = searchParams.get("amount") || "50";
  const isContribution = type === "contribution" || plan === "contribution";

  const [status, setStatus] = useState<CheckoutStatus>("initializing");
  const [error, setError] = useState<string | null>(null);
  const [razorpayData, setRazorpayData] = useState<RazorpaySubscriptionResponseData | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const hasInitialized = React.useRef(false);

  // Contribution state
  const [amount, setAmount] = useState<string>(initialAmount);
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(searchParams.get("custom") === "1");
  const [contribLoading, setContribLoading] = useState<boolean>(false);
  const [contribSuccess, setContribSuccess] = useState<boolean>(false);

  const openRazorpayModal = async (data: RazorpaySubscriptionResponseData) => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const res = await loadRazorpay();
    if (!res || !window.Razorpay) {
      setError("Razorpay SDK failed to load. Are you online?");
      setStatus("error");
      return;
    }

    const token = Cookies.get("access_token") || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    const options: RazorpayOptions = {
      key: data.razorpay_key_id,
      subscription_id: data.razorpay_subscription_id,
      name: "RelayPost",
      description: `RelayPost ${plan?.charAt(0).toUpperCase()}${plan?.slice(1)} Plan`,
      image: "/icon-512.png",
      handler: async function (response: RazorpaySuccessResponse) {
        setStatus("activating");
        try {
          const actRes = await fetch(
            `${AUTH_BASE}/subscription/activate?razorpay_subscription_id=${response.razorpay_subscription_id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                tier: plan,
                billing_interval: billing,
              }),
            }
          );

          if (actRes.ok) {
            toast.success("Subscription activated successfully!");
            router.push("/profile/subscription");
          } else {
            const errData = await actRes.json().catch(() => ({}));
            const msg = errData.detail || "Payment verified but failed to activate locally. Contact support.";
            setError(msg);
            toast.error(msg);
            setStatus("error");
          }
        } catch {
          const msg = "An error occurred while activating subscription.";
          setError(msg);
          toast.error(msg);
          setStatus("error");
        }
      },
      prefill: {
        name: "",
        email: "",
      },
      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: function () {
          setStatus("cancelled");
          toast("Payment cancelled.");
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response: RazorpayErrorResponse) {
      const msg = response.error?.description || "Payment failed. Please try another method.";
      setError(msg);
      setStatus("failed");
      toast.error(msg);
    });

    setStatus("waiting");
    rzp.open();
  };

  const handleContribute = async () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 1) {
      toast.error("Please enter a valid amount (minimum ₹1)");
      return;
    }

    const amountInPaise = numAmount * 100;
    if (amountInPaise > 5000000) {
      toast.error("Maximum contribution limit is ₹50,000");
      return;
    }

    const token = Cookies.get("access_token") || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    if (!token) {
      toast.error("Please log in to contribute");
      router.push(`/auth/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/checkout")}`);
      return;
    }

    try {
      setContribLoading(true);

      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (typeof window !== "undefined" && window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const resLoaded = await loadRazorpay();
      if (!resLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Are you online?");
      }

      let response = await fetch(`${AUTH_BASE}/auth/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!response.ok && response.status === 404) {
        response = await fetch(`${AUTH_BASE}/payment/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: amountInPaise }),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create contribution order");
      }

      const orderData = await response.json();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RelayPost",
        description: `One-Time Contribution (₹${numAmount})`,
        image: "/icon-512.png",
        order_id: orderData.order_id,
        handler: async function (resp: RazorpaySuccessResponse) {
          try {
            let verifyRes = await fetch(`${AUTH_BASE}/auth/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_signature: resp.razorpay_signature,
              }),
            });

            if (!verifyRes.ok && verifyRes.status === 404) {
              verifyRes = await fetch(`${AUTH_BASE}/payment/verify`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_signature: resp.razorpay_signature,
                }),
              });
            }

            if (!verifyRes.ok) {
              throw new Error("Verification failed");
            }

            toast.success("Thank you for your contribution!");
            setContribSuccess(true);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Payment verification failed. If money was deducted, it will be refunded.";
            toast.error(msg);
          }
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            toast("Contribution payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: RazorpayErrorResponse) {
        toast.error(`Payment failed: ${resp.error?.description || "Unknown error"}`);
      });
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setContribLoading(false);
    }
  };

  const initPayment = async () => {
    setError(null);

    // Support direct secure token passed via email campaign links
    const urlToken = searchParams.get("token");
    if (urlToken) {
      Cookies.set("access_token", urlToken, { expires: 7, secure: true, sameSite: "strict" });
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", urlToken);
      }
    }

    // Track campaign link click if arriving from email campaign
    const utmSource = searchParams.get("utm_source");
    const utmContent = searchParams.get("utm_content") || searchParams.get("link_type");
    if (utmSource === "email_campaign" || utmContent) {
      const linkType = utmContent || (isContribution ? `contribution_${amount}` : `subscription_${plan || "plus"}`);
      const amtVal = isContribution ? parseInt(amount, 10) : (plan === "pro" ? 199 : 99);

      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "campaign_link_click", {
          campaign: searchParams.get("utm_campaign") || "founding_member",
          link_type: linkType,
          value: isNaN(amtVal) ? 0 : amtVal,
        });
      }

      fetch(`${AUTH_BASE}/campaign/track-click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(urlToken || Cookies.get("access_token") ? { Authorization: `Bearer ${urlToken || Cookies.get("access_token")}` } : {})
        },
        body: JSON.stringify({
          link_type: linkType,
          campaign_name: searchParams.get("utm_campaign") || "founding_member",
          amount: isNaN(amtVal) ? null : amtVal,
          target_url: typeof window !== "undefined" ? window.location.href : null,
        }),
      }).catch(() => {
        fetch(`${AUTH_BASE}/auth/campaign/track-click`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(urlToken || Cookies.get("access_token") ? { Authorization: `Bearer ${urlToken || Cookies.get("access_token")}` } : {})
          },
          body: JSON.stringify({
            link_type: linkType,
            campaign_name: searchParams.get("utm_campaign") || "founding_member",
            amount: isNaN(amtVal) ? null : amtVal,
            target_url: typeof window !== "undefined" ? window.location.href : null,
          }),
        }).catch(() => {});
      });
    }

    if (isContribution) {
      setStatus("contribution_ready");
      return;
    }

    setStatus("initializing");

    if (!plan || !billing) {
      router.push("/pricing");
      return;
    }

    const token = urlToken || Cookies.get("access_token") || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    if (!token) {
      router.push(`/auth/login?redirect=/checkout?plan=${plan}&billing=${billing}`);
      return;
    }

    try {
      const subRes = await fetch(`${AUTH_BASE}/subscription/create-razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: plan,
          billing_interval: billing,
        }),
      });

      if (!subRes.ok) {
        const errData = await subRes.json();
        throw new Error(errData.detail || "Failed to initialize checkout");
      }

      const data: RazorpaySubscriptionResponseData = await subRes.json();
      setRazorpayData(data);

      if (data.is_upgrade_eligible) {
        setStatus("upgrade_eligible");
        return;
      }

      if (data.is_fallback_upgrade) {
        setStatus("fallback_upgrade");
        return;
      }

      await openRazorpayModal(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    initPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, billing, type, router]);

  const handleRetry = () => {
    if (razorpayData) {
      openRazorpayModal(razorpayData);
    } else {
      hasInitialized.current = false;
      initPayment();
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    const token = Cookies.get("access_token");
    try {
      const res = await fetch(`${AUTH_BASE}/subscription/upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier: plan,
          billing_interval: billing,
        }),
      });

      if (res.ok) {
        toast.success("Upgrade successful!");
        router.push("/profile/subscription");
      } else {
        const errData = await res.json();
        toast.error(errData.detail || "Upgrade failed.");
      }
    } catch {
      toast.error("Network error during upgrade.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      {status === "contribution_ready" ? (
        contribSuccess ? (
          <div className="flex flex-col items-center gap-6 text-center max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-900/30">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Contribution Received!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-1">
                Thank you for contributing <strong className="text-slate-900 dark:text-white">₹{amount}</strong> to RelayPost.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs">
                Your direct support empowers our independent reporting and research.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => router.push("/")}
                className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
              >
                Explore Articles
              </button>
              <button
                onClick={() => router.push("/profile/contributions")}
                className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                View Contribution History
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Heart size={32} />
            </div>
            <div>
              <div className="inline-block mb-2">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Direct Support
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Support the Mission
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Make a direct one-time contribution to power independent journalism &amp; AI research. No recurring mandate.
              </p>
            </div>

            {/* Preset Buttons */}
            <div className="w-full">
              <label className="block text-left text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Select or Enter Contribution Amount:
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[25, 50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount(preset.toString());
                      setIsCustomAmount(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-sm font-bold transition-all border ${
                      !isCustomAmount && amount === preset.toString()
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                        : "bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400"
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomAmount(true)}
                  className={`py-2 px-3 rounded-xl text-sm font-bold transition-all border ${
                    isCustomAmount
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-indigo-400"
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Amount input box */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 transition-colors">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-lg mr-2">₹</span>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^[0-9\b]+$/.test(val)) {
                      setAmount(val);
                      if (![25, 50, 100, 250, 500].includes(Number(val))) {
                        setIsCustomAmount(true);
                      }
                    }
                  }}
                  placeholder="Enter amount"
                  className="w-full bg-transparent outline-none font-bold text-lg text-slate-900 dark:text-white"
                />
              </div>
              <p className="text-left text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Minimum ₹1 &bull; You can change this amount to anything you&apos;d like
              </p>
            </div>

            {/* Action Button */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={handleContribute}
                disabled={contribLoading || !amount || parseInt(amount, 10) < 1}
                className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {contribLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Contribute ₹{amount || "0"}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Secured by Razorpay &bull; UPI &bull; Cards &bull; NetBanking</span>
              </div>
            </div>

            {/* Switch to Subscription Plan */}
            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Looking for full daily AI syntheses &amp; research features?
              </p>
              <button
                type="button"
                onClick={() => router.push("/checkout?plan=plus&billing=monthly")}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Switch to RelayPost Plus Free Trial (₹99/mo) &rarr;
              </button>
            </div>
          </div>
        )
      ) : status === "initializing" ? (
        <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
          <Loader2 size={48} className="animate-spin text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Initializing Secure Checkout...</h2>
          <p className="text-sm">Please do not close this window.</p>
        </div>
      ) : status === "activating" ? (
        <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
          <Loader2 size={48} className="animate-spin text-emerald-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifying & Activating Subscription...</h2>
          <p className="text-sm">Please wait while we confirm your payment with Razorpay.</p>
        </div>
      ) : status === "waiting" ? (
        <div className="flex flex-col items-center gap-6 text-center max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
          <ShieldCheck size={48} className="text-emerald-500" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Payment Secure</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              Waiting for Razorpay to complete...
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Please complete your transaction in the Razorpay popup window.
            </p>
          </div>
          <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
            <button
              onClick={() => openRazorpayModal(razorpayData)}
              className="w-full py-2.5 px-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Re-open Payment Window
            </button>
            <button
              onClick={() => {
                setStatus("cancelled");
                toast("Payment cancelled.");
              }}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      ) : status === "cancelled" ? (
        <div className="flex flex-col items-center gap-6 text-center max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-900/30">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertCircle size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Payment Cancelled</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              You closed the payment window before completing your purchase. No charges were made to your account.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <ArrowLeft size={18} />
              Choose Another Plan
            </button>
            <button
              onClick={() => router.push("/checkout?type=contribution&amount=50")}
              className="text-xs text-slate-400 hover:text-indigo-500 transition-colors py-1"
            >
              Or make a direct one-time contribution (₹50)
            </button>
          </div>
        </div>
      ) : status === "failed" || status === "error" || error ? (
        <div className="flex flex-col items-center gap-6 text-center max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-900/30">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <XCircle size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Checkout Failed</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {error || "An unexpected error occurred during payment processing."}
            </p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => {
                hasInitialized.current = false;
                initPayment();
              }}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <ArrowLeft size={18} />
              Back to Pricing
            </button>
          </div>
        </div>
      ) : status === "fallback_upgrade" ? (
        <div className="flex flex-col items-center gap-6 text-center max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-900/30">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <span className="text-3xl font-bold">!</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Upgrade Notice</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
              You are upgrading to the <strong className="text-slate-900 dark:text-white">{plan?.charAt(0).toUpperCase()}{plan?.slice(1)}</strong> plan.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-left border border-amber-200 dark:border-amber-800/50 mb-2">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Important:</strong> Because your current plan uses UPI or an unsupported mandate, Razorpay cannot automatically carry over your unused days. 
                <br/><br/>
                If you proceed, you will be billed the full amount for the new plan today, and your previous plan will be cancelled immediately without a prorated refund.
              </p>
            </div>
          </div>
          <button 
            onClick={() => openRazorpayModal(razorpayData)}
            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
          >
            Acknowledge & Checkout
          </button>
          <button 
            onClick={() => router.push("/profile/subscription")}
            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-transparent text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel Upgrade
          </button>
        </div>
      ) : status === "upgrade_eligible" ? (
        <div className="flex flex-col items-center gap-6 text-center max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
          <ShieldCheck size={48} className="text-indigo-500" />
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Confirm Upgrade</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              You are upgrading to the <strong className="text-slate-900 dark:text-white">{plan?.charAt(0).toUpperCase()}{plan?.slice(1)}</strong> plan. 
              Razorpay will automatically calculate the prorated difference based on your unused days and charge your saved payment method instantly.
            </p>
          </div>
          <button 
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
          >
            {upgrading ? <Loader2 size={18} className="animate-spin" /> : null}
            {upgrading ? "Processing..." : "Confirm Upgrade"}
          </button>
          <button 
            onClick={() => router.push("/profile/subscription")}
            className="w-full mt-2 flex justify-center items-center gap-2 px-6 py-3 bg-transparent text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <Loader2 size={40} className="animate-spin" />
            <p>Loading...</p>
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
