import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { HeartIcon } from "@/components/HeartIcon";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Send your Cherry Thrifts order to us on WhatsApp.",
};

export default function CheckoutPage() {
  return (
    <div className="px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <header className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-cherry">
          Your little haul
          <HeartIcon className="size-4" />
        </p>
        <h1 className="mt-3 font-serif text-5xl text-wine sm:text-6xl">Let&apos;s make it yours.</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-rose">
          <span className="inline-flex items-center gap-1.5 sm:hidden">
            Just one more little step
            <HeartIcon className="size-4" />
          </span>
          <span className="hidden sm:inline">
            Just a few details and these lovelies are on their way.
          </span>
        </p>
      </header>
      <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
        <CheckoutForm />
      </div>
    </div>
  );
}
