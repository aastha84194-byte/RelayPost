"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Loader2, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SupportMission() {
  const [amount, setAmount] = useState<string>("99");
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

  const handleIncrease = () => {
    const current = parseInt(amount) || 0;
    setAmount(Math.min(50000, current + 50).toString());
  };

  const handleDecrease = () => {
    const current = parseInt(amount) || 0;
    setAmount(Math.max(1, current - 50).toString());
  };

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
      <h4 className="text-white font-semibold mb-4 text-base">Support the Mission</h4>
      <p className="text-sm text-gray-400 mb-4">
        Contribute to get exclusive content and Weekly Digest directly in your MailBox.
      </p>
      <div className="flex items-center bg-dark-surface rounded-full p-1 border border-gray-700/50 focus-within:border-brand/50 transition-colors max-w-sm">
        <button 
          onClick={handleDecrease}
          disabled={loading}
          className="w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Minus size={14} />
        </button>
        <span className="pl-2 text-gray-500 dark:text-slate-400 transition-colors duration-300">₹</span>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            // Prevent entering "e", "+", "-", or "." (force positive integers only)
            if (val === "" || /^[0-9\b]+$/.test(val)) {
              setAmount(val);
            }
          }}
          placeholder="99" 
          min="1"
          max="50000"
          step="50"
          disabled={loading}
          className="bg-transparent border-none outline-none text-white text-sm w-full p-2 placeholder-gray-500 disabled:opacity-50 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button 
          onClick={handleIncrease}
          disabled={loading}
          className="w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50 mr-1"
        >
          <Plus size={14} />
        </button>
        <button 
          onClick={handleContribute}
          disabled={loading}
          className="w-8 h-8 rounded-full bg-brand hover:bg-brand-dark flex flex-shrink-0 items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}
