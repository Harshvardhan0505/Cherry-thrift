// Dates and links for the admin panel. Times are shown in India time,
// whatever the server's own clock is set to.
const ZONE = "Asia/Kolkata";

const dayKey = (date: Date) => date.toLocaleDateString("en-CA", { timeZone: ZONE });

export function dayLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (dayKey(date) === dayKey(now)) return "Today";
  if (dayKey(date) === dayKey(yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
    timeZone: ZONE,
  });
}

export const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: ZONE }).toLowerCase();

export const dateOf = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: ZONE });

// When something happened, e.g. "today, 10:42 am" or "Mon 20 Oct, 8:03 pm".
export function whenOf(iso: string): string {
  const day = dayLabel(iso);
  return `${day === "Today" || day === "Yesterday" ? day.toLowerCase() : day}, ${timeOf(iso)}`;
}

export type OrderQuery = {
  status: string;
  q: string;
  range: string;
  unpaid: boolean;
  order?: string | null;
};

// The orders page's address for some filters, leaving out the defaults.
export function ordersHref(current: OrderQuery, changes: Partial<OrderQuery> = {}): string {
  const next = { ...current, ...changes };
  const params = new URLSearchParams();
  if (next.status && next.status !== "placed") params.set("status", next.status);
  if (next.q) params.set("q", next.q);
  if (next.range && next.range !== "all") params.set("range", next.range);
  if (next.unpaid) params.set("unpaid", "1");
  if (next.order) params.set("order", next.order);
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}
