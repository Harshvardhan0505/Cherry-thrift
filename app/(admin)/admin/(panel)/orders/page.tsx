import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { NotesForm, OrderFilters, PaidSwitch, ShippingForm, StatusControls } from "@/components/admin/OrderControls";
import { panel, sectionTitle } from "@/components/admin/styles";
import { CopyButton } from "@/components/CopyButton";
import { StatusPill } from "@/components/StatusPill";
import { requireStaff } from "@/lib/admin-auth";
import {
  getAdminOrder,
  listOrders,
  parseFilters,
  statusCounts,
  type AdminOrder,
  type AdminOrderRow,
  type OrderFilters as Filters,
} from "@/lib/admin-data";
import { dayLabel, ordersHref, timeOf, whenOf, type OrderQuery } from "@/lib/admin-format";
import { RECOMMENDATION_DISCOUNT } from "@/lib/cart";
import { ADMIN_LABELS, ORDER_STATUSES, STEPS, type OrderStatus } from "@/lib/order-status";
import { formatPrice } from "@/lib/products";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin orders",
};

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <main className="px-4 py-5 sm:px-8 sm:py-7">
      <Suspense fallback={<p className="py-20 text-center text-rose">Loading orders…</p>}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Orders({ searchParams }: { searchParams: PageProps<"/admin/orders">["searchParams"] }) {
  await requireStaff();
  const params = await searchParams;
  const filters = parseFilters(params);
  const selectedId = typeof params.order === "string" ? params.order : null;
  const [counts, orders, selected] = await Promise.all([
    statusCounts(filters),
    listOrders(filters),
    selectedId ? getAdminOrder(selectedId) : null,
  ]);
  const query: OrderQuery = { ...filters, order: selected?.id ?? null };

  return (
    <>
      {/* On phones an open order takes the whole screen. */}
      <div className={selected ? "hidden lg:block" : ""}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h1 className="mr-auto font-serif text-[38px] leading-none">Orders</h1>
          <OrderFilters query={query} />
        </div>
        <StatusTabs filters={filters} counts={counts} query={query} />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section aria-label="Orders" className={selected ? "hidden lg:block" : ""}>
          <OrderList orders={orders} filters={filters} query={query} />
        </section>
        <section aria-label="Order" className={selected ? "" : "hidden lg:block"}>
          {selected ? (
            <>
              <Link href={ordersHref(query, { order: null })} className="mb-3 inline-block text-sm text-rose lg:hidden">
                ← Orders
              </Link>
              <OrderDetail order={selected} />
            </>
          ) : (
            <div className={`${panel} px-6 py-16 text-center text-rose`}>Pick an order to see its details.</div>
          )}
        </section>
      </div>
    </>
  );
}

