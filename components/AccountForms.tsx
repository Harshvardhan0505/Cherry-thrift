"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState, useSyncExternalStore } from "react";
import { logIn, requestPasswordReset, resetPassword, signUp, type AccountFormState } from "@/lib/account-actions";
import { site } from "@/lib/site";
import { LAST_ACTIVE_KEY } from "./MarkActive";

const inputClass =
  "w-full rounded-2xl border border-seam bg-[#fffafb] px-[18px] py-3.5 text-wine placeholder:text-rose/50 transition focus:border-cherry focus:bg-white focus:outline-none focus:ring-4 focus:ring-cherry/8";
const buttonClass =
  "mt-[26px] w-full cursor-pointer rounded-full bg-cherry py-[17px] font-medium tracking-[0.02em] text-white shadow-[0_12px_24px_-14px_rgb(181_18_62/0.9)] transition-colors hover:bg-wine disabled:cursor-wait disabled:opacity-70";
const altLinkClass = "border-b border-petal font-medium text-wine transition-colors hover:text-cherry";

// Where to go after signing in: back to checkout when the cart sent them here.
function useNext() {
  return useSearchParams().get("next") ?? "/";
}

function withNext(path: string, next: string) {
  return next === "/" ? path : `${path}?next=${encodeURIComponent(next)}`;
}

function Tabs({ active, next }: { active: "login" | "signup"; next: string }) {
  const tab = (key: "login" | "signup", href: string, label: string) => (
    <Link
      href={withNext(href, next)}
      aria-current={active === key ? "page" : undefined}
      className={`relative pb-2.5 transition-colors ${active === key ? "font-medium text-cherry" : "text-rose hover:text-cherry"}`}
    >
      {label}
      {active === key && (
        // A hand-drawn underline ending in a tiny heart.
        <svg
          viewBox="0 0 56 10"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
          className="absolute -left-1 bottom-0 h-2.5 w-14"
        >
          <path d="M2 6c12-4 30-5 46-2" />
          <path d="M50 2.5c-1-1.6 1-3 2.3-1.6 1.3-1.4 3.3 0 2.3 1.6L52.3 5 50 2.5Z" fill="currentColor" strokeWidth={1} />
        </svg>
      )}
    </Link>
  );
  return (
    <nav aria-label="Log in or sign up" className="flex gap-[26px] text-[15px]">
      {tab("login", "/login", "log in")}
      {tab("signup", "/signup", "sign up")}
    </nav>
  );
}

function Heading({ children, sub }: { children: React.ReactNode; sub: string }) {
  return (
    <>
      <h1 className="mt-7 font-serif text-[48px] leading-[0.95] tracking-[-0.01em] text-wine sm:mt-[30px] sm:text-[58px]">
        {children}
      </h1>
      <p className="mt-3 font-light text-rose">{sub}</p>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-[22px] block">
      <span className="mb-[7px] ml-1 block text-[13px] text-rose">{label}</span>
      {children}
    </label>
  );
}

