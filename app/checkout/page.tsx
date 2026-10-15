import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Send your Cherry Thrifts order to us on WhatsApp.",
};

export default function CheckoutPage() {
  return (
    <div className="px-[6vw] pb-32 pt-14">
      <header className="text-center">
        <h1 className="font-serif text-6xl text-cherry md:text-7xl">Checkout</h1>
        <p className="mt-4 text-wine/80">Tell us where to send it. No payment needed here.</p>
      </header>
      <div className="mx-auto mt-12 max-w-5xl">
        <CheckoutForm />
      </div>
    </div>
  );
}
