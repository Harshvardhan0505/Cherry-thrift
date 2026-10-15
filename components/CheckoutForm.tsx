"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RECOMMENDATION_DISCOUNT } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { site } from "@/lib/site";
import { useCart, type CartLine } from "./CartProvider";
import { OrderTotal } from "./OrderTotal";

const inputClass =
  "mt-1.5 w-full rounded-md border border-petal bg-white px-4 py-3 text-wine placeholder:text-rose/60 focus:border-cherry focus:outline-none focus:ring-1 focus:ring-cherry";
const labelClass = "block text-sm font-medium";

// The order as a WhatsApp message. Asterisks make text bold in WhatsApp.
function orderMessage(
  lines: CartLine[],
  prices: { subtotal: number; discount: number; total: number },
  form: FormData,
): string {
  const field = (name: string) => String(form.get(name) ?? "").trim();
  const address = [
    field("address"),
    field("apartment"),
    `${field("city")}, ${field("state")} ${field("pin")}`,
  ].filter(Boolean);

  return [
    `Hi ${site.name}! I'd like to place an order.`,
    "",
    "*Order*",
    ...lines.map(
      ({ product, size }, i) =>
        `${i + 1}. ${product.name} · ${size === "Free size" ? size : `Size ${size}`} · ${formatPrice(product.price)}`,
    ),
    ...(prices.discount > 0
      ? [
          `Items: ${formatPrice(prices.subtotal)}`,
          `${RECOMMENDATION_DISCOUNT}% off the order: −${formatPrice(prices.discount)}`,
        ]
      : []),
    `*Total: ${formatPrice(prices.total)}*`,
    "",
    `*Name:* ${field("firstName")} ${field("lastName")}`,
    `*Email:* ${field("email")}`,
    `*Phone:* ${field("phone")}`,
    "*Address:*",
    ...address,
  ].join("\n");
}

export function CheckoutForm() {
  const { lines, subtotal, discount, total, clear } = useCart();
  // Set once the order has been handed to WhatsApp.
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = orderMessage(lines, { subtotal, discount, total }, new FormData(event.currentTarget));
    const url = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
    setWhatsappUrl(url);
  }

  if (whatsappUrl) {
    return (
      <div className="mx-auto max-w-xl rounded-xl bg-white px-6 py-12 text-center">
        <h2 className="font-serif text-4xl text-cherry">One last step</h2>
        <p className="mt-4 text-lg">
          WhatsApp has opened with your order typed out. Press send there to place it, and
          we&apos;ll reply to confirm payment and delivery.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-md bg-cherry px-7 py-3.5 font-medium text-white transition-colors hover:bg-wine"
        >
          WhatsApp didn&apos;t open? Tap here
        </a>
        <p className="mt-6">
          <Link
            href="/"
            onClick={clear}
            className="text-cherry underline underline-offset-4 hover:text-wine"
          >
            I&apos;ve sent it. Empty my cart and keep browsing
          </Link>
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-xl bg-white px-6 py-12 text-center">
        <p className="text-lg text-rose">Your cart is empty.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-cherry px-7 py-3.5 font-medium text-white transition-colors hover:bg-wine"
        >
          Back to the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
      <form onSubmit={handleSubmit} className="order-2 rounded-2xl bg-white p-6 shadow-sm sm:p-10 lg:order-1">
        <fieldset>
          <legend className="font-serif text-3xl text-cherry">Contact</legend>
          <label className={`mt-6 ${labelClass}`}>
            Email
            <input name="email" type="email" required autoComplete="email" className={inputClass} />
          </label>
        </fieldset>

        <hr aria-hidden="true" className="my-8 border-petal" />
        <fieldset>
          <legend className="font-serif text-3xl text-cherry">Delivery</legend>
          <p className="mt-1 text-sm text-rose">We deliver within India.</p>
          <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2">
            <label className={labelClass}>
              First name
              <input name="firstName" required autoComplete="given-name" className={inputClass} />
            </label>
            <label className={labelClass}>
              Last name
              <input name="lastName" required autoComplete="family-name" className={inputClass} />
            </label>
            <label className={`sm:col-span-2 ${labelClass}`}>
              Address
              <input name="address" required autoComplete="address-line1" className={inputClass} />
            </label>
            <label className={`sm:col-span-2 ${labelClass}`}>
              Apartment, landmark (optional)
              <input name="apartment" autoComplete="address-line2" className={inputClass} />
            </label>
            <label className={labelClass}>
              City
              <input name="city" required autoComplete="address-level2" className={inputClass} />
            </label>
            <label className={labelClass}>
              State
              <input name="state" required autoComplete="address-level1" className={inputClass} />
            </label>
            <label className={labelClass}>
              PIN code
              <input
                name="pin"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                title="6-digit PIN code"
                autoComplete="postal-code"
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Phone
              <input
                name="phone"
                type="tel"
                required
                pattern="[0-9+ ]{10,15}"
                title="Phone number, 10 digits"
                autoComplete="tel"
                className={inputClass}
              />
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-10 w-full cursor-pointer rounded-md bg-cherry px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-wine"
        >
          Place order on WhatsApp
        </button>
        <p className="mt-3 text-center text-sm text-rose">
          No payment is taken on this site. Your order opens as a WhatsApp message to us, and we
          confirm payment and delivery there.
        </p>
      </form>

      <aside aria-label="Order summary" className="order-1 lg:sticky lg:top-8 lg:order-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-3xl text-cherry">Your order</h2>
          <ul className="mt-4 divide-y divide-petal">
            {lines.map(({ product, size }) => (
              <li key={product.id} className="flex items-center gap-4 py-4">
                <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-md bg-petal">
                  <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p>{product.name}</p>
                  <p className="text-sm uppercase tracking-wide text-rose">Size: {size}</p>
                </div>
                <p className="font-medium text-cherry">{formatPrice(product.price)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-petal pt-4">
            <OrderTotal lines={lines} subtotal={subtotal} discount={discount} total={total} />
            <p className="mt-2 text-sm text-rose">Delivery is agreed with you on WhatsApp.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
