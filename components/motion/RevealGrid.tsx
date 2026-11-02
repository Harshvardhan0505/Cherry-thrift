"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { prefersStill } from "@/lib/motion";

// A grid whose `[data-reveal]` items rise in one after another as they scroll
// into view, each photo uncovered by a `[data-curtain]` panel wiping upwards.
// Items already on screen when the page opens are left alone, so nothing
// flashes. When `replayKey` changes (a new category), the new items fade and
// drift up instead.
export function RevealGrid({
  children,
  className,
  replayKey,
}: {
  children: React.ReactNode;
  className?: string;
  replayKey?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shownKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    const grid = ref.current;
    if (!grid || prefersStill()) return;
    gsap.registerPlugin(ScrollTrigger);
    const items = Array.from(grid.querySelectorAll<HTMLElement>("[data-reveal]"));
    const curtainsOf = (list: Element[]) =>
      list.flatMap((item) => Array.from(item.querySelectorAll<HTMLElement>("[data-curtain]")));

    // A new category: the cards are already in view, so just fade them in.
    if (shownKey.current !== undefined && shownKey.current !== replayKey) {
      shownKey.current = replayKey;
      const tween = gsap.fromTo(
        items,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out", clearProps: "opacity,transform" },
      );
      return () => {
        tween.kill();
      };
    }
    shownKey.current = replayKey;

    const below = items.filter((item) => item.getBoundingClientRect().top > window.innerHeight * 0.92);
    if (below.length === 0) return;
    const curtains = curtainsOf(below);
    gsap.set(below, { opacity: 0, y: 44 });
    gsap.set(curtains, { scaleY: 1 });

    const triggers = ScrollTrigger.batch(below, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "opacity,transform",
        });
        gsap.to(curtainsOf(batch), { scaleY: 0, duration: 0.95, stagger: 0.1, delay: 0.12, ease: "power3.inOut" });
      },
    });
    return () => {
      triggers.forEach((trigger) => trigger.kill());
      gsap.killTweensOf([...below, ...curtains]);
      gsap.set(below, { clearProps: "opacity,transform" });
      gsap.set(curtains, { clearProps: "transform" });
    };
  }, [replayKey]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
