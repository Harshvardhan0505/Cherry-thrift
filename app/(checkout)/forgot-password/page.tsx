import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/AccountForms";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      {/* The form reads where to go next from the URL. */}
      <Suspense fallback={<div className="min-h-[420px]" />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
