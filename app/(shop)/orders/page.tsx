import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HeartIcon } from "@/components/HeartIcon";
import { StatusPill } from "@/components/StatusPill";
import { ORDER_HISTORY_COOKIE, readOrderHistory } from "@/lib/order-history";
import { getOrderSummaries, type OrderItem } from "@/lib/orders";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false },
};

export default function OrdersPage({ searchParams }: PageProps<"/orders">) {
  return (
    <div className="px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <div className="mx-auto max-w-2xl">
        <header className="text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-cherry">
            Your orders
            <HeartIcon className="size-4" />
          </p>
          <h1 className="mt-3 font-serif text-5xl text-wine sm:text-6xl">Your little hauls.</h1>
        </header>
        <Suspense fallback={<p className="mt-12 text-center text-lg text-rose">Finding your orders…</p>}>
          <OrderList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function OrderList({ searchParams }: { searchParams: PageProps<"/orders">["searchParams"] }) {
  const { placed } = await searchParams;
  const ids = readOrderHistory((await cookies()).get(ORDER_HISTORY_COOKIE)?.value);
  const orders = await getOrderSummaries(ids);
  // Set right after checkout, to say the newest order went through.
  const justPlaced = orders.find((order) => order.id === placed);

  if (orders.length === 0) {
    return (
      <div className="mt-10 rounded-2xl bg-white px-6 py-12 text-center shadow-sm sm:mt-12">
        <p className="text-lg text-rose">No orders yet. Once you place one, it&apos;ll show up here.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-cherry px-7 py-3.5 font-medium text-white transition-colors hover:bg-wine"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      {justPlaced && (
        <div role="status" className="mt-10 rounded-2xl bg-white px-6 py-8 text-center shadow-sm sm:mt-12">
          <p className="font-serif text-3xl text-cherry">Your order is placed ♡</p>
          <p className="mt-2 text-rose">We&apos;ll reach out soon to confirm payment and delivery.</p>
        </div>
      )}
      <ul className={`${justPlaced ? "mt-6" : "mt-10 sm:mt-12"} divide-y divide-petal overflow-hidden rounded-2xl bg-white shadow-sm`}>
        {orders.map((order) => {
          const [first, ...rest] = order.items;
          const placedOn = new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          });
          return (
            <li key={order.id}>
              <Link
                href={`/orders/${order.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-shell sm:px-8 sm:py-5"
              >
                <Thumbnails items={order.items} />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-medium text-wine group-hover:text-cherry">
                    {first.name}
                    {rest.length > 0 && <span className="font-normal text-rose"> + {rest.length} more</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-rose">
                    {placedOn} · {formatPrice(order.total)}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <StatusPill status={order.status} />
                    <span className="text-xs text-rose">Order #{order.number}</span>
                  </p>
                </div>
                <span aria-hidden="true" className="text-xl text-rose transition-transform group-hover:translate-x-0.5">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

// Up to three of the order's photos, overlapping like a little stack. Always
// as wide as three, so the names line up from row to row.
function Thumbnails({ items }: { items: OrderItem[] }) {
  return (
    <div className="flex w-[88px] shrink-0 sm:w-[104px]">
      {items.slice(0, 3).map((item, index) => (
        <div
          key={item.id}
          className={`relative aspect-[4/5] w-12 overflow-hidden rounded-md bg-petal ring-2 ring-white sm:w-14 ${
            index > 0 ? "-ml-7 sm:-ml-8" : ""
          }`}
        >
          <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
