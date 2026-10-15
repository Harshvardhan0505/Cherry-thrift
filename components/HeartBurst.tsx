"use client";

import { useEffect, useRef } from "react";
import { HeartIcon } from "./HeartIcon";

// Two or three little hearts float up off a piece, then a sparkle. The piece
// is scrolled into view first so the hearts are seen.
export function HeartBurst() {
  const burst = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    burst.current?.parentElement?.scrollIntoView({
      block: "nearest",
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  return (
    <div ref={burst} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
      <HeartIcon filled className="heart-float absolute bottom-1/3 left-[34%] size-10 text-cherry [--dx:-30px] [--rot:-14deg]" />
      <HeartIcon filled className="heart-float absolute bottom-[40%] left-[52%] size-8 text-[#e98aa0] [--dx:6px] [--rot:8deg] [animation-delay:90ms]" />
      <HeartIcon filled className="heart-float absolute bottom-[30%] left-[68%] size-7 text-cherry/80 [--dx:32px] [--rot:16deg] [animation-delay:170ms]" />
      <svg viewBox="0 0 24 24" className="sparkle absolute left-[30%] top-10 size-7 text-[#e9b949]">
        <path fill="currentColor" d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8Z" />
      </svg>
      <svg viewBox="0 0 24 24" className="sparkle absolute right-[18%] top-16 size-6 text-[#e9b949] [animation-delay:620ms]">
        <path fill="currentColor" d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8Z" />
      </svg>
    </div>
  );
}
