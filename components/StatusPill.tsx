import type { OrderStatus } from "@/lib/orders";

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  placed: { label: "Placed", className: "bg-blush text-cherry" },
  confirmed: { label: "Confirmed", className: "bg-petal text-wine" },
  shipped: { label: "Shipped", className: "bg-sage text-sage-deep" },
  delivered: { label: "Delivered", className: "bg-sage-deep text-white" },
  cancelled: { label: "Cancelled", className: "bg-shell text-rose ring-1 ring-petal" },
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const { label, className } = STYLES[status];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}
