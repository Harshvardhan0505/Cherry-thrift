"use server";

import { updateTag } from "next/cache";
import { getCustomer } from "@/lib/auth";
import { SOLD_TAG } from "@/lib/catalog";
import { createOrder } from "@/lib/orders";

// Places the order from the checkout form. Anyone can call this directly, so
// the account is checked here and everything else again in createOrder.
export async function placeOrder(cart: unknown, details: unknown): Promise<{ id: string } | { error: string }> {
  const customer = await getCustomer();
  if (!customer) return { error: "Please log in again to place your order." };

  const fields =
    details && typeof details === "object"
      ? Object.fromEntries(
          Object.entries(details).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
        )
      : {};
  try {
    const result = await createOrder({ customerId: customer.id, cart, details: fields });
    // Its pieces are sold now: show that straight away.
    if ("id" in result) updateTag(SOLD_TAG);
    return result;
  } catch (error) {
    console.error("Couldn't place order", error);
    return { error: "We couldn't place your order just now. Please try again in a moment." };
  }
}
