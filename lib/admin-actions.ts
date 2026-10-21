"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getStaff, startStaffSession, endStaffSession, staffCount, temporaryPassword, type Staff } from "./admin-auth";
import { createPasswordReset, hashPassword, verifyPassword } from "./auth";
import { COURIERS, indiaPostNumber, isOrderStatus, type OrderStatus } from "./order-status";
import { siteUrl } from "./site-url";
import { supabase } from "./supabase";

export type AdminFormState = { error?: string; done?: boolean; values?: Record<string, string> };

const text = (form: FormData, name: string, max = 200) => String(form.get(name) ?? "").trim().slice(0, max);
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Every action checks the session itself: they can be called directly, not
// just from the admin pages.
async function staffOrThrow(role?: "owner"): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) throw new Error("Not signed in to the admin panel.");
  if (role === "owner" && staff.role !== "owner") throw new Error("Only the owner can do that.");
  return staff;
}

async function logEvent(orderId: string, staff: Staff, message: string) {
  const { error } = await supabase()
    .from("order_events")
    .insert({ order_id: orderId, staff_id: staff.id, staff_name: staff.name, message });
  if (error) throw error;
}

// Signing in

let decoyHash: Promise<string> | null = null;

export async function adminLogIn(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const values = { email };
  if (!email || !password) return { error: "Please enter your email and password.", values };

  const { data, error } = await supabase().from("staff").select("id, password_hash").eq("email", email).maybeSingle();
  if (error) {
    console.error("Couldn't look up staff", error);
    return { error: "We couldn't log you in just now. Please try again.", values };
  }
  decoyHash ??= hashPassword("not-a-real-password");
  const matches = await verifyPassword(password, data?.password_hash ?? (await decoyHash));
  if (!data || !matches) return { error: "That email and password don't match.", values };

  await startStaffSession(data.id);
  redirect("/admin/orders");
}

// The very first account, made by the owner. Closed once anyone exists.
export async function setUpOwner(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  if ((await staffCount()) > 0) return { error: "The admin panel is already set up. Please log in." };
  const name = text(form, "name", 100);
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  const values = { name, email };
  if (!name) return { error: "Please add your name.", values };
  if (!isEmail(email)) return { error: "Please check your email address.", values };
  if (password.length < 10) return { error: "Please use a password of at least 10 characters.", values };

  const { data, error } = await supabase()
    .from("staff")
    .insert({ name, email, role: "owner", password_hash: await hashPassword(password) })
    .select("id")
    .single();
  if (error) {
    console.error("Couldn't create owner", error);
    return { error: "We couldn't set up your account just now. Please try again.", values };
  }
  await startStaffSession(data.id);
  redirect("/admin/orders");
}

export async function adminLogOut() {
  await endStaffSession();
  redirect("/admin/login");
}

// Orders

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  placed: "Moved back to New",
  confirmed: "Confirmed",
  shipped: "Marked shipped",
  in_transit: "Marked in transit",
  delivered: "Marked delivered",
  cancelled: "Cancelled",
};

export async function setOrderStatus(orderId: string, status: string) {
  const staff = await staffOrThrow();
  if (!isOrderStatus(status)) throw new Error(`Unknown status: ${status}`);
  const { data, error } = await supabase().from("orders").update({ status }).eq("id", orderId).select("id");
  if (error) throw error;
  if (data.length === 0) throw new Error("Order not found.");
  await logEvent(orderId, staff, STATUS_MESSAGES[status]);
  refresh();
}

export async function setOrderPaid(orderId: string, paid: boolean) {
  const staff = await staffOrThrow();
  const { error } = await supabase().from("orders").update({ paid }).eq("id", orderId);
  if (error) throw error;
  await logEvent(orderId, staff, paid ? "Marked paid" : "Marked not paid");
  refresh();
}

