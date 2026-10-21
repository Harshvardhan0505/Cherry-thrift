"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { addHelper, customerResetLink, removeHelper, resetHelperPassword } from "@/lib/admin-actions";
import { site } from "@/lib/site";
import { CopyButton } from "../CopyButton";
import { adminInput, adminLabel, primaryButton, secondaryButton } from "./styles";

const smallButton = `${secondaryButton} px-3.5 py-1.5 text-sm`;

export function CustomerSearch({ q }: { q: string }) {
  const router = useRouter();
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        router.push(value ? `/admin/customers?q=${encodeURIComponent(value)}` : "/admin/customers");
      }}
      className="w-full sm:w-72"
    >
      <input name="q" type="search" defaultValue={q} placeholder="Search name, phone or email" aria-label="Search customers" className={`${adminInput} bg-white`} />
    </form>
  );
}

// Makes a one-time link (good for a day) for the customer to choose a new
// password, ready to send on WhatsApp.
export function CustomerResetLink({ customerId, name, phone }: { customerId: string; name: string; phone: string }) {
  const [link, setLink] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (link) {
    const message = `Hi ${name.split(/\s+/)[0]}! Here's a link to choose a new ${site.name} password ♡ It works once, for 24 hours: ${link}`;
    return (
      <div className="mt-3 rounded-xl bg-shell p-3 text-sm">
        <p className="text-rose">Send this link to {name}. It works once, for 24 hours.</p>
        <p className="mt-1.5 break-all text-xs">{link}</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[#cfe9d8] bg-[#e8f5ec] px-3.5 py-1.5 font-medium text-[#1f7a45]"
          >
            Send on WhatsApp
          </a>
          <CopyButton text={link} label="Copy link" className={smallButton} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              setLink((await customerResetLink(customerId)).link);
            } catch {
              setFailed(true);
            }
          })
        }
        className={smallButton}
      >
        {pending ? "Making link…" : "Reset password"}
      </button>
      {failed && <p className="mt-1.5 text-xs text-cherry">Couldn&apos;t make a link. Please try again.</p>}
    </div>
  );
}

function TemporaryPassword({ name, password }: { name: string; password: string }) {
  return (
    <div className="mt-3 rounded-xl bg-shell p-3 text-sm">
      <p className="text-rose">
        Temporary password for {name}. Share it with them privately; it won&apos;t be shown again. They can change it
        under &ldquo;You&rdquo; after logging in.
      </p>
      <p className="mt-2 flex items-center gap-3">
        <span className="font-mono text-base tracking-wide text-wine">{password}</span>
        <CopyButton text={password} />
      </p>
    </div>
  );
}

export function AddHelperForm() {
  const [state, action, pending] = useActionState(addHelper, {});
  return (
    <form action={action}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className={adminLabel}>Name</span>
          <input name="name" required defaultValue={state.done ? "" : state.values?.name} className={adminInput} />
        </label>
        <label>
          <span className={adminLabel}>Email</span>
          <input name="email" type="email" required defaultValue={state.done ? "" : state.values?.email} className={adminInput} />
        </label>
      </div>
      <button type="submit" disabled={pending} className={`${primaryButton} mt-4`}>
        {pending ? "Adding…" : "Add helper"}
      </button>
      {state.error && <p className="mt-3 text-sm text-cherry">{state.error}</p>}
      {state.done && state.password && (
        <>
          <p className="mt-3 text-sm text-sage-deep">
            Added ✓ They log in at <span className="font-medium">/admin</span> with {state.values?.email}.
          </p>
          <TemporaryPassword name={state.values?.name ?? "them"} password={state.password} />
        </>
      )}
    </form>
  );
}

export function HelperActions({ staffId, name }: { staffId: string; name: string }) {
  const [password, setPassword] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => setPassword((await resetHelperPassword(staffId)).password))}
          className={smallButton}
        >
          Reset password
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm(`Remove ${name} from the team? They'll be logged out straight away.`)) {
              startTransition(() => removeHelper(staffId));
            }
          }}
          className={`${smallButton} text-rose`}
        >
          Remove
        </button>
      </div>
      {password && <TemporaryPassword name={name} password={password} />}
    </div>
  );
}
