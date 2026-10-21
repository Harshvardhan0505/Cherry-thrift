"use server";

import { cookies } from "next/headers";
import { addToOrderHistory, ORDER_HISTORY_COOKIE } from "@/lib/order-history";
import { createOrder } from "@/lib/orders";

// Places the order from the checkout form. Anyone can call this directly, so
// everything is checked again in createOrder.
export async function placeOrder(cart: unknown, details: unknown): Promise<{ id: string } | { error: string }> {
  const fields =
    details && typeof details === "object"
      ? Object.fromEntries(
          Object.entries(details).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
        )
      : {};
  let result: Awaited<ReturnType<typeof createOrder>>;
  try {
    result = await createOrder({ cart, details: fields });
  } catch (error) {
    console.error("Couldn't place order", error);
    return { error: "We couldn't place your order just now. Please try again in a moment." };
  }

  // Remember the order in this browser for "Your orders". The header reads
  // the cookie too (to show its Orders link), so it isn't httpOnly; it only
  // holds order ids.
  if ("id" in result) {
    const store = await cookies();
    store.set(ORDER_HISTORY_COOKIE, addToOrderHistory(store.get(ORDER_HISTORY_COOKIE)?.value, result.id), {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return result;
}
