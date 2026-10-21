import { CUSTOMER_LABELS, type OrderStatus } from "@/lib/order-status";

const STYLES: Record<OrderStatus, string> = {
  placed: "bg-blush text-cherry",
  confirmed: "bg-petal text-wine",
  shipped: "bg-[#e6ecdf] text-sage-deep",
  in_transit: "bg-sage text-sage-deep",
  delivered: "bg-sage-deep text-white",
  cancelled: "bg-shell text-rose ring-1 ring-petal",
};

// `labels` lets the admin panel call a placed order "New".
export function StatusPill({
  status,
  labels = CUSTOMER_LABELS,
}: {
  status: OrderStatus;
  labels?: Record<OrderStatus, string>;
}) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${STYLES[status]}`}
    >
      {labels[status]}
    </span>
  );
}
