import { getSizes, type Product } from "./products";

// One line per product: every piece is a one-off, so a product is either in
// the cart in a single size or not in it at all. `recommended` marks the piece
// that was added from the cart's recommendation.
export type CartItem = { id: string; size: string; recommended: boolean };

// Percent off the whole order once the recommended piece is in the cart.
export const RECOMMENDATION_DISCOUNT = 15;

export function orderDiscount(subtotal: number): number {
  return Math.round((subtotal * RECOMMENDATION_DISCOUNT) / 100);
}

// What an order costs. The cart and the server both price orders with this,
// so the total a shopper sees is the total that gets saved.
export function orderPrices(lines: { price: number; recommended: boolean }[]) {
  const subtotal = lines.reduce((sum, line) => sum + line.price, 0);
  const discount = lines.some((line) => line.recommended) ? orderDiscount(subtotal) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

const KEY = "cherry-thrifts-cart";
const EMPTY: CartItem[] = [];

let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

// Tidies a saved or submitted cart: one line per piece, at most one
// recommendation. Given the catalogue, it also drops pieces that are gone and
// sizes they don't come in.
export function sanitize(value: unknown, findProduct?: (id: string) => Product | undefined): CartItem[] {
  if (!Array.isArray(value)) return EMPTY;
  const seen = new Set<string>();
  const items: CartItem[] = [];
  for (const entry of value) {
    if (typeof entry?.id !== "string" || typeof entry.size !== "string" || seen.has(entry.id)) continue;
    if (findProduct) {
      const product = findProduct(entry.id);
      if (!product || !getSizes(product).includes(entry.size)) continue;
    }
    seen.add(entry.id);
    // Only one piece per order counts as the recommendation.
    const recommended = entry.recommended === true && !items.some((item) => item.recommended);
    items.push({ id: entry.id, size: entry.size, recommended });
  }
  return items;
}

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? sanitize(JSON.parse(raw)) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: CartItem[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private windows); the cart then lasts for the visit.
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== KEY) return;
  cache = null;
  listeners.forEach((listener) => listener());
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY,
  // Adds the product, or switches its size if it is already in the cart (it
  // stays the recommendation if it was one). `recommended` applies only to a
  // newly added piece.
  set(id: string, size: string, recommended = false) {
    const items = read();
    if (items.some((item) => item.id === id)) {
      write(items.map((item) => (item.id === id ? { ...item, size } : item)));
    } else {
      const allowed = recommended && !items.some((item) => item.recommended);
      write([...items, { id, size, recommended: allowed }]);
    }
  },
  remove(id: string) {
    write(read().filter((item) => item.id !== id));
  },
  clear() {
    write(EMPTY);
  },
};
