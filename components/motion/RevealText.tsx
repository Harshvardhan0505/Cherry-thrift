"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { prefersStill } from "@/lib/motion";

// A heading whose words slide up from behind an invisible line as it scrolls
// into view. Screen readers get the plain text; the split words are for show.
export function RevealText({
  as: Tag = "h2",
  text,
  id,
  className,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  text: string;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersStill()) return;
    // Already on screen when the page opens: leave it be rather than flash.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    gsap.registerPlugin(ScrollTrigger);
    const words = el.querySelectorAll("[data-word]");
    gsap.set(words, { yPercent: 115 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(words, { yPercent: 0, duration: 0.85, stagger: 0.08, ease: "power3.out" });
      },
    });
    return () => {
      trigger.kill();
      gsap.killTweensOf(words);
      gsap.set(words, { clearProps: "transform" });
    };
  }, []);

  return (
    <Tag ref={ref as React.Ref<never>} id={id} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, i) => (
          <span key={i}>
            {i > 0 && " "}
            {/* The mask: a little room below so descenders aren't clipped. */}
            <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
