"use client";

import { useRef } from "react";

// Tilts its contents in 3D towards a mouse pointer, up to `max` degrees, with
// a soft light following it (styles in globals.css). Touch is left alone, so
// it never fights scrolling.
export function Tilt({
  max = 8,
  glare = false,
  className = "",
  children,
}: {
  max?: number;
  glare?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function move(event: React.PointerEvent) {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    el.dataset.tilting = "";
    el.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  }

  function leave() {
    const el = ref.current;
    if (!el) return;
    delete el.dataset.tilting;
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  }

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt ${className}`}>
      {children}
      {glare && <span aria-hidden="true" className="tilt-glare" />}
    </div>
  );
}
