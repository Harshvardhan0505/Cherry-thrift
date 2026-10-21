import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireStaff } from "@/lib/admin-auth";
import { adminLogOut } from "@/lib/admin-actions";
import { countNewOrders } from "@/lib/admin-data";

export const metadata: Metadata = {
  robots: { index: false },
};

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 bg-cream text-wine">
      <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r border-seam bg-white px-[18px] py-6 lg:flex">
        <Link href="/admin/orders" className="text-[15px] font-medium uppercase tracking-[0.2em] text-cherry">
          Cherry Thrifts
        </Link>
        <span className="mt-1.5 w-fit rounded-full bg-blush px-2.5 py-0.5 text-[11px] uppercase tracking-[0.12em] text-rose">Admin</span>
        <Suspense>
          <Nav variant="side" />
          <Me />
        </Suspense>
      </aside>
      <div className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</div>
      <Suspense>
        <Nav variant="bar" />
      </Suspense>
    </div>
  );
}

async function Nav({ variant }: { variant: "side" | "bar" }) {
  const [staff, newOrders] = await Promise.all([requireStaff(), countNewOrders()]);
  return <AdminNav role={staff.role} newOrders={newOrders} variant={variant} />;
}

async function Me() {
  const staff = await requireStaff();
  return (
    <div className="mt-auto border-t border-seam px-3 pt-4 text-[13px] text-rose">
      <Link href="/admin/account" className="block font-medium text-wine hover:text-cherry">
        {staff.name}
      </Link>
      <form action={adminLogOut}>
        {staff.role === "owner" ? "Owner" : "Helper"} ·{" "}
        <button type="submit" className="cursor-pointer underline-offset-4 hover:text-cherry hover:underline">
          Log out
        </button>
      </form>
    </div>
  );
}
