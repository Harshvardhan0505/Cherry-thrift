"use client";

// A full-screen call to action uncovered like a curtain as the page scrolls
// to its end: the content sits fixed to the viewport, and the wrapper's
// clip-path only shows it while the wrapper is on screen. A giant outlined
// word drifts up behind, the heading and links rise in, and the pills lean
// towards the mouse.
//
// Adapted from a "cinematic footer" component for Cherry Thrifts: the shop's
// own copy and links, its fonts and colours instead of a Google font and
// shadcn's theme tokens, typed refs, and no motion for people who turn it off.

import * as React from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { prefersStill } from "@/lib/motion";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. SCOPED STYLES, in the shop's colours (cream page, wine ink, cherry and petal)
// -------------------------------------------------------------------------
const STYLES = `
.cinematic-footer-wrapper {
  --foreground: #4a1420;
  --background: #fbf3ef;
  --primary: #b5123e;
  --secondary: #f3c9d2;

  --pill-bg-1: color-mix(in oklch, white 70%, transparent);
  --pill-bg-2: color-mix(in oklch, white 35%, transparent);
  --pill-shadow: color-mix(in oklch, var(--foreground) 14%, transparent);
  --pill-highlight: color-mix(in oklch, white 90%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--foreground) 6%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 10%, transparent);

  --pill-bg-1-hover: color-mix(in oklch, white 95%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, white 60%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--primary) 35%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--primary) 22%, transparent);
  --pill-highlight-hover: white;
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); }
  15%, 45% { transform: scale(1.25); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  display: inline-block;
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* A faint grid, fading out at the top and bottom */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 4%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 4%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* A soft cherry and petal glow behind the heading */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary) 14%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 45%, transparent) 40%,
    transparent 70%
  );
}

/* Glass pills */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -12px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: background 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s, color 0.3s;
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -12px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--primary);
}

/* The giant outlined word in the background */
.footer-giant-bg-text {
  font-size: 30vw;
  line-height: 0.8;
  letter-spacing: -0.03em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--primary) 18%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 65%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* The heading, shaded from wine into cherry */
.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--primary) 85%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 24px color-mix(in oklch, var(--primary) 18%, transparent));
}

@media (prefers-reduced-motion: reduce) {
  .animate-footer-breathe,
  .animate-footer-scroll-marquee,
  .animate-footer-heartbeat {
    animation: none;
  }
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = {
  as?: "a" | "button" | typeof Link;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

// Leans towards the mouse and springs back when it leaves.
function MagneticButton({ className, children, as: Component = "button", ...props }: MagneticButtonProps) {
  const localRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = localRef.current;
    if (!element || prefersStill()) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(element, {
        x: x * 0.4,
        y: y * 0.4,
        rotationX: -y * 0.15,
        rotationY: x * 0.15,
        scale: 1.05,
        ease: "power2.out",
        duration: 0.4,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        ease: "elastic.out(1, 0.3)",
        duration: 1.2,
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(element);
      gsap.set(element, { clearProps: "transform" });
    };
  }, []);

  const Tag = Component as React.ElementType;
  return (
    <Tag ref={localRef} className={cn("cursor-pointer", className)} {...props}>
      {children}
    </Tag>
  );
}

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const MARQUEE = ["One of each", "Hand-picked", "Pre-loved", "Thrifted, not basic", "Tops · Skirts · Purses"];

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    {MARQUEE.map((word, i) => (
      <React.Fragment key={word}>
        <span>{word}</span>
        <span className={i % 2 ? "text-petal" : "text-cherry/60"}>✦</span>
      </React.Fragment>
    ))}
  </div>
);

export type CinematicFooterProps = {
  /** The giant outlined word in the background. */
  word: string;
  heading: string;
  /** Big pills, e.g. the shop's categories. */
  primary: { label: string; href: string }[];
  /** Smaller pills; `external` opens in a new tab. */
  secondary: { label: string; href: string; external?: boolean; icon?: React.ReactNode }[];
  /** Left of the bottom bar. */
  note: string;
  /** The name in the "with ♥ by" badge. */
  by: string;
};

export function CinematicFooter({ word, heading, primary, secondary, note, by }: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || prefersStill()) return;

    // React strict mode compatible GSAP context cleanup
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersStill() ? "auto" : "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/*
        The "Curtain Reveal" Wrapper:
        It sits in standard flow. Because it has clip-path, its contents
        are ONLY visible within its bounding box.
      */}
      <div
        ref={wrapperRef}
        className="relative h-svh w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {/* The actual content stays fixed to the viewport underneath everything */}
        <section
          aria-labelledby="cinematic-heading"
          className="cinematic-footer-wrapper fixed bottom-0 left-0 flex h-svh w-full flex-col justify-between overflow-hidden bg-cream text-wine"
        >
          {/* Ambient Light & Grid Background */}
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

          {/* Giant background word */}
          <div
            ref={giantTextRef}
            aria-hidden="true"
            className="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 whitespace-nowrap font-serif select-none"
          >
            {word}
          </div>

          {/* 1. Diagonal Sleek Marquee (Top) */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-12 z-10 w-full -rotate-2 scale-110 overflow-hidden border-y border-petal bg-white/60 py-4 shadow-[0_18px_40px_-20px_rgb(74_20_32/0.3)] backdrop-blur-md"
          >
            <div className="flex w-max animate-footer-scroll-marquee text-xs font-semibold uppercase tracking-[0.3em] text-rose md:text-sm">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2
              id="cinematic-heading"
              ref={headingRef}
              className="footer-text-glow mb-12 pb-2 text-center font-serif text-6xl leading-none tracking-tight md:text-9xl"
            >
              {heading}
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-wrap justify-center gap-4">
                {primary.map((link) => (
                  <MagneticButton
                    key={link.href}
                    as={Link}
                    href={link.href}
                    className="footer-glass-pill group flex items-center gap-3 rounded-full px-9 py-4 text-sm font-medium text-wine md:px-10 md:py-5 md:text-base"
                  >
                    {link.label}
                    <span aria-hidden="true" className="text-cherry transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </MagneticButton>
                ))}
              </div>

              <div className="mt-2 flex w-full flex-wrap justify-center gap-3 md:gap-6">
                {secondary.map((link) => (
                  <MagneticButton
                    key={link.href}
                    as={link.external || link.href.startsWith("mailto:") ? "a" : Link}
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="footer-glass-pill flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium text-rose md:text-sm"
                  >
                    {link.icon}
                    {link.label}
                  </MagneticButton>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar */}
          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-rose md:order-1 md:text-xs">
              {note}
            </div>

            {/* "With love" badge */}
            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full px-6 py-3 md:order-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-rose md:text-xs">Picked with</span>
              <span aria-label="love" className="animate-footer-heartbeat text-sm text-cherry md:text-base">♥</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-rose md:text-xs">by</span>
              <span className="ml-1 font-serif text-sm text-wine md:text-base">{by}</span>
            </div>

            {/* Back to top */}
            <MagneticButton
              as="button"
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="footer-glass-pill group order-3 flex size-12 items-center justify-center rounded-full text-rose"
            >
              <svg className="size-5 transition-transform duration-300 group-hover:-translate-y-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </section>
      </div>
    </>
  );
}
