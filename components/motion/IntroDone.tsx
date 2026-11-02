"use client";

import { useEffect } from "react";
import { INTRO_KEY, INTRO_MS } from "@/lib/motion";

// Remembers that the intro has played in this tab. A little after it has
// finished (and the opening line has risen in), the class also hides it if
// the shopper comes back to the home page later.
export function IntroDone() {
  useEffect(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // Private mode or storage blocked: it'll just play again next load.
    }
    const timer = setTimeout(() => document.documentElement.classList.add("intro-done"), INTRO_MS + 1500);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