export async function saveShipping(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  const staff = await staffOrThrow();
  const orderId = text(form, "orderId");
  const courier = text(form, "courier");
  let tracking = text(form, "tracking", 60);
  if (courier && !(courier in COURIERS)) return { error: "Please pick a courier from the list." };
  if (tracking && courier === "India Post") {
    const checked = indiaPostNumber(tracking);
    if (!checked) {
      return { error: "India Post numbers look like EE123456789IN: 2 letters, 9 digits, 2 letters." };
    }
    tracking = checked;
  }
  const { error } = await supabase()
    .from("orders")
    .update({ courier: courier || null, tracking_number: tracking || null })
    .eq("id", orderId);
  if (error) {
    console.error("Couldn't save shipping", error);
    return { error: "Couldn't save. Please try again." };
  }
  await logEvent(orderId, staff, tracking ? `Tracking added: ${courier || "courier"} ${tracking}` : "Tracking removed");
  refresh();
  return { done: true };
}

export async function saveNotes(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  await staffOrThrow();
  const orderId = text(form, "orderId");
  const notes = String(form.get("notes") ?? "").trim().slice(0, 2000);
  const { error } = await supabase().from("orders").update({ notes: notes || null }).eq("id", orderId);
  if (error) {
    console.error("Couldn't save notes", error);
    return { error: "Couldn't save. Please try again." };
  }
  refresh();
  return { done: true };
}

// Customers

// A one-day password reset link for a customer, to send them on WhatsApp.
export async function customerResetLink(customerId: string): Promise<{ link: string }> {
  await staffOrThrow("owner");
  const token = await createPasswordReset(customerId, { minutes: 24 * 60, fromTeam: true });
  if (!token) throw new Error("Couldn't make a reset link.");
  return { link: `${await siteUrl()}/reset-password?token=${token}` };
}

// The team

export async function addHelper(
  _: AdminFormState & { password?: string },
  form: FormData,
): Promise<AdminFormState & { password?: string }> {
  await staffOrThrow("owner");
  const name = text(form, "name", 100);
  const email = text(form, "email").toLowerCase();
  const values = { name, email };
  if (!name) return { error: "Please add their name.", values };
  if (!isEmail(email)) return { error: "Please check their email address.", values };

  const password = temporaryPassword();
  const { error } = await supabase()
    .from("staff")
    .insert({ name, email, role: "helper", password_hash: await hashPassword(password) });
  if (error) {
    if (error.code === "23505") return { error: "Someone on the team already uses that email.", values };
    console.error("Couldn't add helper", error);
    return { error: "Couldn't add them just now. Please try again.", values };
  }
  refresh();
  return { done: true, password, values };
}

export async function removeHelper(staffId: string) {
  const owner = await staffOrThrow("owner");
  if (staffId === owner.id) throw new Error("You can't remove yourself.");
  // Only helpers can be removed; their sign-ins go with them.
  const { error } = await supabase().from("staff").delete().eq("id", staffId).eq("role", "helper");
  if (error) throw error;
  refresh();
}

export async function resetHelperPassword(staffId: string): Promise<{ password: string }> {
  await staffOrThrow("owner");
  const password = temporaryPassword();
  const db = supabase();
  const { data, error } = await db
    .from("staff")
    .update({ password_hash: await hashPassword(password) })
    .eq("id", staffId)
    .eq("role", "helper")
    .select("id");
  if (error) throw error;
  if (data.length === 0) throw new Error("Helper not found.");
  const signedOut = await db.from("staff_sessions").delete().eq("staff_id", staffId);
  if (signedOut.error) throw signedOut.error;
  return { password };
}

// Staff change their own password (helpers start with a temporary one).
export async function changeOwnPassword(_: AdminFormState, form: FormData): Promise<AdminFormState> {
  const staff = await staffOrThrow();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("password") ?? "");
  if (next.length < 10) return { error: "Please use a new password of at least 10 characters." };
  const db = supabase();
  const { data, error } = await db.from("staff").select("password_hash").eq("id", staff.id).single();
  if (error) throw error;
  if (!(await verifyPassword(current, data.password_hash))) return { error: "Your current password isn't right." };
  const updated = await db.from("staff").update({ password_hash: await hashPassword(next) }).eq("id", staff.id);
  if (updated.error) throw updated.error;
  return { done: true };
}

