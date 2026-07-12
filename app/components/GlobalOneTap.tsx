"use client";

import { useEffect, useState } from 'react';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/config';

// Reusing the AUTH_BASE logic from login page
const AUTH_BASE = "https://relaypost-backend.onrender.com"; // Adjust if necessary to match actual API_BASE

export default function GlobalOneTap() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Assume authenticated to avoid flashing the prompt

  useEffect(() => {
    // Check if token exists
    const token = Cookies.get('access_token');
    if (!token) {
      setIsAuthenticated(false);
    }
  }, []);

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      const toastId = toast.loading("Verifying secure login...");
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
          toast.success("Successfully authenticated with Google", { id: toastId });
          
          if (data.is_new_user) {
            window.location.href = '/?onboarding=true';
          } else {
            // Update auth state instantly without full page reload
            window.dispatchEvent(new Event('auth-change'));
            router.refresh();
          }
        } else {
          toast.error("Authentication failed", { id: toastId });
        }
      } catch (err: any) {
        console.error("Google One Tap auth failed", err);
        toast.error("Network error. Please try again.", { id: toastId });
      }
    },
    onError: () => {
      console.log('Google One Tap Login Failed');
    },
    // Only trigger if not authenticated
    disabled: isAuthenticated,
  });

  return null; // This component doesn't render anything visibly on its own
}
