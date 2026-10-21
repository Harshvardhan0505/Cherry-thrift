import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ADMIN_COOKIE } from "./session-cookie";
import { supabase } from "./supabase";

export type StaffRole = "owner" | "helper";
export type Staff = { id: string; name: string; email: string; role: StaffRole };

// Team members stay signed in for two weeks on a device.
const SESSION_DAYS = 14;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function startStaffSession(staffId: string) {
  const token = randomBytes(32).toString("base64url");
  const lifetime = SESSION_DAYS * 24 * 60 * 60;
  const { error } = await supabase()
    .from("staff_sessions")
    .insert({
      token_hash: hashToken(token),
      staff_id: staffId,
      expires_at: new Date(Date.now() + lifetime * 1000).toISOString(),
    });
  if (error) throw error;
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: lifetime,
  });
}

export async function endStaffSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) await supabase().from("staff_sessions").delete().eq("token_hash", hashToken(token));
  store.delete({ name: ADMIN_COOKIE, path: "/admin" });
}

// The signed-in team member, or null. Read once per request.
export const getStaff = cache(async (): Promise<Staff | null> => {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const { data, error } = await supabase()
    .from("staff_sessions")
    .select("expires_at, staff (id, name, email, role)")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (error) throw error;
  if (!data || new Date(data.expires_at) < new Date()) return null;
  return data.staff as unknown as Staff | null;
});

// For admin pages: the signed-in team member, or off to log in. Pages only
// the owner may see send helpers back to the orders.
export async function requireStaff(role?: "owner"): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login");
  if (role === "owner" && staff.role !== "owner") redirect("/admin/orders");
  return staff;
}

export async function staffCount(): Promise<number> {
  const { count, error } = await supabase().from("staff").select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

// A temporary password to hand over, e.g. "k7mq-2fp9-xt4r": easy to read
// out, with no look-alike characters.
export function temporaryPassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  const chars = [...bytes].map((byte) => alphabet[byte % alphabet.length]);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 12)].map((group) => group.join("")).join("-");
}
