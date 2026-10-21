"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  completePasswordReset,
  createPasswordReset,
  endSession,
  hashPassword,
  startSession,
  verifyPassword,
} from "./auth";
import { resetPasswordEmail, sendEmail } from "./email";
import { supabase } from "./supabase";

export type AccountFormState = {
  error?: string;
  // Set once a reset link has been asked for.
  sent?: boolean;
  // What was typed, so a mistake doesn't wipe the form. Never the password.
  values?: Record<string, string>;
};

// Only paths on this site, so a crafted link can't send shoppers elsewhere
// after they sign in.
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

// Accepts 98765 43210, +91 98765 43210 or 098765 43210.
function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export async function signUp(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const name = text(form, "name").slice(0, 100);
  const phone = normalizePhone(text(form, "phone"));
  const email = text(form, "email").toLowerCase().slice(0, 200);
  const password = String(form.get("password") ?? "");
  const values = { name, phone, email };

  if (!name) return { error: "Please add your name.", values };
  if (!/^[6-9][0-9]{9}$/.test(phone)) return { error: "Please enter a 10-digit mobile number.", values };
  if (!email) return { error: "Please add your email.", values };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please check your email address.", values };
  if (password.length < 8) return { error: "Please use a password of at least 8 characters.", values };
  if (password.length > 200) return { error: "That password is too long.", values };

  const { data, error } = await supabase()
    .from("customers")
    .insert({ name, phone, email, password_hash: await hashPassword(password) })
    .select("id")
    .single();
  if (error) {
    // Unique phone or email already taken.
    if (error.code === "23505") {
      return {
        error: error.message.includes("email")
          ? "This email already has an account. Log in instead?"
          : "This number already has an account. Log in instead?",
        values,
      };
    }
    console.error("Couldn't create account", error);
    return { error: "We couldn't create your account just now. Please try again.", values };
  }

  await startSession(data.id, form.get("remember") === "on");
  redirect(safeNext(form.get("next")));
}

// Compared against when no account matches, so a wrong number takes as long
// to reject as a wrong password.
let decoyHash: Promise<string> | null = null;

export async function logIn(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const login = text(form, "login");
  const password = String(form.get("password") ?? "");
  const values = { login };
  if (!login || !password) return { error: "Please enter your phone or email and password.", values };

  const query = supabase().from("customers").select("id, password_hash");
  const { data, error } = await (login.includes("@")
    ? query.eq("email", login.toLowerCase())
    : query.eq("phone", normalizePhone(login))
  ).maybeSingle();
  if (error) {
    console.error("Couldn't look up account", error);
    return { error: "We couldn't log you in just now. Please try again.", values };
  }

  decoyHash ??= hashPassword("not-a-real-password");
  const matches = await verifyPassword(password, data?.password_hash ?? (await decoyHash));
  if (!data || !matches) {
    return { error: "That phone or email and password don't match. Please try again.", values };
  }

  await startSession(data.id, form.get("remember") === "on");
  redirect(safeNext(form.get("next")));
}

export async function logOut() {
  await endSession();
  redirect("/");
}

// The site's own address, for links in emails. Never taken from the request
// in production: a forged Host header would otherwise send shoppers' reset
// links to someone else's site.
async function siteUrl(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.NODE_ENV === "production") throw new Error("SITE_URL must be set to send reset links.");
  const host = (await headers()).get("host") ?? "localhost:5173";
  return `http://${host}`;
}

// Emails a reset link to the account's email. The reply is the same whether or
// not an account matched, so the form can't be used to find out who shops here.
export async function requestPasswordReset(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const login = text(form, "login");
  const values = { login };
  if (!login) return { error: "Please enter your phone or email.", values };

  try {
    const query = supabase().from("customers").select("id, name, email");
    const { data: customer, error } = await (login.includes("@")
      ? query.eq("email", login.toLowerCase())
      : query.eq("phone", normalizePhone(login))
    ).maybeSingle();
    if (error) throw error;

    if (customer?.email) {
      const token = await createPasswordReset(customer.id);
      if (token) {
        const email = resetPasswordEmail(customer.name, `${await siteUrl()}/reset-password?token=${token}`);
        await sendEmail({ to: customer.email, ...email });
      }
    }
  } catch (error) {
    console.error("Couldn't send reset link", error);
    return { error: "We couldn't send the link just now. Please try again in a moment.", values };
  }
  return { sent: true, values };
}

export async function resetPassword(_: AccountFormState, form: FormData): Promise<AccountFormState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "Please use a password of at least 8 characters." };
  if (password.length > 200) return { error: "That password is too long." };

  let customerId: string | null;
  try {
    customerId = await completePasswordReset(token, password);
  } catch (error) {
    console.error("Couldn't reset password", error);
    return { error: "We couldn't save your new password just now. Please try again." };
  }
  if (!customerId) return { error: "This link has expired or was already used. Please ask for a new one." };

  await startSession(customerId, form.get("remember") === "on");
  redirect("/orders");
}
