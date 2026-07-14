"use client";

/**
 * TierProvider — provides subscription tier and usage data to the entire app.
 * 
 * NOTE: This is a UI convenience. All real enforcement is on the backend.
 * Users cannot manipulate their tier by tampering with this context —
 * every premium API call re-verifies the tier server-side via auth_service.
 */
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import Cookies from "js-cookie";
import { AUTH_BASE, API_BASE } from "@/lib/config";
import type { Tier, TierStatus, UsageStatus } from "@/lib/tier";

interface TierContextValue {
  tier: Tier;
  tierStatus: TierStatus | null;
  usageStatus: UsageStatus | null;
  isLoading: boolean;
  refresh: () => void;
}

const TierContext = createContext<TierContextValue>({
  tier: "free",
  tierStatus: null,
  usageStatus: null,
  isLoading: false,
  refresh: () => {},
});

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>("free");
  const [tierStatus, setTierStatus] = useState<TierStatus | null>(null);
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTierData = useCallback(async () => {
    const token = Cookies.get("access_token");
    if (!token) {
      setTier("free");
      setTierStatus(null);
      setUsageStatus(null);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch tier status from auth_service
      const tierRes = await fetch(`${AUTH_BASE}/subscription/tier`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (tierRes.ok) {
        const data: TierStatus = await tierRes.json();
        setTierStatus(data);
        setTier((data.is_active ? data.tier : "free") as Tier);

        // Fetch usage status from content_service (which proxies to tracking_service)
        const usageRes = await fetch(`${API_BASE}/usage/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usageRes.ok) {
          const usageData: UsageStatus = await usageRes.json();
          setUsageStatus(usageData);
        }
      }
    } catch (err) {
      console.error("TierProvider: failed to fetch tier data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTierData();
    // Refresh every 5 minutes in case of subscription change
    const interval = setInterval(fetchTierData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTierData]);

  return (
    <TierContext.Provider value={{ tier, tierStatus, usageStatus, isLoading, refresh: fetchTierData }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier(): TierContextValue {
  return useContext(TierContext);
}
