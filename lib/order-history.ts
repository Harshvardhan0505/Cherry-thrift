// The orders placed from this browser, kept in a cookie so "Your orders" can
// list them without an account. Newest first. The cookie only holds order ids;
// the orders themselves stay in the database.
export const ORDER_HISTORY_COOKIE = "cherry-thrifts-orders";

// Enough for anyone's history while keeping the cookie small.
const MAX_ORDERS = 30;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isOrderId = (value: string) => UUID.test(value);

export function readOrderHistory(cookie: string | undefined): string[] {
  return [...new Set((cookie ?? "").split(".").filter(isOrderId))].slice(0, MAX_ORDERS);
}

export function addToOrderHistory(cookie: string | undefined, id: string): string {
  return [id, ...readOrderHistory(cookie).filter((existing) => existing !== id)]
    .slice(0, MAX_ORDERS)
    .join(".");
}
