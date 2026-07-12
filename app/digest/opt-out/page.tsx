"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BellOff, CheckCircle, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/config";

export default function DigestOptOutPage() {
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");
    if (!userId) { setStatus("error"); return; }

    // Call the opt-out endpoint using user_id as a token fallback
    // In production, sign this URL with a secret
    fetch(`${API_BASE}/digest/opt-out-by-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(r => r.ok ? setStatus("done") : setStatus("error"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0f1e] px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" />
            <p className="text-slate-500 dark:text-slate-400">Processing your request…</p>
          </>
        )}
        {status === "done" && (
          <>
            <CheckCircle size={40} className="text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Unsubscribed</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              You've been removed from the weekly digest mailing list. You can re-subscribe anytime from your profile.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/profile" className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
                Go to Profile
              </Link>
              <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                Return to Home
              </Link>
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <BellOff size={36} className="text-slate-400 mx-auto" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We couldn't process your opt-out. Please try again from your{" "}
              <Link href="/profile" className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">profile settings</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
