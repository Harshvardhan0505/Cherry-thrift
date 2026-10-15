"use client";

import { getSizes, type Product } from "@/lib/products";
import { useCart } from "./CartProvider";

// One button per size. Choosing a size puts the piece in the cart.
export function SizeButtons({
  product,
  buttonClass,
  activeClass,
  recommended = false,
}: {
  product: Product;
  buttonClass: string;
  activeClass: string;
  // True on the cart's recommendation, where adding it unlocks the order discount.
  recommended?: boolean;
}) {
  const { add, sizeInCart } = useCart();
  const chosen = sizeInCart(product.id);

  return (
    <>
      {getSizes(product).map((size) => (
        <button
          key={size}
          type="button"
          aria-label={`Add ${product.name} in ${size} to cart`}
          aria-pressed={size === chosen}
          onClick={() => add(product.id, size, recommended)}
          className={`${buttonClass} ${size === chosen ? activeClass : ""}`}
        >
          {size}
        </button>
      ))}
    </>
  );
}
