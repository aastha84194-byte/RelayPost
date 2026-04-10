"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import NetworkBackground from '../../components/NetworkBackground';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE || `${AUTH_BASE}`;

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: formData.email, password: formData.password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");

      Cookies.set('access_token', data.access_token, { expires: 7, secure: true, sameSite: 'strict' });
      localStorage.setItem('auth_token', data.access_token);
      toast.success("Welcome back!");
      setTimeout(() => window.location.href = "/", 600);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${AUTH_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        Cookies.set('access_token', data.access_token, { expires: 7, secure: true, sameSite: 'strict' });
        localStorage.setItem('auth_token', data.access_token);
        toast.success("Successfully authenticated with Google");
        setTimeout(() => window.location.href = "/", 600);
      } else {
        toast.error(data.detail || "Google Login failed");
      }
    } catch (err: any) {
      console.error("Google auth failed", err);
      toast.error("Network error: Could not reach the server.");
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "mock-client-id"}>
      <div className="bg-deep-sea min-h-screen flex flex-col relative overflow-hidden">
        <Navbar />
        
        {/* Background Pattern */}
        <NetworkBackground />

        <main className="z-10 w-full flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
          <div className="w-full max-w-md relative">
            <div className="glass-panel rounded-2xl p-6 md:p-8 transition-all duration-300 shadow-2xl">
              <div className="flex flex-col items-center mb-6">
                <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight text-center">Welcome Back</h1>
                <p className="text-slate-400 text-xs mt-1 font-body">Login to continue exploring insights.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">mail</span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                      placeholder="name@company.com" required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                      placeholder="••••••••" minLength={8} required />
                    <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-3 top-[50%] -translate-y-[50%] flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg leading-none">{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <label className="flex items-center text-xs text-slate-400 cursor-pointer">
                    <input type="checkbox" className="mr-2 w-3 h-3 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0" />
                    Remember me
                  </label>
                  <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot Password?</a>
                </div>

                <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-widest mt-2">
                  {isLoading ? "Authenticating..." : "Login"}
                </button>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className="px-2 bg-[#0b0d1b] text-slate-400 uppercase tracking-widest">Or Continue With</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center opacity-90 transition-opacity hover:opacity-100 transform scale-90">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.log('Login Failed')}
                      theme="filled_blue"
                      shape="pill"
                    />
                  </div>
                </div>

                <div className="text-center mt-4 pt-2">
                  <p className="text-slate-400 text-xs">
                    Don't have an account?
                    <Link href="/register" className="text-white font-semibold hover:text-indigo-400 transition-colors ml-1">Sign Up.</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}
