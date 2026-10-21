"use server";

import { getCustomer } from "@/lib/auth";
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
    return await createOrder({ customerId: customer.id, cart, details: fields });
  } catch (error) {
    console.error("Couldn't place order", error);
    return { error: "We couldn't place your order just now. Please try again in a moment." };
  }
}
