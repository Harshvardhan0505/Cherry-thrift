import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AuthForms";
import { staffCount } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin log in",
};

export default function AdminLoginPage() {
  return (
    <>
      <h1 className="font-serif text-4xl text-wine">Log in</h1>
      <p className="mt-1 text-sm text-rose">For the Cherry Thrifts team.</p>
      <AdminLoginForm />
      <Suspense>
        <SetupHint />
      </Suspense>
    </>
  );
}

// Before anyone has an account, point the owner to setup.
async function SetupHint() {
  if ((await staffCount()) > 0) return null;
  return (
    <p className="mt-6 border-t border-seam pt-5 text-sm text-rose">
      First time here?{" "}
      <Link href="/admin/setup" className="font-medium text-cherry underline underline-offset-4">
        Set up the owner account
      </Link>
    </p>
  );
}
