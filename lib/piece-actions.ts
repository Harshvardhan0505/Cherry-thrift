"use server";

import { randomUUID } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getStaff } from "./admin-auth";
import { getAdminPiece, piecePhotoPreview } from "./admin-pieces";
import { PIECES_TAG } from "./catalog";
import { categories, COLOURS, FITS, SIZES, STYLES } from "./products";
import { hasSanityWriteToken, sanityWriter } from "./sanity-write";

export type PieceFormState = { error?: string };

const NO_KEY = "Adding pieces needs the Sanity write key. See the note at the top of this page.";
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

// Like the other admin actions: these can be called directly, so each one
// checks for a team sign-in itself.
async function staffOrThrow() {
  const staff = await getStaff();
  if (!staff) throw new Error("Not signed in to the admin panel.");
  return staff;
}

// Uploads one photo to Sanity and returns it for the form. Photos are shrunk
// on the phone first, so each upload stays small.
export async function uploadPiecePhoto(
  form: FormData,
): Promise<{ assetId: string; preview: string } | { error: string }> {
  await staffOrThrow();
  if (!hasSanityWriteToken()) return { error: NO_KEY };
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Please choose a photo." };
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return { error: "Photos need to be JPG, PNG or WebP." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "That photo is too big. Please try a smaller one." };

  try {
    const asset = await sanityWriter().assets.upload("image", Buffer.from(await file.arrayBuffer()), {
      filename: file.name || "photo.jpg",
      contentType: file.type,
    });
    return { assetId: asset._id, preview: piecePhotoPreview(asset._id) };
  } catch (error) {
    console.error("Couldn't upload photo", error);
    return { error: "Couldn't upload that photo just now. Please try again." };
  }
}

// "Pink Floral Ruffle Maxi" → "pink-floral-ruffle-maxi".
const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "piece";

// A web name no other piece uses: "pink-maxi", then "pink-maxi-2", …
async function uniqueSlug(name: string): Promise<string> {
  const base = toSlug(name);
  const taken = new Set(
    await sanityWriter().fetch<string[]>(`*[_type == "piece" && slug.current match $pattern].slug.current`, {
      pattern: `${base}*`,
    }),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}

type SubmittedPhoto = { key?: string; assetId: string; alt?: string };

function readPhotos(value: FormDataEntryValue | null): SubmittedPhoto[] | null {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    if (!Array.isArray(parsed)) return null;
    return parsed
      .filter((photo) => typeof photo?.assetId === "string" && /^image-[\w-]+$/.test(photo.assetId))
      .slice(0, 12)
      .map((photo) => ({
        key: typeof photo.key === "string" ? photo.key : undefined,
        assetId: photo.assetId,
        alt: typeof photo.alt === "string" ? photo.alt.trim().slice(0, 200) : undefined,
      }));
  } catch {
    return null;
  }
}

export async function savePiece(_: PieceFormState, form: FormData): Promise<PieceFormState> {
  await staffOrThrow();
  if (!hasSanityWriteToken()) return { error: NO_KEY };

  const id = String(form.get("id") ?? "");
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const category = String(form.get("category") ?? "");
  const price = Number(form.get("price"));
  const sizes = SIZES.filter((size) => form.getAll("sizes").includes(size));
  const colour = String(form.get("colour") ?? "");
  const styles = STYLES.map((style) => style.value).filter((style) => form.getAll("styles").includes(style));
  const fit = String(form.get("fit") ?? "");
  const description = String(form.get("description") ?? "").trim().slice(0, 1000);
  const hidden = form.get("hidden") === "on";
  const photos = readPhotos(form.get("photos"));

  if (!name) return { error: "Please give the piece a name." };
  if (!categories.some((option) => option.slug === category)) return { error: "Please pick a category." };
  if (!Number.isInteger(price) || price < 1) return { error: "Please enter the price in whole rupees." };
  if (sizes.length === 0) return { error: "Please tick at least one size." };
  if (!(COLOURS as string[]).includes(colour)) return { error: "Please pick the main colour." };
  if (styles.length === 0) return { error: "Please pick at least one style." };
  if (!(FITS as string[]).includes(fit)) return { error: "Please pick the fit." };
  if (!photos || photos.length === 0) return { error: "Please add at least one photo." };

  const writer = sanityWriter();
  const existing = id ? await getAdminPiece(id) : null;
  if (id && !existing) return { error: "This piece no longer exists." };

  // Photos that were already saved keep their crop and focus point (set in
  // the Studio); new ones are added after.
  const current = id
    ? ((await writer.fetch<{ _key: string }[] | null>(`*[_id == $id][0].photos`, { id })) ?? [])
    : [];
  const photoValues = photos.map((photo, index) => {
    const kept = photo.key ? current.find((item) => item._key === photo.key) : undefined;
    const alt = photo.alt || (index === 0 ? name : `${name}, photo ${index + 1}`);
    return kept
      ? { ...kept, alt }
      : { _type: "image", _key: randomUUID().slice(0, 12), asset: { _type: "reference", _ref: photo.assetId }, alt };
  });

  const fields = {
    name,
    category,
    price,
    sizes,
    colour,
    styles,
    fit,
    description: description || undefined,
    hidden,
    photos: photoValues,
  };

  try {
    if (existing) {
      const patch = writer.patch(existing.id).set(fields);
      await (description ? patch : patch.unset(["description"])).commit();
    } else {
      await writer.create({
        _type: "piece",
        slug: { _type: "slug", current: await uniqueSlug(name) },
        ...fields,
      });
    }
  } catch (error) {
    console.error("Couldn't save piece", error);
    return { error: "Couldn't save the piece just now. Please try again." };
  }

  // Show it in the shop straight away.
  updateTag(PIECES_TAG);
  redirect(`/admin/pieces?saved=${encodeURIComponent(name)}`);
}

export async function setPieceHidden(id: string, hidden: boolean): Promise<{ error?: string }> {
  await staffOrThrow();
  if (!hasSanityWriteToken()) return { error: NO_KEY };
  if (!(await getAdminPiece(id))) return { error: "This piece no longer exists." };
  await sanityWriter().patch(id).set({ hidden }).commit();
  updateTag(PIECES_TAG);
  refresh();
  return {};
}
