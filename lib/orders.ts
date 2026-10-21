import "server-only";
import type { SavedAddress } from "./auth";
import { orderPrices, sanitize } from "./cart";
import { matchState } from "./india";
import { getProduct } from "./products";
import { supabase } from "./supabase";

export const ORDER_STATUSES = ["placed", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// A piece as it was when the order was placed, so later price or photo
// changes don't rewrite past orders.
export type OrderItem = { id: string; name: string; size: string; price: number; image: string };

// What the order page shows: the order, without the customer's details.
export type Order = {
  id: string;
  number: number;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One of the customer's orders; null if it isn't theirs.
export async function getOrder(id: string, customerId: string): Promise<Order | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await supabase()
    .from("orders")
    .select("id, number, created_at, status, items, subtotal, discount, total")
    .eq("id", id)
    .eq("customer_id", customerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    number: data.number,
    createdAt: data.created_at,
    status: data.status,
    items: data.items,
    subtotal: data.subtotal,
    discount: data.discount,
    total: data.total,
  };
}

// The short version for the "Your orders" list, newest first.
export type OrderSummary = Pick<Order, "id" | "number" | "createdAt" | "status" | "items" | "total">;

export async function getOrderSummaries(customerId: string): Promise<OrderSummary[]> {
  const { data, error } = await supabase()
    .from("orders")
    .select("id, number, created_at, status, items, total")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    number: row.number,
    createdAt: row.created_at,
    status: row.status,
    items: row.items,
    total: row.total,
  }));
}

export type NewOrder = { customerId: string; cart: unknown; details: Record<string, string> };

// Checks the order and saves it. The cart comes from the shopper's browser, so
// the pieces and prices are taken from the catalogue here, not from the cart.
// Returns the new order's id, or a message for the shopper. The delivery
// address is saved to the account to fill in checkout next time.
export async function createOrder({ customerId, cart, details }: NewOrder): Promise<{ id: string } | { error: string }> {
  const lines = sanitize(cart).map((item) => ({ ...item, product: getProduct(item.id)! }));
  if (lines.length === 0) return { error: "Your cart is empty." };

  const field = (name: string, max = 200) => String(details[name] ?? "").trim().slice(0, max);
  const customer = {
    first_name: field("firstName"),
    last_name: field("lastName") || null,
    phone: field("phone"),
    email: field("email") || null,
    address: field("address", 300),
    apartment: field("apartment", 300) || null,
    city: field("city"),
    state: matchState(field("state")),
    pin: field("pin"),
  };
  if (!/^[6-9][0-9]{9}$/.test(customer.phone)) return { error: "Please enter a 10-digit mobile number." };
  if (!/^[1-9][0-9]{5}$/.test(customer.pin)) return { error: "Please enter a 6-digit PIN code." };
  if (!customer.first_name || !customer.address || !customer.city || !customer.state) {
    return { error: "Please fill in all the fields marked *." };
  }

  const items: OrderItem[] = lines.map(({ product, size }) => ({
    id: product.id,
    name: product.name,
    size,
    price: product.price,
    image: product.image,
  }));
  const prices = orderPrices(lines.map(({ product, recommended }) => ({ price: product.price, recommended })));

  const { data, error } = await supabase()
    .from("orders")
    .insert({ ...customer, customer_id: customerId, items, ...prices })
    .select("id")
    .single();
  if (error) throw error;

  const address: SavedAddress = {
    firstName: customer.first_name,
    lastName: customer.last_name ?? "",
    address: customer.address,
    apartment: customer.apartment ?? "",
    pin: customer.pin,
    city: customer.city,
    state: customer.state,
  };
  const saved = await supabase().from("customers").update({ address }).eq("id", customerId);
  // The order is in; a missed address only means typing it again next time.
  if (saved.error) console.error("Couldn't save address", saved.error);
  return { id: data.id };
}
