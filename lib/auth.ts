import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { SESSION_COOKIE } from "./session-cookie";
import { supabase } from "./supabase";

// Where a shopper's last delivery went, to fill in checkout next time.
export type SavedAddress = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  pin: string;
  city: string;
  state: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: SavedAddress | null;
};

// "Remember me" keeps a shopper signed in for a month. Otherwise the cookie
// goes when the browser closes, and the session can't outlive a day anyway.
const REMEMBERED_DAYS = 30;
const SESSION_HOURS = 24;

// Passwords: scrypt with a random salt, stored as "scrypt$salt$hash".
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await derive(password, Buffer.from(salt, "base64"));
  return key.length === expected.length && timingSafeEqual(key, expected);
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// Signs the shopper in on this browser.
export async function startSession(customerId: string, remember: boolean) {
  const token = randomBytes(32).toString("base64url");
  const lifetime = remember ? REMEMBERED_DAYS * 24 * 60 * 60 : SESSION_HOURS * 60 * 60;
  const { error } = await supabase()
    .from("sessions")
    .insert({
      token_hash: hashToken(token),
      customer_id: customerId,
      expires_at: new Date(Date.now() + lifetime * 1000).toISOString(),
    });
  if (error) throw error;

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Without a max age the browser drops the cookie when it closes.
    ...(remember ? { maxAge: lifetime } : {}),
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await supabase().from("sessions").delete().eq("token_hash", hashToken(token));
  store.delete(SESSION_COOKIE);
}

// The signed-in shopper, or null. Read once per request.
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { data, error } = await supabase()
    .from("sessions")
    .select("expires_at, customers (id, name, phone, email, address)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (error) throw error;
  if (!data || new Date(data.expires_at) < new Date()) return null;
  // One session belongs to one customer.
  const customer = data.customers as unknown as Customer | null;
  return customer;
});

// Forgotten passwords: a one-time link, valid for 30 minutes. As with
// sessions, only a hash of the link's token is stored.
const RESET_MINUTES = 30;

// A new reset link for the customer, or null if one was sent in the last
// minute (so the form can't be used to flood someone's inbox). The team can
// make links that last longer, to send on WhatsApp.
export async function createPasswordReset(
  customerId: string,
  { minutes = RESET_MINUTES, fromTeam = false }: { minutes?: number; fromTeam?: boolean } = {},
): Promise<string | null> {
  const db = supabase();
  if (!fromTeam) {
    const { data: recent, error: recentError } = await db
      .from("password_resets")
      .select("created_at")
      .eq("customer_id", customerId)
      .gt("created_at", new Date(Date.now() - 60_000).toISOString())
      .limit(1);
    if (recentError) throw recentError;
    if (recent.length > 0) return null;
  }

  const token = randomBytes(32).toString("base64url");
  const { error } = await db.from("password_resets").insert({
    token_hash: hashToken(token),
    customer_id: customerId,
    expires_at: new Date(Date.now() + minutes * 60_000).toISOString(),
  });
  if (error) throw error;
  return token;
}

// The account a reset link belongs to, if the link is still good.
export async function findPasswordReset(token: string): Promise<{ customerId: string; name: string } | null> {
  if (!token) return null;
  const { data, error } = await supabase()
    .from("password_resets")
    .select("customer_id, expires_at, used_at, customers (name)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (error) throw error;
  if (!data || data.used_at || new Date(data.expires_at) < new Date()) return null;
  const customer = data.customers as unknown as { name: string } | null;
  return { customerId: data.customer_id, name: customer?.name ?? "" };
}

// Sets the new password, uses up the link and signs the customer out
// everywhere else. Returns the customer's id, or null if the link was no good.
export async function completePasswordReset(token: string, password: string): Promise<string | null> {
  const reset = await findPasswordReset(token);
  if (!reset) return null;
  const db = supabase();
  // Claim the link first, so it can't be used twice at the same time.
  const { data: claimed, error: claimError } = await db
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", hashToken(token))
    .is("used_at", null)
    .select("customer_id");
  if (claimError) throw claimError;
  if (claimed.length === 0) return null;

  const updated = await db
    .from("customers")
    .update({ password_hash: await hashPassword(password) })
    .eq("id", reset.customerId);
  if (updated.error) throw updated.error;
  const signedOut = await db.from("sessions").delete().eq("customer_id", reset.customerId);
  if (signedOut.error) throw signedOut.error;
  return reset.customerId;
}
