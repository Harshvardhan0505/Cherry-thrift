import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/AccountForms";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <AuthShell>
      {/* The form reads where to go next from the URL, and its greeting from
          this browser's history. */}
      <Suspense fallback={<div className="min-h-[520px]" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
