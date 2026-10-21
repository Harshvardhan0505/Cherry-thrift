"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: React.ReactNode; count?: number; soon?: boolean };

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
    <path d={d} />
  </svg>
);

function items(role: "owner" | "helper", newOrders: number): Item[] {
  return [
    { href: "/admin/orders", label: "Orders", icon: icon("M4 8l8-4 8 4v8l-8 4-8-4V8Zm0 0 8 4 8-4M12 12v8"), count: newOrders },
    { href: "/admin/customers", label: "Customers", icon: icon("M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z") },
    { href: "/admin/pieces", label: "Pieces", icon: icon("M8 4h8l3 4-7 12L5 8l3-4Zm-3 4h14"), soon: true },
    ...(role === "owner"
      ? [{ href: "/admin/team", label: "Team", icon: icon("M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9c.6-3 3-5 6-5s5.4 2 6 5M16 5a3 3 0 0 1 0 6m2.5 9c-.3-2-1.3-3.6-2.8-4.4") }]
      : []),
  ];
}

// The sidebar on laptops and the bottom bar on phones.
export function AdminNav({ role, newOrders, variant }: { role: "owner" | "helper"; newOrders: number; variant: "side" | "bar" }) {
  const pathname = usePathname();
  const list = items(role, newOrders);

  if (variant === "bar") {
    return (
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-seam bg-white pb-[max(env(safe-area-inset-bottom),12px)] pt-2.5 lg:hidden">
        {list
          .filter((item) => !item.soon)
          .map((item) => {
            const on = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`relative grid justify-items-center gap-0.5 px-3 text-[11px] ${on ? "font-medium text-cherry" : "text-rose"}`}>
                {item.icon}
                {item.label}
                {!!item.count && (
                  <span className="absolute -top-1 right-1 rounded-full bg-cherry px-1.5 text-[10px] font-semibold text-white">{item.count}</span>
                )}
              </Link>
            );
          })}
        <Link href="/admin/account" className={`grid justify-items-center gap-0.5 px-3 text-[11px] ${pathname.startsWith("/admin/account") ? "font-medium text-cherry" : "text-rose"}`}>
          {icon("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5")}
          You
        </Link>
      </nav>
    );
  }

  return (
    <nav aria-label="Admin" className="mt-8 grid gap-1">
      {list.map((item) =>
        item.soon ? (
          <span key={item.href} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-rose/60">
            {item.icon}
            {item.label}
            <span className="ml-auto text-[10px] uppercase tracking-[0.1em]">Soon</span>
          </span>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors ${
              pathname.startsWith(item.href) ? "bg-blush font-medium text-cherry" : "text-rose hover:bg-shell hover:text-wine"
            }`}
          >
            {item.icon}
            {item.label}
            {!!item.count && <span className="ml-auto rounded-full bg-cherry px-2 text-[11px] font-semibold text-white">{item.count}</span>}
          </Link>
        ),
      )}
    </nav>
  );
}
