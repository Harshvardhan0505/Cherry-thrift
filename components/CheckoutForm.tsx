"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { RECOMMENDATION_DISCOUNT } from "@/lib/cart";
import { CITIES_BY_STATE, STATES, lookupPin, matchState, suggest } from "@/lib/india";
import { formatPrice } from "@/lib/products";
import { site } from "@/lib/site";
import { Autocomplete } from "./Autocomplete";
import { useCart, type CartLine } from "./CartProvider";
import { OrderTotal } from "./OrderTotal";

const inputClass =
  "mt-1.5 w-full rounded-md border border-petal bg-white px-4 py-3 text-wine placeholder:text-rose/60 focus:border-cherry focus:outline-none focus:ring-1 focus:ring-cherry";
const labelClass = "block text-sm font-medium";

// Every city we suggest, with the state it's in.
const STATE_OF_CITY = new Map(
  Object.entries(CITIES_BY_STATE).flatMap(([state, cities]) =>
    cities.map((city) => [city, state] as const),
  ),
);
const ALL_CITIES = [...STATE_OF_CITY.keys()];

// Required fields: marks the label and replaces the browser's generic
// "Please fill out this field" with a friendlier line.
function need(missing: string, wrongFormat?: string) {
  return {
    required: true,
    onInvalid: (event: React.FormEvent<HTMLInputElement>) => {
      const { validity } = event.currentTarget;
      if (validity.valueMissing) event.currentTarget.setCustomValidity(missing);
      else if (validity.patternMismatch && wrongFormat) event.currentTarget.setCustomValidity(wrongFormat);
    },
    onInput: (event: React.FormEvent<HTMLInputElement>) => event.currentTarget.setCustomValidity(""),
  };
}

function Label({ text, optional = false }: { text: string; optional?: boolean }) {
  return (
    <span>
      {text}
      {optional ? (
        <span className="font-normal text-rose"> (optional)</span>
      ) : (
        <span aria-hidden="true" className="text-cherry"> *</span>
      )}
    </span>
  );
}

const validateState = (value: string) =>
  matchState(value) ? "" : "Please pick your state from the list.";

// The order as a WhatsApp message. Asterisks make text bold in WhatsApp.
function orderMessage(
  lines: CartLine[],
  prices: { subtotal: number; discount: number; total: number },
  form: FormData,
): string {
  const field = (name: string) => String(form.get(name) ?? "").trim();
  const state = matchState(field("state")) ?? field("state");
  const address = [
    field("address"),
    field("apartment"),
    `${field("city")}, ${state} ${field("pin")}`,
  ].filter(Boolean);
  const name = `${field("firstName")} ${field("lastName")}`.trim();

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
    `*Name:* ${name}`,
    `*Phone:* ${field("phone")}`,
    ...(field("email") ? [`*Email:* ${field("email")}`] : []),
    "*Address:*",
    ...address,
  ].join("\n");
}

