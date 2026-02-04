import { useState, useEffect, useCallback } from "react";

const COOLDOWN_KEY = "mood_analyzer_cooldown";
const USAGE_KEY = "mood_analyzer_usage";
const COOLDOWN_DURATION = 30; // seconds between requests
const MAX_REQUESTS_PER_HOUR = 10;
const HOUR_IN_MS = 60 * 60 * 1000;

interface UsageData {
  timestamps: number[];
}

export function useCooldown() {
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [usageCount, setUsageCount] = useState(0);
  const [hourlyLimitReached, setHourlyLimitReached] = useState(false);

  // Clean up old timestamps and get current usage
  const getUsageData = useCallback((): UsageData => {
    try {
      const stored = localStorage.getItem(USAGE_KEY);
      if (!stored) return { timestamps: [] };
      
      const data: UsageData = JSON.parse(stored);
      const now = Date.now();
      
      // Filter out timestamps older than 1 hour
      data.timestamps = data.timestamps.filter(ts => now - ts < HOUR_IN_MS);
      
      return data;
    } catch {
      return { timestamps: [] };
    }
  }, []);

  // Check and update cooldown state
  const updateCooldownState = useCallback(() => {
    const stored = localStorage.getItem(COOLDOWN_KEY);
    if (stored) {
      const cooldownEnd = parseInt(stored, 10);
      const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setCooldownRemaining(remaining);
      
      if (remaining <= 0) {
        localStorage.removeItem(COOLDOWN_KEY);
      }
    } else {
      setCooldownRemaining(0);
    }

    // Check hourly usage
    const usageData = getUsageData();
    setUsageCount(usageData.timestamps.length);
    setHourlyLimitReached(usageData.timestamps.length >= MAX_REQUESTS_PER_HOUR);
  }, [getUsageData]);

  // Start cooldown and record usage
  const startCooldown = useCallback(() => {
    const cooldownEnd = Date.now() + COOLDOWN_DURATION * 1000;
    localStorage.setItem(COOLDOWN_KEY, cooldownEnd.toString());
    setCooldownRemaining(COOLDOWN_DURATION);

    // Record this usage
    const usageData = getUsageData();
    usageData.timestamps.push(Date.now());
    localStorage.setItem(USAGE_KEY, JSON.stringify(usageData));
    setUsageCount(usageData.timestamps.length);
    setHourlyLimitReached(usageData.timestamps.length >= MAX_REQUESTS_PER_HOUR);
  }, [getUsageData]);

  // Timer effect
  useEffect(() => {
    updateCooldownState();

    const interval = setInterval(() => {
      updateCooldownState();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateCooldownState]);

  const canAnalyze = cooldownRemaining === 0 && !hourlyLimitReached;
  const requestsRemaining = Math.max(0, MAX_REQUESTS_PER_HOUR - usageCount);

  return {
    cooldownRemaining,
    usageCount,
    hourlyLimitReached,
    canAnalyze,
    requestsRemaining,
    startCooldown,
    maxRequestsPerHour: MAX_REQUESTS_PER_HOUR,
  };
}