function PasswordInput({ autoComplete }: { autoComplete: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        name="password"
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={autoComplete === "new-password" ? 8 : undefined}
        className={`${inputClass} pr-16`}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-[18px] top-1/2 -translate-y-1/2 cursor-pointer text-[13px] text-rose hover:text-cherry"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

// A little switch rather than a tick box; still a checkbox underneath.
function RememberMe() {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" name="remember" defaultChecked className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-[22px] w-[38px] shrink-0 rounded-full bg-seam transition-colors after:absolute after:left-[3px] after:top-[3px] after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-cherry peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-cherry peer-focus-visible:ring-offset-2"
      />
      Remember me
    </label>
  );
}

function ErrorMessage({ state }: { state: AccountFormState }) {
  if (!state.error) return null;
  return (
    <p role="alert" className="mt-4 text-center text-sm text-cherry">
      {state.error}
    </p>
  );
}

// "welcome back" is for shoppers returning after a long break: they've been
// signed in on this browser before, but not for 90 hours.
const WELCOME_BACK_AFTER = 90 * 60 * 60 * 1000;

function isReturning(): boolean {
  try {
    const last = Number(window.localStorage.getItem(LAST_ACTIVE_KEY));
    return last > 0 && Date.now() - last >= WELCOME_BACK_AFTER;
  } catch {
    return false;
  }
}

const noSubscribe = () => () => {};

export function LoginForm() {
  const next = useNext();
  const returning = useSyncExternalStore(noSubscribe, isReturning, () => false);
  const [state, action, pending] = useActionState(logIn, {});

  return (
    <>
      <Tabs active="login" next={next} />
      <Heading
        sub={next.startsWith("/checkout") ? "log in to place your order ♡" : "your orders and details, all in one place ♡"}
      >
        {returning ? (
          <>
            welcome <em className="text-cherry">back</em>
          </>
        ) : (
          <>
            hello, <em className="text-cherry">lovely</em>
          </>
        )}
      </Heading>
      <form action={action}>
        <input type="hidden" name="next" value={next} />
        <Field label="Phone or email">
          <input name="login" autoComplete="username" required defaultValue={state.values?.login} className={inputClass} />
        </Field>
        <Field label="Password">
          <PasswordInput autoComplete="current-password" />
        </Field>
        <div className="mt-5 flex items-center justify-between gap-4">
          <RememberMe />
          <Link
            href={withNext("/forgot-password", next)}
            className="text-[13px] text-rose underline underline-offset-4 hover:text-cherry"
          >
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Logging in…" : "Log in"}
        </button>
        <ErrorMessage state={state} />
        <p className="mt-[22px] text-center text-sm text-rose">
          New here?{" "}
          <Link href={withNext("/signup", next)} className={altLinkClass}>
            Create an account
          </Link>
        </p>
      </form>
    </>
  );
}

export function SignupForm() {
  const next = useNext();
  const [state, action, pending] = useActionState(signUp, {});

  return (
    <>
      <Tabs active="signup" next={next} />
      <Heading sub={next.startsWith("/checkout") ? "create your account to place your order ♡" : "it only takes a minute ♡"}>
        hi, <em className="text-cherry">gorgeous</em>
      </Heading>
      <form action={action}>
        <input type="hidden" name="next" value={next} />
        <Field label="Name">
          <input name="name" autoComplete="name" required defaultValue={state.values?.name} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="10-digit mobile number"
            required
            defaultValue={state.values?.phone}
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            className={inputClass}
          />
          <span className="ml-1 mt-1.5 block text-xs text-rose">We&apos;ll use this if you ever forget your password.</span>
        </Field>
        <Field label="Password">
          <PasswordInput autoComplete="new-password" />
          <span className="ml-1 mt-1.5 block text-xs text-rose">At least 8 characters.</span>
        </Field>
        <div className="mt-5">
          <RememberMe />
        </div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Creating your account…" : "Create account"}
        </button>
        <ErrorMessage state={state} />
        <p className="mt-[22px] text-center text-sm text-rose">
          Already have an account?{" "}
          <Link href={withNext("/login", next)} className={altLinkClass}>
            Log in
          </Link>
        </p>
      </form>
    </>
  );
}

function BackToLogin({ next }: { next: string }) {
  return (
    <Link href={withNext("/login", next)} className="text-sm text-rose transition-colors hover:text-cherry">
      ← back to log in
    </Link>
  );
}

const whatsappHelp = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
  `Hi ${site.name}! I forgot my password and the reset email didn't reach me. Could you help?`,
)}`;

export function ForgotPasswordForm() {
  const next = useNext();
  const [state, action, pending] = useActionState(requestPasswordReset, {});

  if (state.sent) {
    return (
      <>
        <BackToLogin next={next} />
        <Heading sub="if that matches an account, a reset link is on its way to its email. it works for 30 minutes ♡">
          check your <em className="text-cherry">inbox</em>
        </Heading>
        <p className="mt-6 rounded-2xl bg-shell px-5 py-4 text-sm leading-relaxed text-rose">
          Nothing there? Check your spam folder, or try again in a minute.
        </p>
        <p className="mt-[22px] text-center text-sm text-rose">
          Still stuck?{" "}
          <a href={whatsappHelp} target="_blank" rel="noopener noreferrer" className={altLinkClass}>
            Message us on WhatsApp
          </a>
        </p>
      </>
    );
  }

  return (
    <>
      <BackToLogin next={next} />
      <Heading sub="enter your phone or email and we'll email you a link to choose a new password ♡">
        oops, <em className="text-cherry">it happens</em>
      </Heading>
      <form action={action}>
        <Field label="Phone or email">
          <input name="login" autoComplete="username" required defaultValue={state.values?.login} className={inputClass} />
        </Field>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Sending…" : "Send reset link"}
        </button>
        <ErrorMessage state={state} />
        <p className="mt-[22px] text-center text-sm text-rose">
          No email on your account?{" "}
          <a href={whatsappHelp} target="_blank" rel="noopener noreferrer" className={altLinkClass}>
            Message us
          </a>
        </p>
      </form>
    </>
  );
}

export function ResetPasswordForm({ token, name }: { token: string; name: string }) {
  const [state, action, pending] = useActionState(resetPassword, {});
  const first = name.split(/\s+/)[0];

  return (
    <>
      <Heading sub={`${first ? `hi ${first.toLowerCase()}, ` : ""}choose a new password for your account ♡`}>
        a fresh <em className="text-cherry">start</em>
      </Heading>
      <form action={action}>
        <input type="hidden" name="token" value={token} />
        <Field label="New password">
          <PasswordInput autoComplete="new-password" />
          <span className="ml-1 mt-1.5 block text-xs text-rose">At least 8 characters.</span>
        </Field>
        <div className="mt-5">
          <RememberMe />
        </div>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Save new password"}
        </button>
        <ErrorMessage state={state} />
        {state.error?.includes("expired") && (
          <p className="mt-3 text-center text-sm text-rose">
            <Link href="/forgot-password" className={altLinkClass}>
              Send a new link
            </Link>
          </p>
        )}
      </form>
    </>
  );
}

// Shown in place of the reset form when a link is too old or already used.
export function ResetLinkExpired() {
  return (
    <>
      <Heading sub="this link has expired or was already used. reset links only work once, for a short time ♡">
        oh <em className="text-cherry">no</em>
      </Heading>
      <Link href="/forgot-password" className={`${buttonClass} block text-center`}>
        Send a new link
      </Link>
      <p className="mt-[22px] text-center text-sm text-rose">
        Remembered it?{" "}
        <Link href="/login" className={altLinkClass}>
          Log in
        </Link>
      </p>
    </>
  );
}
