"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { cartStore, orderPrices } from "@/lib/cart";
import { getSizes, type Product } from "@/lib/products";
import { CartDrawer } from "./CartDrawer";

export type CartLine = { product: Product; size: string; recommended: boolean };

type Cart = {
  // Every piece in the shop, for the recommendation.
  catalog: Product[];
  lines: CartLine[];
  // Pieces this shopper had in their cart that someone else has since bought.
  soldOut: Product[];
  // Sum of the prices, the order discount (0 unless the recommended piece is
  // in the cart) and what is owed.
  subtotal: number;
  discount: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  // Puts the product in the cart in this size and shows the cart.
  add: (id: string, size: string, recommended?: boolean) => void;
  remove: (id: string) => void;
  clear: () => void;
  sizeInCart: (id: string) => string | undefined;
  // Set for about a second after the recommended piece unlocks the discount,
  // so the cart can play its celebration.
  celebration: { key: number; id: string } | null;
};

const CELEBRATION_MS = 1100;

const CartContext = createContext<Cart | null>(null);

export function useCart(): Cart {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider");
  return cart;
}

// `catalog` comes from the server (Sanity), so the cart can show pieces and
// leave out any that are no longer in the shop.
export function CartProvider({ catalog, children }: { catalog: Product[]; children: React.ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [celebration, setCelebration] = useState<Cart["celebration"]>(null);
  // Stable, so effects that depend on them don't re-run as the cart changes.
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const cart = useMemo<Cart>(() => {
    const lines = items.flatMap((item) => {
      const product = catalog.find((piece) => piece.id === item.id);
      return product && !product.sold && getSizes(product).includes(item.size)
        ? [{ product, size: item.size, recommended: item.recommended }]
        : [];
    });
    const soldOut = items.flatMap((item) => {
      const product = catalog.find((piece) => piece.id === item.id);
      return product?.sold ? [product] : [];
    });
    const prices = orderPrices(
      lines.map((line) => ({ price: line.product.price, recommended: line.recommended })),
    );
    return {
      catalog,
      lines,
      soldOut,
      ...prices,
      isOpen,
      open,
      close,
      add: (id, size, recommended) => {
        const unlocks =
          recommended &&
          !items.some((item) => item.recommended) &&
          !items.some((item) => item.id === id);
        cartStore.set(id, size, recommended);
        if (unlocks) {
          const key = Date.now();
          setCelebration({ key, id });
          setTimeout(() => setCelebration((now) => (now?.key === key ? null : now)), CELEBRATION_MS);
        }
        setIsOpen(true);
      },
      remove: cartStore.remove,
      clear: cartStore.clear,
      sizeInCart: (id) => items.find((item) => item.id === id)?.size,
      celebration,
    };
  }, [catalog, items, isOpen, celebration, open, close]);

  return (
    <CartContext.Provider value={cart}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}
