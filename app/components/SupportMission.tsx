"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Loader2, Plus, Minus, Lock } from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SupportMission() {
  const [amount, setAmount] = useState<string>("99");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    import("js-cookie").then((Cookies) => {
      const currentToken = Cookies.default.get("access_token");
      if (currentToken) {
        setIsLoggedIn(true);
        setToken(currentToken);
      }
    });

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);



  const handleContribute = async () => {
    if (!isLoggedIn || !token) {
      toast.error("Please log in to contribute");
      return;
    }

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 1) {
      toast.error("Please enter a valid amount (minimum ₹1)");
      return;
    }

    // Convert to paise
    const amountInPaise = numAmount * 100;

    if (amountInPaise > 5000000) {
      toast.error("Maximum contribution limit is ₹50,000");
      return;
    }

    try {
      setLoading(true);
      // Create order
      const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_BASE || "http://localhost:8000";
      const response = await fetch(`${authBaseUrl}/auth/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create order");
      }

      const orderData = await response.json();

      // Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RelayPost",
        description: "Contribution",
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${authBaseUrl}/auth/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error("Verification failed");
            }
            toast.success("Thank you for your contribution!");
          } catch (err: any) {
            toast.error("Payment verification failed. If money was deducted, it will be refunded.");
          }
        },
        theme: {
          color: "#4f46e5", // Indigo-600
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-2 md:col-span-1">
      <div className="flex items-center justify-start gap-2 mb-3">
        <h4 className="text-white font-semibold text-base leading-none whitespace-nowrap">Support the Mission</h4>
        <span className="text-[10px] font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20 whitespace-nowrap">One-time Contribution</span>
      </div>
      <p className="text-sm text-gray-400 mb-5">
        Get our Weekly Digest — top stories, curated by us, straight to your inbox.
      </p>

      {/* Preset Chips */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[49, 99, 199].map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setAmount(preset.toString());
              setIsCustomAmount(false);
            }}
            disabled={loading}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border ${
              !isCustomAmount && amount === preset.toString()
                ? "bg-brand text-white border-brand shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                : "bg-dark-surface text-gray-400 border-gray-700/50 hover:border-gray-500 hover:text-white"
            } disabled:opacity-50`}
          >
            ₹{preset}
          </button>
        ))}
        <button
          onClick={() => setIsCustomAmount(true)}
          disabled={loading}
          className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border ${
            isCustomAmount
              ? "bg-brand text-white border-brand shadow-[0_0_10px_rgba(79,70,229,0.3)]"
              : "bg-dark-surface text-gray-400 border-gray-700/50 hover:border-gray-500 hover:text-white"
          } disabled:opacity-50`}
        >
          Custom
        </button>
      </div>

      {/* Custom Amount Input Box */}
      {isCustomAmount && (
        <div className="flex items-center bg-dark-surface rounded-full px-4 py-0.5 border border-brand shadow-[0_0_10px_rgba(79,70,229,0.2)] transition-colors mb-4">
          <span className="text-gray-400 text-sm font-medium">₹</span>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^[0-9\b]+$/.test(val)) setAmount(val);
            }}
            placeholder="Other amount" 
            min="1"
            max="50000"
            disabled={loading}
            className="bg-transparent border-none outline-none text-white font-medium text-sm w-full py-1.5 px-1.5 placeholder-gray-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      )}

      {/* Submit Button */}
      <button 
        onClick={handleContribute}
        disabled={loading || !amount || parseInt(amount) < 1}
        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand hover:bg-brand-dark flex items-center justify-center gap-2 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)]"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            Contribute <span className="font-bold text-white">₹{amount || "0"}</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>

      {/* Trust Signal */}
      <div className="flex items-center gap-1.5 mt-3 text-gray-500 text-xs">
        <Lock size={10} />
        <span>Secured by Razorpay</span>
      </div>
    </div>
  );
}
