"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { RECOMMENDATION_DISCOUNT } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { recommendFor } from "@/lib/recommend";
import { useCart } from "./CartProvider";
import { HeartBurst } from "./HeartBurst";
import { HeartIcon } from "./HeartIcon";
import { OrderTotal } from "./OrderTotal";
import { RewardBanner } from "./RewardBanner";
import { SizeButtons } from "./SizeButtons";

export function CartDrawer() {
  const { lines, subtotal, discount, total, isOpen, close, remove, clear, celebration } = useCart();
  const closeButton = useRef<HTMLButtonElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    // Open at the top, where the offer is.
    if (scrollArea.current) scrollArea.current.scrollTop = 0;
    closeButton.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  // One recommendation per order: once it is in the cart, stop offering.
  const unlocked = lines.some((line) => line.recommended);
  const suggestion = unlocked ? undefined : recommendFor(lines.map((line) => line.product));
  const recommendation = suggestion?.product;

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        tabIndex={-1}
        onClick={close}
        className={`absolute inset-0 cursor-default bg-wine/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-shell text-wine transition-transform duration-300 ${isOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between gap-4 px-6 pb-4 pt-6">
          <h2 className="font-serif text-4xl text-cherry sm:text-5xl">Your cart</h2>
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="cursor-pointer p-2 text-2xl leading-none hover:text-cherry"
          >
            ✕
          </button>
        </header>

        <div ref={scrollArea} className="flex-1 overflow-y-auto px-6 pb-6">
          {lines.length > 0 && (recommendation || unlocked) && (
            <RewardBanner unlocked={unlocked} celebrating={celebration !== null} />
          )}

          {lines.length > 0 && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={clear}
                className="cursor-pointer text-sm text-rose underline underline-offset-4 hover:text-cherry"
              >
                Clear cart
              </button>
            </div>
          )}

          {lines.length === 0 ? (
            <p className="mt-6 rounded-lg bg-blush px-5 py-8 text-center text-rose">
              Your cart is empty. Pick a size on any piece to add it.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-petal">
              {lines.map(({ product, size }) => (
                <li key={product.id} className="relative flex gap-4 py-5">
                  <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-md bg-petal">
                    <Image src={product.image} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="text-lg leading-snug">{product.name}</h3>
                    <p className="mt-1 text-sm uppercase tracking-wide text-rose">Size: {size}</p>
                    <div className="mt-auto flex items-end justify-between pt-3">
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        className="cursor-pointer text-sm text-rose underline underline-offset-4 hover:text-cherry"
                      >
                        Remove
                      </button>
                      <p className="font-medium text-cherry">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                  {/* Hearts float off the piece that just unlocked the discount. */}
                  {celebration?.id === product.id && <HeartBurst key={celebration.key} />}
                </li>
              ))}
            </ul>
          )}

          {recommendation && (
            <section className="mt-4">
              <h3 className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-sage-deep">
                You may also like
                <HeartIcon className="size-4" />
              </h3>
              <div className="relative mt-3 rounded-2xl border border-petal bg-white">
                <p className="flex items-center justify-center gap-2 rounded-t-2xl bg-cherry px-4 py-2.5 text-sm uppercase tracking-[0.25em] text-white">
                  A little something extra
                  <HeartIcon className="size-4" />
                </p>
                <div className="flex gap-4 p-4">
                  <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-md bg-petal">
                    <Image src={recommendation.image} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-lg leading-snug">{recommendation.name}</p>
                      <p className="shrink-0 text-lg font-medium text-cherry">
                        {formatPrice(recommendation.price)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm text-sage-deep">
                      Goes with your {suggestion?.goesWith.name}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-rose">
                      Choose your size to unlock your {RECOMMENDATION_DISCOUNT}% off
                      <HeartIcon className="size-4 shrink-0" />
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <SizeButtons
                        product={recommendation}
                        recommended
                        buttonClass="cursor-pointer rounded-full border border-petal px-3.5 py-1.5 text-sm uppercase tracking-wide hover:border-cherry hover:text-cherry"
                        activeClass="border-cherry bg-cherry text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-petal bg-blush px-6 pb-6 pt-5">
            <OrderTotal lines={lines} subtotal={subtotal} discount={discount} total={total} />
            <Link
              href="/checkout"
              onClick={close}
              className="mt-5 block rounded-md bg-cherry px-6 py-4 text-center text-lg font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-wine"
            >
              Start order
            </Link>
            <p className="mt-3 text-center text-sm text-rose">
              Delivery is agreed with you on WhatsApp.
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}
