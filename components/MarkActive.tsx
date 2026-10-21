"use client";

import { useEffect } from "react";

// When this browser was last used while signed in, so the log in page can
// greet shoppers coming back after a long break with "Welcome back."
export const LAST_ACTIVE_KEY = "cherry-thrifts-last-active";

export function MarkActive() {
  useEffect(() => {
    try {
      window.localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    } catch {
      // Storage can be unavailable (private windows); the greeting is just a nicety.
    }
  }, []);
  return null;
}