function StatusTabs({ filters, counts, query }: { filters: Filters; counts: Record<OrderStatus, number>; query: OrderQuery }) {
  return (
    <nav aria-label="Order status" className="-mx-4 mt-5 overflow-x-auto border-b border-seam px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-1.5">
        {ORDER_STATUSES.map((status) => {
          const on = status === filters.status;
          return (
            <Link
              key={status}
              href={ordersHref(query, { status, order: null })}
              aria-current={on ? "page" : undefined}
              className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 pb-3 pt-2 ${
                on ? "border-cherry font-medium text-cherry" : "border-transparent text-rose hover:text-wine"
              }`}
            >
              {ADMIN_LABELS[status]}
              <span className={`rounded-full px-1.5 text-[11px] font-medium ${on ? "bg-cherry text-white" : "bg-seam text-wine"}`}>
                {counts[status]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const EMPTY: Record<OrderStatus, string> = {
  placed: "No new orders right now.",
  confirmed: "Nothing confirmed and waiting to ship.",
  shipped: "Nothing just shipped.",
  in_transit: "Nothing on the way right now.",
  delivered: "No delivered orders yet.",
  cancelled: "No cancelled orders.",
};

function OrderList({ orders, filters, query }: { orders: AdminOrderRow[]; filters: Filters; query: OrderQuery }) {
  if (orders.length === 0) {
    const filtering = filters.q || filters.range !== "all" || filters.unpaid;
    return (
      <div className={`${panel} px-6 py-14 text-center text-rose`}>
        {filtering ? "No orders match these filters." : EMPTY[filters.status]}
      </div>
    );
  }

  // Group by day, newest first (the list already comes newest first).
  const days: { label: string; orders: AdminOrderRow[] }[] = [];
  for (const order of orders) {
    const label = dayLabel(order.createdAt);
    const last = days.at(-1);
    if (last?.label === label) last.orders.push(order);
    else days.push({ label, orders: [order] });
  }

  return (
    <div className={`${panel} overflow-hidden`}>
      {days.map((day) => (
        <div key={day.label}>
          <p className="border-b border-seam bg-shell px-4 py-2.5 text-[11px] uppercase tracking-[0.14em] text-rose sm:px-5">{day.label}</p>
          <ul>
            {day.orders.map((order) => {
              const on = order.id === query.order;
              return (
                <li key={order.id} className="border-b border-seam last:border-b-0">
                  <Link
                    href={ordersHref(query, { order: order.id })}
                    aria-current={on ? "true" : undefined}
                    className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors sm:px-5 ${
                      on ? "bg-[#fff4f6] shadow-[inset_3px_0_0_var(--color-cherry)]" : "hover:bg-shell"
                    }`}
                  >
                    <Thumbs items={order.items} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        #{order.number} · {order.name}
                      </p>
                      <p className="mt-0.5 text-[13px] text-rose">
                        {order.items.length} {order.items.length === 1 ? "piece" : "pieces"} · {formatPrice(order.total)} ·{" "}
                        {order.paid ? <span className="font-medium text-sage-deep">Paid ✓</span> : "Not paid"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusPill status={order.status} labels={ADMIN_LABELS} />
                      <span className="text-xs text-rose">{timeOf(order.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Thumbs({ items }: { items: AdminOrderRow["items"] }) {
  return (
    <div className="flex w-[70px] shrink-0">
      {items.slice(0, 2).map((item, index) => (
        <div
          key={item.id}
          className={`relative h-[50px] w-10 overflow-hidden rounded-lg border-2 border-white bg-petal shadow-[0_2px_6px_rgb(74_20_32/0.15)] ${index ? "-ml-[18px]" : ""}`}
        >
          <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

// A ready-to-send WhatsApp message for where the order is up to.
function whatsappMessage(order: AdminOrder): string {
  const first = order.name.split(/\s+/)[0];
  const ref = `${site.name} order #${order.number}`;
  switch (order.status) {
    case "placed":
      return `Hi ${first}! Thank you for your ${ref} ♡ Your total is ${formatPrice(order.total)}. Shall we go ahead? We'll share payment details here.`;
    case "confirmed":
      return `Hi ${first}! Your ${ref} is confirmed ♡ We're packing it with love.`;
    case "shipped":
    case "in_transit":
      return `Hi ${first}! Your ${ref} is on its way ♡${order.trackingNumber ? ` Track it with ${order.courier ?? "the courier"}: ${order.trackingNumber}` : ""}`;
    case "delivered":
      return `Hi ${first}! Your ${ref} has been delivered ♡ We hope you love your pieces!`;
    case "cancelled":
      return `Hi ${first}, about your ${ref}: `;
  }
}

function OrderDetail({ order }: { order: AdminOrder }) {
  const { address } = order;
  const addressText = [
    order.name,
    [address.address, address.apartment].filter(Boolean).join(", "),
    `${address.city}, ${address.state} ${address.pin}`,
    `Phone: ${order.phone}`,
  ].join("\n");
  const whatsapp = `https://wa.me/91${order.phone}?text=${encodeURIComponent(whatsappMessage(order))}`;
  const current = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <article className={`${panel} p-5 sm:p-6`}>
      <header className="flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-[32px] leading-none">#{order.number}</h2>
        <StatusPill status={order.status} labels={ADMIN_LABELS} />
        <span className="ml-auto text-[13px] text-rose">Placed {whenOf(order.createdAt)}</span>
      </header>

      {order.status !== "cancelled" && (
        <ol className="mt-5 grid grid-cols-5" aria-label="Progress">
          {STEPS.map((step, index) => {
            const done = index <= current;
            return (
              <li key={step} className="relative flex flex-col items-center text-center">
                {index > 0 && (
                  <span aria-hidden="true" className={`absolute right-1/2 top-[7px] h-0.5 w-full ${done ? "bg-cherry" : "bg-petal"}`} />
                )}
                <span aria-hidden="true" className={`relative size-3.5 rounded-full border-2 ${done ? "border-cherry bg-cherry" : "border-petal bg-white"}`} />
                <span className={`mt-1.5 text-[10px] uppercase tracking-wide sm:text-[11px] ${done ? "font-medium text-cherry" : "text-rose"}`}>
                  {ADMIN_LABELS[step]}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-5">
        <StatusControls orderId={order.id} status={order.status} />
      </div>

      <div className="mt-5 grid gap-3.5 sm:grid-cols-2">
        <section className="rounded-2xl border border-seam p-4">
          <div className="flex items-center justify-between">
            <h3 className={sectionTitle}>Customer</h3>
            <CopyButton text={addressText} label="Copy address" />
          </div>
          <p className="mt-2 font-medium">{order.name}</p>
          <p className="text-[13px] text-rose">
            {order.phone}
            {order.email && ` · ${order.email}`}
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            {[address.address, address.apartment].filter(Boolean).join(", ")}
            <br />
            {address.city}, {address.state} {address.pin}
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#cfe9d8] bg-[#e8f5ec] px-4 py-2 text-sm font-medium text-[#1f7a45]"
            >
              WhatsApp
            </a>
            <a href={`tel:+91${order.phone}`} className="rounded-full border border-seam px-4 py-2 text-sm font-medium">
              Call
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-seam p-4">
          <h3 className={sectionTitle}>Payment</h3>
          <div className="mt-2.5">
            <PaidSwitch key={String(order.paid)} orderId={order.id} paid={order.paid} />
          </div>
          <h3 className={`${sectionTitle} mt-4`}>Shipping</h3>
          <div className="mt-2.5">
            <ShippingForm key={`${order.courier}-${order.trackingNumber}`} orderId={order.id} courier={order.courier} tracking={order.trackingNumber} />
          </div>
        </section>
      </div>

      <section className="mt-3.5 rounded-2xl border border-seam p-4">
        <h3 className={sectionTitle}>Pieces</h3>
        <ul className="mt-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2">
              <div className="relative h-12 w-[38px] shrink-0 overflow-hidden rounded-lg bg-petal">
                <Image src={item.image} alt="" fill sizes="38px" className="object-cover" />
              </div>
              <span className="flex-1">
                {item.name}
                <span className="block text-xs text-rose">Size {item.size}</span>
              </span>
              {formatPrice(item.price)}
            </li>
          ))}
        </ul>
        <dl className="mt-1.5 grid gap-1 border-t border-seam pt-2.5">
          {order.discount > 0 && (
            <>
              <div className="flex justify-between text-rose">
                <dt>Items</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-sage-deep">
                <dt>{RECOMMENDATION_DISCOUNT}% off</dt>
                <dd>−{formatPrice(order.discount)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-3.5 grid gap-3.5 sm:grid-cols-2">
        <section className="rounded-2xl border border-seam p-4">
          <h3 className={sectionTitle}>Private notes</h3>
          <div className="mt-2.5">
            <NotesForm key={order.notes ?? ""} orderId={order.id} notes={order.notes} />
          </div>
        </section>
        <section className="rounded-2xl border border-seam p-4">
          <h3 className={sectionTitle}>History</h3>
          <ol className="mt-2.5 grid gap-2 text-[13px]">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cherry" />
              <span>
                Placed by {order.name.split(/\s+/)[0]} <span className="text-rose">· {whenOf(order.createdAt)}</span>
              </span>
            </li>
            {order.events.map((event) => (
              <li key={event.id} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-petal" />
                <span>
                  {event.message}
                  {event.staffName && ` by ${event.staffName}`} <span className="text-rose">· {whenOf(event.createdAt)}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
