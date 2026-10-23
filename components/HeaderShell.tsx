"use client";

import { useEffect, useRef, useState } from "react";
import { useLiquidGlass } from "./effects/liquid-glass/useLiquidGlass";

// Where the header counts as sitting over the dark hero: while the hero's
// bottom edge is below this many pixels from the top of the window.
const DARK_UNTIL = 80;

// The header's outer element and its bar. Once the page scrolls, the bar
// lifts off into a compact floating pill of liquid glass (see .site-header in
// globals.css). `overlay` starts it clear over the home page's hero photo,
// which is marked `data-header-dark` so the header knows when it's over it.
export function HeaderShell({ overlay, children }: { overlay: boolean; children: React.ReactNode }) {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(overlay);
  const glassRef = useLiquidGlass<HTMLDivElement>({
    scale: -42,
    chroma: 3,
    border: 0.24,
    mapBlur: 6,
    blur: 8,
    saturate: 1.6,
  });

  useEffect(() => {
    const header = headerRef.current!;
    const hero = overlay ? document.querySelector("[data-header-dark]") : null;
    // The pill is shorter than the bar. Hold the header at the bar's full
    // height (measured while it's still the bar) so the page doesn't move.
    const holdHeight = () => {
      if (header.dataset.scrolled === undefined) header.style.minHeight = `${header.offsetHeight}px`;
    };
    const update = () => {
      setScrolled(window.scrollY > 24);
      setOnDark(hero !== null && hero.getBoundingClientRect().bottom > DARK_UNTIL);
    };
    // Re-measure on resize, unless the pill is showing (keep the last bar height).
    const resize = () => {
      if (header.dataset.scrolled === undefined) {
        header.style.minHeight = "";
        holdHeight();
      }
      update();
    };
    holdHeight();
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", resize);
    };
  }, [overlay]);

  return (
    <header
      ref={headerRef}
      data-overlay={overlay || undefined}
      data-scrolled={scrolled || undefined}
      data-on-dark={onDark || undefined}
      className="site-header"
    >
      {/* The glass only refracts while it floats as a pill. */}
      <div ref={scrolled ? glassRef : undefined} className="site-header__bar">
        {children}
      </div>
    </header>
  );
}
