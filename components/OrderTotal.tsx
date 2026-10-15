"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RECOMMENDATION_DISCOUNT } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import type { CartLine } from "./CartProvider";

// The order total. With more than one piece, a "?" button opens the price
// breakdown just above it.
export function OrderTotal({
  lines,
  subtotal,
  discount,
  total,
}: {
  lines: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const showBreakdown = lines.length > 1;

  return (
    <div ref={wrapper} className="relative">
      {showBreakdown && open && (
        <div
          id={panelId}
          role="region"
          aria-label="Price breakdown"
          className="absolute bottom-full left-0 right-0 mb-3 rounded-lg border border-petal bg-white p-4 text-sm shadow-lg"
        >
          <ul className="space-y-1.5">
            {lines.map(({ product, size }) => (
              <li key={product.id} className="flex justify-between gap-4">
                <span>
                  {product.name} <span className="text-rose">· {size}</span>
                </span>
                <span>{formatPrice(product.price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-petal pt-3">
            <div className="flex justify-between text-rose">
              <dt>Items</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sage-deep">
                <dt>{RECOMMENDATION_DISCOUNT}% off your order</dt>
                <dd>−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xl font-medium">
          Total
          {showBreakdown && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={panelId}
              aria-label="Show price breakdown"
              className="flex size-5 cursor-pointer items-center justify-center rounded-full border border-rose text-xs font-medium text-rose transition-colors hover:border-cherry hover:text-cherry"
            >
              ?
            </button>
          )}
        </div>
        <p className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
          {discount > 0 && (
            <>
              <span className="rounded-sm bg-wine px-1.5 py-0.5 text-xs font-medium text-white">
                -{RECOMMENDATION_DISCOUNT}%
              </span>
              <s className="text-rose">{formatPrice(subtotal)}</s>
            </>
          )}
          <span className="text-xl font-medium">{formatPrice(total)}</span>
        </p>
      </div>
    </div>
  );
}
