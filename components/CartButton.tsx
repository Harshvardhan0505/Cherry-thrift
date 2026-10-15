"use client";

import { useCart } from "./CartProvider";

// `className` sets the icon colour for the header it sits in.
export function CartButton({ className = "text-cherry hover:text-wine" }: { className?: string }) {
  const { lines, open } = useCart();
  const count = lines.length;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={count === 0 ? "Open cart, empty" : `Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      className={`relative cursor-pointer transition-colors ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        aria-hidden="true"
      >
        <path d="M5 8h14l-1 12H6L5 8Z" strokeLinejoin="round" />
        <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-cherry text-xs font-medium text-white">
          {count}
        </span>
      )}
    </button>
  );
}
