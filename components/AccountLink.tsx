import { cookies } from "next/headers";
import Link from "next/link";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { MarkActive } from "./MarkActive";

// "Orders" once signed in, "Log in" before. Phones get an icon instead, so the
// header stays on one line. Only checks for the sign-in cookie; the orders
// page checks the session itself.
export async function AccountLink({ className, iconClass = "" }: { className?: string; iconClass?: string }) {
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const icon = `size-6 sm:hidden ${iconClass}`;
  return signedIn ? (
    <Link href="/orders" aria-label="Your orders" className={className}>
      <MarkActive />
      <span aria-hidden="true" className="hidden sm:inline">
        Orders
      </span>
      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" aria-hidden="true">
        <path d="M4 8l8-4 8 4v8l-8 4-8-4V8Z" />
        <path d="M4 8l8 4 8-4M12 12v8" />
      </svg>
    </Link>
  ) : (
    <Link href="/login" aria-label="Log in" className={className}>
      <span aria-hidden="true" className="hidden sm:inline">
        Log in
      </span>
      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
      </svg>
    </Link>
  );
}
