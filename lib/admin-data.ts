import "server-only";
import { RANGES, type Range } from "./admin-ranges";
import type { SavedAddress } from "./auth";
import { isOrderStatus, ORDER_STATUSES, type OrderStatus } from "./order-status";
import type { OrderItem } from "./orders";
import { supabase } from "./supabase";

// Filters for the orders list, as they appear in the URL.
export type OrderFilters = {
  status: OrderStatus;
  q: string;
  range: Range;
  unpaid: boolean;
};


export function parseFilters(params: Record<string, string | string[] | undefined>): OrderFilters {
  const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const range = one("range");
  return {
    status: isOrderStatus(one("status")) ? (one("status") as OrderStatus) : "placed",
    q: one("q").slice(0, 80),
    range: range in RANGES ? (range as OrderFilters["range"]) : "all",
    unpaid: one("unpaid") === "1",
  };
}

// Midnight in India, so "today" means the shop's today.
function since(range: OrderFilters["range"]): string | null {
  if (range === "all") return null;
  const IST = 5.5 * 60 * 60 * 1000;
  const day = 24 * 60 * 60 * 1000;
  const midnight = Math.floor((Date.now() + IST) / day) * day - IST;
  const days = range === "today" ? 0 : range === "week" ? 6 : 29;
  return new Date(midnight - days * day).toISOString();
}

// Applies search, date and payment filters (not status) to an orders query.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filtered<Q extends { or: any; eq: any; ilike: any; gte: any }>(query: Q, filters: OrderFilters): Q {
  let q = query;
  // Letters, digits and a few symbols only, so the search can't break the query.
  const term = filters.q.replace(/[^\p{L}\p{N} @.+-]/gu, "").trim();
  if (term) {
    const digits = term.replace(/\D/g, "");
    if (/^#?\d{1,6}$/.test(term.replace(/\s/g, ""))) q = q.eq("number", Number(digits));
    else if (digits.length >= 6 && digits.length === term.replace(/[\s+-]/g, "").length) q = q.ilike("phone", `%${digits.slice(-10)}%`);
    // Quoted, so dots in an email can't be read as part of the filter.
    else q = q.or(`first_name.ilike."%${term}%",last_name.ilike."%${term}%",email.ilike."%${term}%"`);
  }
  const from = since(filters.range);
  if (from) q = q.gte("created_at", from);
  if (filters.unpaid) q = q.eq("paid", false);
  return q;
}

export async function statusCounts(filters: OrderFilters): Promise<Record<OrderStatus, number>> {
  const { data, error } = await filtered(supabase().from("orders").select("status"), filters);
  if (error) throw error;
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<OrderStatus, number>;
  for (const row of data as { status: OrderStatus }[]) counts[row.status] += 1;
  return counts;
}

export type AdminOrderRow = {
  id: string;
  number: number;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paid: boolean;
  name: string;
};

export async function listOrders(filters: OrderFilters): Promise<AdminOrderRow[]> {
  const { data, error } = await filtered(
    supabase()
      .from("orders")
      .select("id, number, created_at, status, items, total, paid, first_name, last_name")
      .eq("status", filters.status),
    filters,
  )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    number: row.number,
    createdAt: row.created_at,
    status: row.status,
    items: row.items,
    total: row.total,
    paid: row.paid,
    name: [row.first_name, row.last_name].filter(Boolean).join(" "),
  }));
}

export type OrderEvent = { id: number; message: string; staffName: string | null; createdAt: string };

export type AdminOrder = AdminOrderRow & {
  subtotal: number;
  discount: number;
  phone: string;
  email: string | null;
  address: Omit<SavedAddress, "firstName" | "lastName">;
  courier: string | null;
  trackingNumber: string | null;
  notes: string | null;
  events: OrderEvent[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  if (!UUID.test(id)) return null;
  const db = supabase();
  const [{ data: row, error }, { data: events, error: eventsError }] = await Promise.all([
    db.from("orders").select("*").eq("id", id).maybeSingle(),
    db.from("order_events").select("id, message, staff_name, created_at").eq("order_id", id).order("created_at"),
  ]);
  if (error) throw error;
  if (eventsError) throw eventsError;
  if (!row) return null;
  return {
    id: row.id,
    number: row.number,
    createdAt: row.created_at,
    status: row.status,
    items: row.items,
    total: row.total,
    subtotal: row.subtotal,
    discount: row.discount,
    paid: row.paid,
    name: [row.first_name, row.last_name].filter(Boolean).join(" "),
    phone: row.phone,
    email: row.email,
    address: {
      address: row.address,
      apartment: row.apartment ?? "",
      pin: row.pin,
      city: row.city,
      state: row.state,
    },
    courier: row.courier,
    trackingNumber: row.tracking_number,
    notes: row.notes,
    events: events.map((event) => ({
      id: event.id,
      message: event.message,
      staffName: event.staff_name,
      createdAt: event.created_at,
    })),
  };
}

export type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  joined: string;
  orders: number;
  // Rupees across orders that weren't cancelled.
  spent: number;
};

export async function listCustomers(search: string): Promise<AdminCustomer[]> {
  const db = supabase();
  let query = db.from("customers").select("id, name, phone, email, created_at").order("created_at", { ascending: false }).limit(300);
  const term = search.replace(/[^\p{L}\p{N} @.+-]/gu, "").trim();
  if (term) {
    const digits = term.replace(/\D/g, "");
    query =
      digits.length >= 4 && digits.length === term.replace(/[\s+-]/g, "").length
        ? query.ilike("phone", `%${digits.slice(-10)}%`)
        : query.or(`name.ilike."%${term}%",email.ilike."%${term}%"`);
  }
  const { data: customers, error } = await query;
  if (error) throw error;
  if (customers.length === 0) return [];

  const { data: orders, error: ordersError } = await db
    .from("orders")
    .select("customer_id, total, status")
    .in(
      "customer_id",
      customers.map((customer) => customer.id),
    );
  if (ordersError) throw ordersError;
  const totals = new Map<string, { orders: number; spent: number }>();
  for (const order of orders) {
    const entry = totals.get(order.customer_id) ?? { orders: 0, spent: 0 };
    entry.orders += 1;
    if (order.status !== "cancelled") entry.spent += order.total;
    totals.set(order.customer_id, entry);
  }
  return customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    joined: customer.created_at,
    ...(totals.get(customer.id) ?? { orders: 0, spent: 0 }),
  }));
}

export type TeamMember = { id: string; name: string; email: string; role: "owner" | "helper"; joined: string };

export async function listTeam(): Promise<TeamMember[]> {
  const { data, error } = await supabase().from("staff").select("id, name, email, role, created_at").order("created_at");
  if (error) throw error;
  return data.map((member) => ({ ...member, joined: member.created_at }));
}

export async function countNewOrders(): Promise<number> {
  const { count, error } = await supabase()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "placed");
  if (error) throw error;
  return count ?? 0;
}
