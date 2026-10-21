import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/AccountForms";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignupPage() {
  return (
    <AuthShell>
      {/* The form reads where to go next from the URL. */}
      <Suspense fallback={<div className="min-h-[640px]" />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
