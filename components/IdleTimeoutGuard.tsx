"use client";

import { useCallback, useEffect, useRef } from "react";
import { logout } from "@/app/(auth)/login/auth/actions";

const TIMEOUT_MS = (Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES) || 15) * 60 * 1000;
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

export default function IdleTimeoutGuard() {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const reset = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => logout(), TIMEOUT_MS);
  }, []);

  useEffect(() => {
    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset));
    return () => {
      clearTimeout(timer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset]);

  return null;
}
