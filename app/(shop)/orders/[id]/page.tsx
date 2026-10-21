import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { HeartIcon } from "@/components/HeartIcon";
import { getCustomer } from "@/lib/auth";
import { RECOMMENDATION_DISCOUNT } from "@/lib/cart";
import { getOrder, type Order, type OrderStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Your order",
  // Each order has its own private link, so keep them out of search results.
  robots: { index: false },
};

const HEADLINES: Record<OrderStatus, { title: string; note: string }> = {
  placed: {
    title: "Your order is placed.",
    note: "We'll reach out soon to confirm payment and delivery.",
  },
  confirmed: {
    title: "Your order is confirmed.",
    note: "We're packing your pieces with love.",
  },
  shipped: {
    title: "Your order is on its way.",
    note: "It'll be with you soon.",
  },
  delivered: {
    title: "Your order has arrived.",
    note: "We hope you love your new pieces.",
  },
  cancelled: {
    title: "This order was cancelled.",
    note: "Questions about it? Get in touch with us anytime.",
  },
};

const STEPS = [
  { status: "placed", label: "Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
] as const;

export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <div className="px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <Suspense fallback={<p className="py-24 text-center text-lg text-rose">Finding your order…</p>}>
        <OrderDetails params={params} />
      </Suspense>
    </div>
  );
}

async function OrderDetails({ params }: { params: PageProps<"/orders/[id]">["params"] }) {
  const { id } = await params;
  const customer = await getCustomer();
  if (!customer) redirect(`/login?next=/orders/${id}`);
  const order = await getOrder(id, customer.id);
  if (!order) notFound();
  const { title, note } = HEADLINES[order.status];
  const placedOn = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/orders" className="text-sm text-rose underline underline-offset-4 hover:text-cherry">
        ← All orders
      </Link>
      <header className="mt-6 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-cherry">
          Order #{order.number}
          <HeartIcon className="size-4" />
        </p>
        <h1 className="mt-3 font-serif text-5xl text-wine sm:text-6xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-rose">{note}</p>
      </header>

      <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm sm:mt-12 sm:p-10">
        {order.status !== "cancelled" && <Progress status={order.status} />}

        <div className={order.status !== "cancelled" ? "mt-10 border-t border-petal pt-8" : ""}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl text-cherry">Your pieces</h2>
            <p className="text-sm text-rose">Placed on {placedOn}</p>
          </div>
          <ul className="mt-4 divide-y divide-petal">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-md bg-petal">
                  <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p>{item.name}</p>
                  <p className="text-sm uppercase tracking-wide text-rose">Size: {item.size}</p>
                </div>
                <p className="font-medium text-cherry">{formatPrice(item.price)}</p>
              </li>
            ))}
          </ul>
          <Totals order={order} />
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block rounded-md bg-cherry px-7 py-3.5 font-medium text-white transition-colors hover:bg-wine"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

function Progress({ status }: { status: OrderStatus }) {
  const current = STEPS.findIndex((step) => step.status === status);
  return (
    <ol className="grid grid-cols-4" aria-label="Order progress">
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li
            key={step.status}
            aria-current={index === current ? "step" : undefined}
            className="relative flex flex-col items-center text-center"
          >
            {/* The line joining this step to the one before it. */}
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-2 h-0.5 w-full -translate-y-1/2 ${done ? "bg-cherry" : "bg-petal"}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative size-4 rounded-full border-2 ${
                done ? "border-cherry bg-cherry" : "border-petal bg-white"
              }`}
            />
            <span className={`mt-2 text-xs uppercase tracking-wide sm:text-sm ${done ? "text-cherry" : "text-rose"}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Totals({ order }: { order: Order }) {
  return (
    <dl className="mt-4 space-y-1.5 border-t border-petal pt-4">
      {order.discount > 0 && (
        <>
          <div className="flex justify-between text-rose">
            <dt>Items</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-sage-deep">
            <dt>{RECOMMENDATION_DISCOUNT}% off your order</dt>
            <dd>−{formatPrice(order.discount)}</dd>
          </div>
        </>
      )}
      <div className="flex justify-between text-xl font-medium">
        <dt>Total</dt>
        <dd>{formatPrice(order.total)}</dd>
      </div>
    </dl>
  );
}
