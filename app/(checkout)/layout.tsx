import Link from "next/link";
import { CartButton } from "@/components/CartButton";
import { site } from "@/lib/site";

// Checkout, log in and sign up keep shoppers focused: just the store name
// (back to the home page) and the cart, without the full menu or footer.
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-petal bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-6 py-6 sm:py-7">
          <span aria-hidden="true" />
          <Link
            href="/"
            className="text-xl font-medium uppercase tracking-[0.22em] text-cherry transition-colors hover:text-wine sm:text-2xl"
          >
            {site.name}
          </Link>
          <div className="flex justify-end">
            <CartButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
