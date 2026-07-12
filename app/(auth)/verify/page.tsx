"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { AUTH_BASE } from "@/lib/config";
import NetworkBackground from '../../components/NetworkBackground';
import Footer from '../../components/Footer';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${AUTH_BASE}/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          Cookies.set('access_token', data.access_token, { expires: 7, secure: true, sameSite: 'strict' });
          localStorage.setItem('auth_token', data.access_token);
          toast.success("Email successfully verified!");
          setTimeout(() => {
            window.location.href = "/?onboarding=true";
          }, 1500);
        } else {
          setStatus("error");
          setErrorMessage(data.detail || "Verification failed. Link may be expired.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage("Network error. Could not connect to server.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="bg-deep-sea min-h-screen flex flex-col relative overflow-hidden font-sans">
      <NetworkBackground />
      <div className="glow-orb top-10 right-10 animate-float" />
      <div className="glow-orb bottom-10 left-10 animate-float" style={{ animationDelay: '3s' }} />
      
      <main className="z-10 w-full flex-grow flex items-center justify-center p-6 md:py-16 relative">
        <div className="w-full max-w-sm relative">
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 transition-all duration-300 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center text-center">
            
            {status === "loading" && (
              <>
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 border-2 border-primary/40 rounded-full animate-ping"></div>
                  <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
                </div>
                <h1 className="text-white text-xl font-bold tracking-tight">Verifying Email...</h1>
                <p className="text-slate-400 text-sm mt-3">Please wait while we validate your secure token.</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-emerald-500 text-4xl">check_circle</span>
                </div>
                <h1 className="text-white text-xl font-bold tracking-tight">Verified Successfully</h1>
                <p className="text-slate-400 text-sm mt-3">Your identity has been confirmed. Redirecting to your dashboard...</p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-rose-500 text-4xl">error</span>
                </div>
                <h1 className="text-white text-xl font-bold tracking-tight">Verification Failed</h1>
                <p className="text-rose-400/90 text-sm mt-3">{errorMessage}</p>
                <button 
                  onClick={() => window.location.href = "/login"}
                  className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors text-sm font-bold"
                >
                  Return to Login
                </button>
              </>
            )}
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={<div className="bg-deep-sea min-h-screen"></div>}>
      <VerifyContent />
    </Suspense>
  );
}
