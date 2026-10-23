"use client";

import { useEffect } from "react";

// Shows each `[data-reveal]` element on the page the first time it scrolls
// into view (the animation is in globals.css). Renders nothing itself.
export function RevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll("[data-reveal]:not([data-shown])").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
