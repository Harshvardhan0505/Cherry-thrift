"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { saveNotes, saveShipping, setOrderPaid, setOrderStatus } from "@/lib/admin-actions";
import { RANGES } from "@/lib/admin-ranges";
import { ordersHref, type OrderQuery } from "@/lib/admin-format";
import {
  ADMIN_LABELS,
  COURIERS,
  DEFAULT_COURIER,
  indiaPostNumber,
  NEXT_STEP,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/order-status";
import { adminInput, primaryButton, secondaryButton } from "./styles";

// Search, date range and the "Not paid" filter above the orders list.
export function OrderFilters({ query }: { query: OrderQuery }) {
  const router = useRouter();
  const go = (changes: Partial<OrderQuery>) => router.push(ordersHref(query, { ...changes, order: null }));
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go({ q: String(new FormData(event.currentTarget).get("q") ?? "").trim() });
        }}
        className="order-last w-full sm:order-none sm:w-72"
      >
        <input
          name="q"
          type="search"
          defaultValue={query.q}
          placeholder="Search name, phone or order #"
          aria-label="Search orders"
          className={`${adminInput} bg-white`}
        />
      </form>
      <select
        value={query.range}
        onChange={(event) => go({ range: event.target.value })}
        aria-label="Date"
        className="cursor-pointer rounded-xl border border-seam bg-white px-3.5 py-2.5 text-wine focus:border-cherry focus:outline-none"
      >
        {Object.entries(RANGES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        type="button"
        aria-pressed={query.unpaid}
        onClick={() => go({ unpaid: !query.unpaid })}
        className={`cursor-pointer rounded-xl border px-3.5 py-2.5 transition-colors ${
          query.unpaid ? "border-cherry bg-[#fff7f9] text-cherry" : "border-seam bg-white text-wine hover:border-rose"
        }`}
      >
        Not paid{query.unpaid ? " ✕" : ""}
      </button>
    </div>
  );
}

// The main "next step" button, cancel, and a quiet way to fix mistakes.
export function StatusControls({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();
  const next = NEXT_STEP[status];
  const move = (to: OrderStatus) => startTransition(() => setOrderStatus(orderId, to));

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {next && (
        <button type="button" disabled={pending} onClick={() => move(next.status)} className={primaryButton}>
          {pending ? "Saving…" : next.label}
        </button>
      )}
      {status !== "cancelled" && status !== "delivered" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm("Cancel this order? The customer will see it as cancelled.")) move("cancelled");
          }}
          className={`${secondaryButton} text-rose`}
        >
          Cancel order
        </button>
      )}
      <label className="ml-auto flex items-center gap-2 text-[13px] text-rose">
        Move to
        <select
          value=""
          disabled={pending}
          onChange={(event) => event.target.value && move(event.target.value as OrderStatus)}
          className="cursor-pointer rounded-lg border border-seam bg-white px-2 py-1.5 text-wine"
        >
          <option value="">…</option>
          {ORDER_STATUSES.filter((option) => option !== status).map((option) => (
            <option key={option} value={option}>
              {ADMIN_LABELS[option]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function PaidSwitch({ orderId, paid }: { orderId: string; paid: boolean }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(paid);
  const on = pending ? optimistic : paid;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending}
      onClick={() => {
        setOptimistic(!paid);
        startTransition(() => setOrderPaid(orderId, !paid));
      }}
      className="flex cursor-pointer items-center gap-2.5"
    >
      <span
        className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors after:absolute after:left-[3px] after:top-[3px] after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform ${
          on ? "bg-sage-deep after:translate-x-4" : "bg-seam"
        }`}
      />
      <span className={on ? "font-medium text-sage-deep" : ""}>{on ? "Paid ✓" : "Not paid yet"}</span>
    </button>
  );
}

export function ShippingForm({ orderId, courier, tracking }: { orderId: string; courier: string | null; tracking: string | null }) {
  const [state, action, pending] = useActionState(saveShipping, {});
  const [chosen, setChosen] = useState(courier ?? DEFAULT_COURIER);
  const [number, setNumber] = useState(tracking ?? "");
  const indiaPost = chosen === "India Post";
  // Spot a mistyped Speed Post number before saving.
  const looksWrong = indiaPost && number.trim().length >= 13 && !indiaPostNumber(number);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="courier"
        value={chosen}
        onChange={(event) => setChosen(event.target.value)}
        aria-label="Courier"
        className={`${adminInput} cursor-pointer`}
      >
        {Object.keys(COURIERS).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <input
        name="tracking"
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        placeholder={indiaPost ? "e.g. EE123456789IN" : "Tracking number"}
        aria-label="Tracking number"
        aria-invalid={looksWrong || undefined}
        autoCapitalize="characters"
        spellCheck={false}
        className={`${adminInput} ${looksWrong ? "border-cherry" : ""}`}
      />
      {looksWrong && <span className="text-xs text-cherry">India Post numbers are 2 letters, 9 digits, 2 letters.</span>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={`${secondaryButton} px-4 py-2 text-sm`}>
          {pending ? "Saving…" : "Save"}
        </button>
        {state.done && !pending && <span className="text-sm text-sage-deep">Saved ✓</span>}
        {state.error && <span className="text-sm text-cherry">{state.error}</span>}
      </div>
    </form>
  );
}

export function NotesForm({ orderId, notes }: { orderId: string; notes: string | null }) {
  const [state, action, pending] = useActionState(saveNotes, {});
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <textarea
        name="notes"
        defaultValue={notes ?? ""}
        rows={3}
        placeholder="Only your team sees these, e.g. paid ₹699 by UPI"
        aria-label="Private notes"
        className={`${adminInput} resize-y`}
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={`${secondaryButton} px-4 py-2 text-sm`}>
          {pending ? "Saving…" : "Save notes"}
        </button>
        {state.done && !pending && <span className="text-sm text-sage-deep">Saved ✓</span>}
        {state.error && <span className="text-sm text-cherry">{state.error}</span>}
      </div>
    </form>
  );
}
