"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import NetworkBackground from '../../components/NetworkBackground';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPasswordStrength(score);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          display_name: formData.name
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      
      // Attempt to immediately log the user in to get their session token
      const loginRes = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: formData.email, password: formData.password })
      });
      
      if (loginRes.ok) {
        const tokenData = await loginRes.json();
        Cookies.set('access_token', tokenData.access_token, { expires: 7, secure: true, sameSite: 'strict' });
        localStorage.setItem('auth_token', tokenData.access_token);
        toast.success("Welcome! You are securely logged in.");
        setTimeout(() => window.location.href = "/", 600);
      } else {
        toast.success("Account created successfully. Redirecting to login...");
        setTimeout(() => window.location.href = "/login", 1000);
      }
    } catch (err: any) {
      if (Array.isArray(err.message)) {
          toast.error(err.message[0].msg || "Validation error");
      } else {
          toast.error(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
      try {
        const res = await fetch("http://localhost:8000/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: credentialResponse.credential })
        });
        const data = await res.json();
        if (res.ok) {
            Cookies.set('access_token', data.access_token, { expires: 7, secure: true, sameSite: 'strict' });
            localStorage.setItem('auth_token', data.access_token);
            toast.success("Successfully registered with Google");
            setTimeout(() => window.location.href = "/", 600);
        } else {
            toast.error(data.detail || "Google Signup failed");
        }
      } catch (err: any) {
          console.error("Google auth failed", err);
          toast.error("Network error: Could not reach the server.");
      }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "mock-client-id"}>
      <div className="bg-deep-sea min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Pattern */}
        <NetworkBackground />
        
        <main className="z-10 w-full max-w-md relative">
          <div className="glass-panel rounded-2xl p-6 md:p-8 transition-all duration-300 shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <span className="text-white text-2xl font-extrabold tracking-tighter mb-2">Editorial Intelligence</span>
              <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight text-center">Join our Community</h1>
              <p className="text-slate-400 text-xs mt-1 font-body">Scale your insights with the Digital Curator.</p>
            </div>
            
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" 
                  placeholder="Alex Rivera" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">Business Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" 
                  placeholder="name@company.com" required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">Create a Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      calculatePasswordStrength(e.target.value);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" 
                    placeholder="••••••••" minLength={8} required />
                  <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-3 top-[50%] -translate-y-[50%] flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg leading-none">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {/* Strength Meter */}
                <div className="pt-1 px-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">
                      Strength: {passwordStrength < 2 ? 'Weak' : passwordStrength < 4 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  {formData.password.length > 0 && (
                <div className="flex space-x-1 mt-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} className={`h-1 flex-1 rounded-full ${passwordStrength >= level ? (passwordStrength < 2 ? 'bg-red-500' : passwordStrength < 4 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-white/10'}`}></div>
                  ))}
                </div>
              )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest px-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={formData.confirm}
                  onChange={(e) => setFormData({...formData, confirm: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm" 
                  placeholder="••••••••" required />
              </div>

              <div className="flex items-start gap-2 py-1.5">
                <div className="flex items-center h-4">
                  <input id="terms" type="checkbox" className="w-3 h-3 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0" />
                </div>
                <label htmlFor="terms" className="text-xs text-slate-400 leading-tight">
                  I agree to the <a href="#" className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/30">Terms of Service</a> and <a href="#" className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/30">Privacy Policy</a>
                </label>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs uppercase tracking-widest mt-2">
                {isLoading ? "Creating..." : "Create Account"}
              </button>

              {/* Google OAuth */}
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="px-2 bg-transparent text-slate-400 uppercase tracking-widest">Or Secure Login via</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-center opacity-90 transition-opacity hover:opacity-100 transform scale-90">
                    <GoogleLogin 
                      onSuccess={handleGoogleSuccess} 
                      onError={() => console.log('Login Failed')}
                      theme="filled_blue"
                      shape="pill"
                      text="signup_with"
                    />
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-slate-400 text-xs">
                  Already have an account? 
                  <Link href="/login" className="text-white font-semibold hover:text-indigo-400 transition-colors ml-1">Sign In.</Link>
                </p>
              </div>
            </form>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}
