"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ORDER_HISTORY_COOKIE } from "@/lib/order-history";

// Fired after an order is placed, so the link appears without a reload.
export const ORDERS_CHANGED = "cherry-thrifts-orders-changed";

function subscribe(onChange: () => void) {
  window.addEventListener(ORDERS_CHANGED, onChange);
  return () => window.removeEventListener(ORDERS_CHANGED, onChange);
}

const hasOrders = () => document.cookie.split("; ").some((pair) => pair.startsWith(`${ORDER_HISTORY_COOKIE}=`));

// "Orders" in the header, once this browser has placed an order. Phones get
// a parcel icon instead, so the header stays on one line.
// `iconClass` colours the icon to match the header's other icons.
export function OrdersLink({ className, iconClass = "" }: { className?: string; iconClass?: string }) {
  const show = useSyncExternalStore(subscribe, hasOrders, () => false);
  if (!show) return null;
  return (
    <Link href="/orders" aria-label="Your orders" className={className}>
      <span aria-hidden="true" className="hidden sm:inline">
        Orders
      </span>
      <svg
        viewBox="0 0 24 24"
        className={`size-6 sm:hidden ${iconClass}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" />
        <path d="M4 8l8 4 8-4M12 12v8" />
      </svg>
    </Link>
  );
}
