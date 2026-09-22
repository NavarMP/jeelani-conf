"use client";

import { useState, useEffect, useRef } from "react";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEventDay: boolean;
  isEventOver: boolean;
  totalSeconds: number;
}

/**
 * useCountdown — Live countdown hook that ticks every second.
 * Uses setInterval for ticking + drift correction.
 */
export function useCountdown(targetDate: string): CountdownResult {
  const [now, setNow] = useState(() => Date.now());
  const targetMs = useRef(new Date(targetDate).getTime());

  useEffect(() => {
    targetMs.current = new Date(targetDate).getTime();
  }, [targetDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = targetMs.current - now;
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));

  if (diff <= 0) {
    // Check if event day (within 24 hours after start)
    const hoursPast = Math.abs(diff) / (1000 * 60 * 60);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEventDay: hoursPast < 24,
      isEventOver: hoursPast >= 24,
      totalSeconds: 0,
    };
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isEventDay: false,
    isEventOver: false,
    totalSeconds,
  };
}
