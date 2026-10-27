import "server-only";
import { sanity } from "./sanity";

// Sanity with permission to change things, for the admin panel's Pieces
// section. The token is secret: it lives only in .env.local and Vercel.
export const hasSanityWriteToken = () => Boolean(process.env.SANITY_WRITE_TOKEN);

export function sanityWriter() {
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) throw new Error("SANITY_WRITE_TOKEN must be set to change pieces.");
  return sanity.withConfig({ token, useCdn: false });
}
