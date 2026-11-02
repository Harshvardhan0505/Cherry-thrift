"use client";

import { useRef } from "react";
import { prefersStill } from "@/lib/motion";

// Lifts a card and tilts it slightly towards the mouse, like picking up a
// polaroid. Mouse only: touch screens have no hover.
export function HoverLift({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || disabled || event.pointerType !== "mouse" || prefersStill()) return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-6px)`;
    el.dataset.lifted = "true";
  };

  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    delete el.dataset.lifted;
  };

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className="hover-lift">
      {children}
    </div>
  );
}
