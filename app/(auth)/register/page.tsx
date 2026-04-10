"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import NetworkBackground from '../../components/NetworkBackground';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_BASE || "http://localhost:8000";

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Mouse tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
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
    
    setIsLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/auth/register`, {
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
      
      const loginRes = await fetch(`${AUTH_BASE}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: formData.email, password: formData.password })
      });
      
      if (loginRes.ok) {
        const tokenData = await loginRes.json();
        Cookies.set('access_token', tokenData.access_token, { expires: 7, secure: true, sameSite: 'strict' });
        localStorage.setItem('auth_token', tokenData.access_token);
        toast.success("Welcome! Your access is initialized.");
        setTimeout(() => window.location.href = "/", 1000);
      } else {
        toast.success("Identity created. Proceeding to login...");
        setTimeout(() => window.location.href = "/login", 1200);
      }
    } catch (err: any) {
      toast.error(err.message || "Registration protocol failed");
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
            toast.success("Biometric Sync successful via Google");
            setTimeout(() => window.location.href = "/", 1000);
        } else {
            toast.error(data.detail || "Google Link failed");
        }
      } catch (err: any) {
          toast.error("Network error: Host unreachable.");
      }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "mock-client-id"}>
      <div className="bg-deep-sea min-h-screen flex flex-col relative overflow-hidden font-sans">
        <Navbar />
        
        {/* Background Design Elements */}
        <NetworkBackground />
        <div className="glow-orb top-10 right-10 animate-float" />
        <div className="glow-orb bottom-10 left-10 animate-float" style={{ animationDelay: '3s' }} />
        
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 w-full flex-grow flex items-center justify-center p-6 md:py-16 relative"
        >
          <div className="w-full max-w-[480px] relative">
            <motion.div 
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="glass-panel rounded-[2.5rem] p-8 md:p-12 transition-all duration-300 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
            >
              {/* Header Content */}
              <div className="flex flex-col items-center mb-10" style={{ transform: "translateZ(60px)" }}>
                <h1 className="text-white text-2xl font-bold tracking-tight text-center">New Operator Registration</h1>
                <p className="text-slate-400 text-sm mt-3 font-medium opacity-80 text-center">Establish your credentials to access the global feed.</p>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-4" style={{ transform: "translateZ(40px)" }}>
                {/* Form Input Groups */}
                {[
                  { label: 'Full Identity', type: 'text', icon: 'person', value: formData.name, field: 'name', placeholder: 'Alex Rivera' },
                  { label: 'Network Email', type: 'email', icon: 'alternate_email', value: formData.email, field: 'email', placeholder: 'name@server.com' },
                ].map((input, idx) => (
                  <motion.div 
                    key={input.field}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="space-y-1.5"
                  >
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{input.label}</label>
                    <div className="relative group/input">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined text-lg group-focus-within/input:text-primary transition-colors">
                        {input.icon}
                      </span>
                      <input 
                        type={input.type} 
                        value={input.value}
                        onChange={(e) => setFormData({...formData, [input.field]: e.target.value})}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all text-sm backdrop-blur-md" 
                        placeholder={input.placeholder} required 
                      />
                    </div>
                  </motion.div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password Fields */}
                  {[
                    { label: 'Password', type: showPassword ? 'text' : 'password', field: 'password' },
                    { label: 'Confirm', type: 'password', field: 'confirm' }
                  ].map((input, idx) => (
                    <motion.div 
                      key={input.field}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{input.label}</label>
                      <div className="relative">
                        <input 
                          type={input.type} 
                          value={formData[input.field as keyof typeof formData]}
                          onChange={(e) => {
                            setFormData({...formData, [input.field]: e.target.value});
                            if(input.field === 'password') calculatePasswordStrength(e.target.value);
                          }}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all text-sm" 
                          placeholder="••••••••" required 
                        />
                        {input.field === 'password' && (
                          <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Strength Meter */}
                {formData.password.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Security Level</span>
                      <span className={`text-[9px] uppercase font-black ${passwordStrength < 2 ? 'text-red-400' : passwordStrength < 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {passwordStrength < 2 ? 'Vulnerable' : passwordStrength < 4 ? 'Standard' : 'Encrypted'}
                      </span>
                    </div>
                    <div className="flex space-x-1.5 h-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className={`h-full flex-1 rounded-full transition-all duration-500 ${passwordStrength >= level ? (passwordStrength < 3 ? 'bg-red-500/60' : passwordStrength < 5 ? 'bg-amber-500/60' : 'bg-emerald-500/60') : 'bg-white/5'}`}></div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex items-start gap-3 py-2 px-1">
                  <div className="relative flex items-center justify-center mt-0.5">
                      <input id="terms" type="checkbox" className="peer appearance-none w-4 h-4 rounded border border-white/20 bg-white/5 checked:bg-primary checked:border-primary transition-all duration-300" />
                      <span className="absolute text-white scale-0 peer-checked:scale-100 transition-transform material-symbols-outlined text-[10px]">check</span>
                  </div>
                  <label htmlFor="terms" className="text-[10px] text-slate-400 leading-normal select-none">
                    By clicking, I authorize the processing of my digital persona according to the <a href="#" className="text-white hover:text-primary underline transition-colors">Protocol Terms</a>.
                  </label>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isLoading} 
                  className="group relative w-full py-4 bg-primary text-white font-black rounded-2xl shadow-[0_10px_20px_rgba(78,96,255,0.3)] hover:shadow-[0_20px_40px_rgba(78,96,255,0.5)] overflow-hidden transition-all duration-500"
                >
                  <span className="relative z-10 text-xs uppercase tracking-[0.2em]">{isLoading ? "Writing Record..." : "Confirm Protocol"}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </motion.button>

                <div className="pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]"></div></div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className="px-3 bg-[#0b0d1b] text-slate-600 font-bold uppercase tracking-[0.2em]">Universal Link</span>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-center">
                    <div className="p-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-500 group/google">
                      <GoogleLogin 
                          onSuccess={handleGoogleSuccess} 
                          onError={() => console.log('Link Failed')}
                          theme="filled_black"
                          shape="pill"
                          text="signup_with"
                        />
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8 pt-4 border-t border-white/[0.05]">
                  <p className="text-slate-500 text-xs font-medium">
                    Already registered? 
                    <Link href="/login" className="text-white hover:text-primary font-bold transition-all ml-2 border-b border-white/20 hover:border-primary pb-0.5">Proceed to Entry.</Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.main>
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}
