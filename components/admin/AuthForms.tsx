"use client";

import { useActionState } from "react";
import { adminLogIn, changeOwnPassword, setUpOwner, type AdminFormState } from "@/lib/admin-actions";
import { adminInput, adminLabel, primaryButton } from "./styles";

function FormError({ state }: { state: AdminFormState }) {
  if (!state.error) return null;
  return (
    <p role="alert" className="mt-4 text-sm text-cherry">
      {state.error}
    </p>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="mt-4 block">
      <span className={adminLabel}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-rose">{hint}</span>}
    </label>
  );
}

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLogIn, {});
  return (
    <form action={action}>
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required defaultValue={state.values?.email} className={adminInput} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={adminInput} />
      </Field>
      <button type="submit" disabled={pending} className={`${primaryButton} mt-6 w-full py-3`}>
        {pending ? "Logging in…" : "Log in"}
      </button>
      <FormError state={state} />
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setUpOwner, {});
  return (
    <form action={action}>
      <Field label="Your name">
        <input name="name" autoComplete="name" required defaultValue={state.values?.name} className={adminInput} />
      </Field>
      <Field label="Email" hint="You'll log in to the admin panel with this.">
        <input name="email" type="email" autoComplete="username" required defaultValue={state.values?.email} className={adminInput} />
      </Field>
      <Field label="Password" hint="At least 10 characters. Use one you don't use anywhere else.">
        <input name="password" type="password" autoComplete="new-password" required minLength={10} className={adminInput} />
      </Field>
      <button type="submit" disabled={pending} className={`${primaryButton} mt-6 w-full py-3`}>
        {pending ? "Setting up…" : "Create owner account"}
      </button>
      <FormError state={state} />
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changeOwnPassword, {});
  if (state.done) return <p className="text-sage-deep">Password changed ✓</p>;
  return (
    <form action={action} className="max-w-sm">
      <Field label="Current password">
        <input name="current" type="password" autoComplete="current-password" required className={adminInput} />
      </Field>
      <Field label="New password" hint="At least 10 characters.">
        <input name="password" type="password" autoComplete="new-password" required minLength={10} className={adminInput} />
      </Field>
      <button type="submit" disabled={pending} className={`${primaryButton} mt-6`}>
        {pending ? "Saving…" : "Change password"}
      </button>
      <FormError state={state} />
    </form>
  );
}
