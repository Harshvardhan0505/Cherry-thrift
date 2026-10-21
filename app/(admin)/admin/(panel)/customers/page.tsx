import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CustomerResetLink, CustomerSearch } from "@/components/admin/PeopleControls";
import { panel } from "@/components/admin/styles";
import { requireStaff } from "@/lib/admin-auth";
import { listCustomers } from "@/lib/admin-data";
import { dateOf } from "@/lib/admin-format";
import { formatPrice } from "@/lib/products";

export const metadata: Metadata = {
  title: "Admin customers",
};

export default function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  return (
    <main className="px-4 py-5 sm:px-8 sm:py-7">
      <Suspense fallback={<p className="py-20 text-center text-rose">Loading customers…</p>}>
        <Customers searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Customers({ searchParams }: { searchParams: PageProps<"/admin/customers">["searchParams"] }) {
  const staff = await requireStaff();
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.slice(0, 80) : "";
  const customers = await listCustomers(search);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <h1 className="mr-auto font-serif text-[38px] leading-none">Customers</h1>
        <CustomerSearch q={search} />
      </div>
      <p className="mt-2 text-sm text-rose">
        {customers.length} {customers.length === 1 ? "customer" : "customers"}
        {search && ` matching “${search}”`}
      </p>

      {customers.length === 0 ? (
        <div className={`${panel} mt-4 px-6 py-14 text-center text-rose`}>
          {search ? "No customers match that search." : "No one has signed up yet."}
        </div>
      ) : (
        <ul className={`${panel} mt-4 divide-y divide-seam overflow-hidden`}>
          {customers.map((customer) => (
            <li key={customer.id} className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-4 sm:px-5">
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-medium">{customer.name}</p>
                <p className="text-[13px] text-rose">
                  {customer.phone}
                  {customer.email && ` · ${customer.email}`}
                </p>
                <p className="mt-0.5 text-xs text-rose">Joined {dateOf(customer.joined)}</p>
              </div>
              <div className="text-sm">
                <Link
                  href={`/admin/orders?q=${customer.phone}&range=all&status=placed`}
                  className="font-medium text-wine underline-offset-4 hover:text-cherry hover:underline"
                >
                  {customer.orders} {customer.orders === 1 ? "order" : "orders"}
                </Link>
                <p className="text-rose">{formatPrice(customer.spent)} spent</p>
              </div>
              {staff.role === "owner" && (
                <div className="w-full sm:w-auto">
                  <CustomerResetLink customerId={customer.id} name={customer.name} phone={customer.phone} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
