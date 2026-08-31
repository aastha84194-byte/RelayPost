"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { AUTH_BASE } from "@/lib/config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader2, ShieldCheck,RefreshCw,AlertCircle,ArrowLeft,XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

type CheckoutStatus =
  | "initializing"
  | "waiting"
  | "activating"
  | "cancelled"
  | "failed"
  | "error"
  | "upgrade_eligible"
  | "fallback_upgrade";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plan = searchParams.get("plan");
  const billing = searchParams.get("billing");

  const [status, setStatus] = useState<CheckoutStatus>("initializing");
  const [error, setError] = useState<string | null>(null);
  const [razorpayData, setRazorpayData] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);
  const hasInitialized = React.useRef(false);

  const openRazorpayModal = async (data: any) => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const res = await loadRazorpay();
    if (!res) {
      setError("Razorpay SDK failed to load. Are you online?");
      setStatus("error");
      return;
    }

    const token = Cookies.get("access_token");
    const options = {
      key: data.razorpay_key_id,
      subscription_id: data.razorpay_subscription_id,
      name: "RelayPost",
      description: `RelayPost ${plan?.charAt(0).toUpperCase()}${plan?.slice(1)} Plan`,
      image: "/icon-512.png",
      handler: async function (response: any) {
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
        } catch (err) {
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

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      const msg = response.error?.description || "Payment failed. Please try another method.";
      setError(msg);
      setStatus("failed");
      toast.error(msg);
    });

    setStatus("waiting");
    rzp.open();
  };

  const initPayment = async () => {
    setStatus("initializing");
    setError(null);

    if (!plan || !billing) {
      router.push("/pricing");
      return;
    }

    const token = Cookies.get("access_token");
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

      const data = await subRes.json();
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
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    initPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, billing, router]);

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
    } catch (err) {
      toast.error("Network error during upgrade.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      {status === "initializing" ? (
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
              onClick={() => router.push("/profile/subscription")}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors mt-1"
            >
              Go to Subscription Profile
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
