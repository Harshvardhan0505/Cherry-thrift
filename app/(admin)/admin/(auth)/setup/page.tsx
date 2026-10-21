import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SetupForm } from "@/components/admin/AuthForms";
import { staffCount } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin setup",
};

export default function AdminSetupPage() {
  return (
    <>
      <h1 className="font-serif text-4xl text-wine">Welcome</h1>
      <p className="mt-1 text-sm text-rose">Create the owner account. This page closes once it&apos;s done.</p>
      <Suspense>
        <Setup />
      </Suspense>
    </>
  );
}

async function Setup() {
  if ((await staffCount()) > 0) redirect("/admin/login");
  return <SetupForm />;
}
