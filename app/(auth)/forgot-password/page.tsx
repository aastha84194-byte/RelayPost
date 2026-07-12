"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NetworkBackground from '../../components/NetworkBackground';
import { Mail, Lock, Eye, EyeOff, Hash } from 'lucide-react';
import { AUTH_BASE } from "@/lib/config";

export default function ForgotPassword() {
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/auth/forgot-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        toast.success("If the email is registered, an OTP has been sent!");
        setStep('OTP');
        setResendTimer(30);
      } else {
        const data = await res.json();
        toast.error(data.detail || "Failed to request OTP");
      }
    } catch (err) {
      toast.error("Network error: Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password successfully reset! You can now login.");
        setTimeout(() => window.location.href = '/login', 1000);
      } else {
        toast.error(data.detail || "Failed to reset password");
      }
    } catch (err) {
      toast.error("Network error: Could not reach the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-deep-sea min-h-screen flex flex-col relative overflow-hidden">
      <NetworkBackground />

      <main className="z-10 w-full flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <div className="w-full max-w-md relative">
          <div className="glass-panel rounded-2xl p-6 md:p-8 transition-all duration-300 shadow-2xl">
            <AnimatePresence mode="wait">
              {step === 'EMAIL' ? (
                <motion.div
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex flex-col items-center mb-6">
                    <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight text-center">Reset Password</h1>
                    <p className="text-slate-400 text-xs mt-2 font-body text-center leading-relaxed">
                      Enter your email address to receive a 6-digit one-time password (OTP).
                    </p>
                  </div>

                  <form onSubmit={handleRequestOTP} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                          placeholder="name@domain.com" required />
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-widest">
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </button>

                    <div className="text-center mt-6">
                      <p className="text-slate-400 text-xs">
                        Remember your password?
                        <Link href="/login" className="text-white font-semibold hover:text-indigo-400 transition-colors ml-1">Back to Login.</Link>
                      </p>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex flex-col items-center mb-6">
                    <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight text-center">Enter OTP</h1>
                    <p className="text-slate-400 text-xs mt-2 font-body text-center leading-relaxed">
                      We've sent a 6-digit code to <br/><span className="text-white font-bold">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">6-Digit Code</label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm tracking-[0.5em]"
                          placeholder="••••••" required />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                          placeholder="••••••••" minLength={8} required />
                        <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-3 top-[50%] -translate-y-[50%] flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full py-2.5 mt-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-widest">
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>

                    <div className="flex flex-col items-center gap-4 mt-6">
                      <button 
                        type="button" 
                        onClick={() => handleRequestOTP()} 
                        disabled={isLoading || resendTimer > 0} 
                        className={`text-xs font-semibold transition-colors ${resendTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'}`}
                      >
                        {isLoading ? "Resending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive it? Resend OTP"}
                      </button>
                      <button type="button" onClick={() => setStep('EMAIL')} className="text-slate-400 text-xs hover:text-white transition-colors">
                        Wrong email? Go back.
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