// `heading` is the page's title block.
export function CheckoutForm({ heading }: { heading: React.ReactNode }) {
  const { lines, subtotal, discount, total, clear } = useCart();
  // Set once the order has been handed to WhatsApp.
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinNote, setPinNote] = useState<{ tone: "info" | "ok" | "warn"; text: string } | null>(null);
  const pinLookup = useRef<AbortController | null>(null);

  // A full PIN code fills in the city and state, as on big shopping sites.
  async function handlePin(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setPin(digits);
    pinLookup.current?.abort();
    if (digits.length < 6) {
      setPinNote(null);
      return;
    }
    const controller = new AbortController();
    pinLookup.current = controller;
    setPinNote({ tone: "info", text: "Finding your area…" });
    try {
      const area = await lookupPin(digits, controller.signal);
      if (controller.signal.aborted) return;
      if (area) {
        setCity(area.city);
        setState(area.state);
        setPinNote({ tone: "ok", text: `${area.city}, ${area.state}` });
      } else {
        setPinNote({ tone: "warn", text: "We couldn't find this PIN code. Please check it." });
      }
    } catch {
      // The lookup is a convenience; if it's down, the shopper fills in the rest.
      if (!controller.signal.aborted) setPinNote(null);
    }
  }

  const cityOptions = useCallback(
    (typed: string) => {
      const inState = matchState(state);
      return suggest(inState ? CITIES_BY_STATE[inState] : ALL_CITIES, typed);
    },
    [state],
  );
  const stateOptions = useCallback((typed: string) => suggest(STATES, typed), []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = orderMessage(lines, { subtotal, discount, total }, new FormData(event.currentTarget));
    const url = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
    setWhatsappUrl(url);
  }

  if (lines.length === 0) {
    return (
      <>
        {heading}
        <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
          <div className="mx-auto max-w-xl rounded-xl bg-white px-6 py-12 text-center">
            <p className="text-lg text-rose">Your cart is empty.</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-md bg-cherry px-7 py-3.5 font-medium text-white transition-colors hover:bg-wine"
            >
              Back to the shop
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {heading}
      <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
        {whatsappUrl && (
          <div className="mx-auto max-w-xl rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
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
            <p className="mt-4">
              <button
                type="button"
                onClick={() => setWhatsappUrl(null)}
                className="cursor-pointer text-rose underline underline-offset-4 hover:text-cherry"
              >
                ← Oops, let me edit my details
              </button>
            </p>
          </div>
        )}

        {/* Kept on the page while the step above shows, so going back finds
            everything just as it was typed. */}
        <div
          hidden={whatsappUrl !== null}
          className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr] lg:gap-8"
        >
          <form onSubmit={handleSubmit} className="order-2 rounded-2xl bg-white p-6 shadow-sm sm:p-10 lg:order-1">
            <p className="text-sm text-rose">
              Fields marked <span className="text-cherry">*</span> are needed to place your order.
            </p>

            <fieldset className="mt-6">
              <legend className="font-serif text-3xl text-cherry">Contact</legend>
              <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                <label className={labelClass}>
                  <Label text="Phone" />
                  <input
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    autoComplete="tel-national"
                    placeholder="10-digit mobile number"
                    className={inputClass}
                    {...need("Please add your phone number.", "Please enter a 10-digit mobile number.")}
                  />
                </label>
                <label className={labelClass}>
                  <Label text="Email" optional />
                  <input name="email" type="email" autoComplete="email" className={inputClass} />
                </label>
              </div>
            </fieldset>

            <hr aria-hidden="true" className="my-8 border-petal" />
            <fieldset>
              <legend className="font-serif text-3xl text-cherry">Delivery</legend>
              <p className="mt-1 text-sm text-rose">We deliver within India.</p>
              <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                <label className={labelClass}>
                  <Label text="First name" />
                  <input
                    name="firstName"
                    autoComplete="given-name"
                    className={inputClass}
                    {...need("Please add your first name.")}
                  />
                </label>
                <label className={labelClass}>
                  <Label text="Last name" optional />
                  <input name="lastName" autoComplete="family-name" className={inputClass} />
                </label>
                <label className={`sm:col-span-2 ${labelClass}`}>
                  <Label text="Address" />
                  <input
                    name="address"
                    autoComplete="address-line1"
                    placeholder="House number, street, area"
                    className={inputClass}
                    {...need("Please add your address.")}
                  />
                </label>
                <label className={`sm:col-span-2 ${labelClass}`}>
                  <Label text="Apartment, landmark" optional />
                  <input name="apartment" autoComplete="address-line2" className={inputClass} />
                </label>
                <label className={`sm:col-span-2 ${labelClass}`}>
                  <Label text="PIN code" />
                  <input
                    name="pin"
                    value={pin}
                    onChange={(event) => handlePin(event.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    autoComplete="postal-code"
                    placeholder="6 digits"
                    className={inputClass}
                    {...need("Please add your PIN code.", "Please enter a 6-digit PIN code.")}
                  />
                  {pinNote && (
                    <span
                      aria-live="polite"
                      className={`mt-1.5 block text-sm font-normal ${
                        pinNote.tone === "ok" ? "text-sage-deep" : pinNote.tone === "warn" ? "text-cherry" : "text-rose"
                      }`}
                    >
                      {pinNote.tone === "ok" ? `✓ ${pinNote.text}` : pinNote.text}
                    </span>
                  )}
                </label>
                <label className={labelClass}>
                  <Label text="City" />
                  <Autocomplete
                    name="city"
                    value={city}
                    onChange={(value) => {
                      setCity(value);
                      // Picking a listed city fills in its state if it's empty.
                      const itsState = STATE_OF_CITY.get(value);
                      if (itsState && !state) setState(itsState);
                    }}
                    options={cityOptions}
                    hint={(option) => (matchState(state) ? undefined : STATE_OF_CITY.get(option))}
                    autoComplete="address-level2"
                    required
                    invalidMessage="Please add your city."
                    inputClass={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  <Label text="State" />
                  <Autocomplete
                    name="state"
                    value={state}
                    onChange={setState}
                    options={stateOptions}
                    autoComplete="address-level1"
                    required
                    invalidMessage="Please add your state."
                    validate={validateState}
                    inputClass={inputClass}
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
      </div>
    </>
  );
}
