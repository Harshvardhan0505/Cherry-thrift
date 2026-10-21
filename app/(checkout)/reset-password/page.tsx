import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetLinkExpired, ResetPasswordForm } from "@/components/AccountForms";
import { AuthShell } from "@/components/AuthShell";
import { findPasswordReset } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Choose a new password",
  // Reset links carry a secret token; keep them out of search results.
  robots: { index: false },
};

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthShell>
      <Suspense fallback={<div className="min-h-[420px]" />}>
        <Reset searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

// Checks the link before showing the form, so an old link says so straight away.
async function Reset({ searchParams }: { searchParams: PageProps<"/reset-password">["searchParams"] }) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";
  const reset = await findPasswordReset(value);
  return reset ? <ResetPasswordForm token={value} name={reset.name} /> : <ResetLinkExpired />;
}
