// Order statuses, shared by the shop and the admin panel. An order moves
// placed → confirmed → shipped → in transit → delivered, or is cancelled.
export const ORDER_STATUSES = ["placed", "confirmed", "shipped", "in_transit", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const isOrderStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);

// What the customer sees.
export const CUSTOMER_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// What the team sees: a just-placed order is "New", a job to do.
export const ADMIN_LABELS: Record<OrderStatus, string> = { ...CUSTOMER_LABELS, placed: "New" };

// The progress steps, in order (cancelled is off to the side).
export const STEPS = ["placed", "confirmed", "shipped", "in_transit", "delivered"] as const;

// The admin panel's main button for each status.
export const NEXT_STEP: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  placed: { status: "confirmed", label: "Confirm order" },
  confirmed: { status: "shipped", label: "Mark shipped" },
  shipped: { status: "in_transit", label: "Mark in transit" },
  in_transit: { status: "delivered", label: "Mark delivered" },
};

// Couriers the shop uses, with the page where customers can track a parcel
// by pasting its tracking number. India Post comes first: it's the usual one.
export const DEFAULT_COURIER = "India Post";
export const COURIERS: Record<string, string | null> = {
  "India Post": "https://www.indiapost.gov.in/",
  Shiprocket: "https://shiprocket.in/shipment-tracking",
  Delhivery: "https://www.delhivery.com/",
  "Blue Dart": "https://www.bluedart.com/",
  DTDC: "https://www.dtdc.in/",
  Other: null,
};

// India Post (Speed Post) numbers are 2 letters, 9 digits and 2 letters, like
// EE123456789IN. Returns the tidied number, or null if it doesn't fit.
export function indiaPostNumber(value: string): string | null {
  const tidy = value.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(tidy) ? tidy : null;
}
