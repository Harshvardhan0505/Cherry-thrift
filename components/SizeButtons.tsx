"use client";

import { flyToCart } from "@/lib/fly-to-cart";
import { getSizes, type Product } from "@/lib/products";
import { useCart } from "./CartProvider";

// One button per size. Choosing a size puts the piece in the cart.
export function SizeButtons({
  product,
  buttonClass,
  activeClass,
  recommended = false,
  flyFrom,
}: {
  product: Product;
  buttonClass: string;
  activeClass: string;
  // True on the cart's recommendation, where adding it unlocks the order discount.
  recommended?: boolean;
  // The photo the add-to-cart animation starts from, when it isn't this card's.
  flyFrom?: () => HTMLImageElement | null;
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
          // On a product card, the photo flies into the bag before the cart opens.
          onClick={(event) => add(product.id, size, recommended, recommended ? 0 : flyToCart(event.currentTarget, flyFrom?.()))}
          className={`${buttonClass} ${size === chosen ? activeClass : ""}`}
        >
          {size}
        </button>
      ))}
    </>
  );
}
