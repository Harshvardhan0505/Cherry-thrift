import "server-only";
import { headers } from "next/headers";

// The site's own address, for links in emails. Never taken from the request
// in production: a forged Host header would otherwise send shoppers' reset
// links to someone else's site.
export async function siteUrl(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.NODE_ENV === "production") throw new Error("SITE_URL must be set to send reset links.");
  const host = (await headers()).get("host") ?? "localhost:5173";
  return `http://${host}`;
}
