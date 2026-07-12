"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { AUTH_BASE } from "@/lib/config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const plan = searchParams.get("plan");
  const billing = searchParams.get("billing");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [isFallbackUpgrade, setIsFallbackUpgrade] = useState(false);
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
      setLoading(false);
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
        try {
          const actRes = await fetch(`${AUTH_BASE}/subscription/activate?razorpay_subscription_id=${response.razorpay_subscription_id}`, {
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

          if (actRes.ok) {
            toast.success("Subscription activated successfully!");
            router.push("/profile/subscription");
          } else {
            toast.error("Payment verified but failed to activate locally. Contact support.");
            router.push("/profile/subscription");
          }
        } catch (err) {
          toast.error("An error occurred while activating subscription.");
          router.push("/profile/subscription");
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
          setLoading(false);
          toast("Payment cancelled.");
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      toast.error("Payment failed. Please try another method.");
      setLoading(false);
    });
    
    rzp.open();
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (!plan || !billing) {
      router.push("/pricing");
      return;
    }

    const token = Cookies.get("access_token");
    if (!token) {
      router.push(`/auth/login?redirect=/checkout?plan=${plan}&billing=${billing}`);
      return;
    }

    const initPayment = async () => {
      setLoading(true);
      setError(null);
      
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

        if (data.is_upgrade_eligible) {
          setIsUpgrade(true);
          setLoading(false);
          return;
        }

        if (data.is_fallback_upgrade) {
          setIsFallbackUpgrade(true);
          setRazorpayData(data);
          setLoading(false);
          return;
        }

        await openRazorpayModal(data);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        setLoading(false);
      }
    };

    initPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, billing, router]);

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
      {loading ? (
        <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
          <Loader2 size={48} className="animate-spin text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Initializing Secure Checkout...</h2>
          <p className="text-sm">Please do not close this window.</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <span className="text-3xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Checkout Failed</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : isFallbackUpgrade ? (
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
      ) : isUpgrade ? (
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
      ) : (
        <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
          <ShieldCheck size={48} className="text-emerald-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Secure</h2>
          <p className="text-sm">Waiting for Razorpay to complete...</p>
        </div>
      )}
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
