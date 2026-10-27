"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import type { AdminPiece, PiecePhoto } from "@/lib/admin-pieces";
import { savePiece, setPieceHidden, uploadPiecePhoto } from "@/lib/piece-actions";
import { categories, COLOURS, FITS, SIZES, STYLES, type CategorySlug } from "@/lib/products";
import { adminInput, adminLabel, primaryButton, secondaryButton } from "./styles";

// Phone photos can be 5–10 MB; shrink them to at most 2000px on the long side
// before uploading, which keeps them sharp but well under the upload limit.
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("Couldn't read that photo.");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

const chip = (on: boolean) =>
  `cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cherry ${
    on ? "border-cherry bg-cherry text-white" : "border-seam bg-white text-wine hover:border-rose"
  }`;

type Uploading = { id: number; name: string };

export function PieceForm({ piece, canSave }: { piece?: AdminPiece; canSave: boolean }) {
  const [state, action, saving] = useActionState(savePiece, {});
  const [photos, setPhotos] = useState<PiecePhoto[]>(piece?.photos ?? []);
  const [uploading, setUploading] = useState<Uploading[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategorySlug | "">(piece?.category ?? "");
  const [sizes, setSizes] = useState<string[]>(piece?.sizes ?? []);
  const [styles, setStyles] = useState<string[]>(piece?.styles ?? []);
  const [fit, setFit] = useState(piece?.fit ?? "");
  const picker = useRef<HTMLInputElement>(null);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setUploadError(null);
    for (const file of Array.from(files)) {
      const id = Math.random();
      setUploading((list) => [...list, { id, name: file.name }]);
      try {
        const form = new FormData();
        form.append("photo", await shrink(file));
        const result = await uploadPiecePhoto(form);
        if ("error" in result) setUploadError(result.error);
        else setPhotos((list) => [...list, { assetId: result.assetId, preview: result.preview }]);
      } catch {
        setUploadError(`Couldn't read ${file.name}. Please try a JPG or PNG photo.`);
      } finally {
        setUploading((list) => list.filter((item) => item.id !== id));
      }
    }
    if (picker.current) picker.current.value = "";
  }

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  // Purses only come in one size: pick it for a new purse.
  function pickCategory(value: CategorySlug) {
    setCategory(value);
    if (!piece && value === "purses") setSizes(["Free size"]);
  }

  const busy = saving || uploading.length > 0;

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      {piece && <input type="hidden" name="id" value={piece.id} />}
      <input
        type="hidden"
        name="photos"
        value={JSON.stringify(photos.map((photo) => ({ key: photo.key, assetId: photo.assetId, alt: photo.alt })))}
      />

      <section className="rounded-[18px] border border-seam bg-white p-5">
        <h2 className="font-medium">Photos</h2>
        <p className="mt-0.5 text-[13px] text-rose">The first one is shown in the shop. Big photos are shrunk before upload.</p>
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <li key={photo.key ?? photo.assetId} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-petal">
                <Image src={photo.preview} alt="" fill sizes="160px" className="object-cover" />
              </div>
              {index === 0 ? (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cherry">
                  Main
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhotos((list) => [photo, ...list.filter((item) => item !== photo)])}
                  className="absolute left-1.5 top-1.5 cursor-pointer rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-wine hover:text-cherry"
                >
                  Make main
                </button>
              )}
              <button
                type="button"
                aria-label={`Remove photo ${index + 1}`}
                onClick={() => setPhotos((list) => list.filter((item) => item !== photo))}
                className="absolute right-1.5 top-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-white/90 text-sm text-wine hover:text-cherry"
              >
                ✕
              </button>
            </li>
          ))}
          {uploading.map((item) => (
            <li key={item.id} className="grid aspect-[4/5] place-items-center rounded-xl border border-dashed border-petal bg-shell p-2 text-center text-xs text-rose">
              Uploading…
            </li>
          ))}
          <li>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => picker.current?.click()}
              className="grid aspect-[4/5] w-full cursor-pointer place-items-center rounded-xl border border-dashed border-rose/50 bg-[#fffafb] text-sm text-rose transition-colors hover:border-cherry hover:text-cherry disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                <span aria-hidden="true" className="block text-2xl leading-none">+</span>
                Add photos
              </span>
            </button>
            <input
              ref={picker}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => addPhotos(event.target.files)}
            />
          </li>
        </ul>
        {uploadError && <p role="alert" className="mt-3 text-sm text-cherry">{uploadError}</p>}
        {photos.length > 0 && (
          <label className="mt-4 block">
            <span className={adminLabel}>Describe the main photo (optional)</span>
            <input
              value={photos[0].alt ?? ""}
              onChange={(event) =>
                setPhotos((list) => list.map((item, index) => (index === 0 ? { ...item, alt: event.target.value } : item)))
              }
              placeholder="e.g. Pink floral maxi skirt worn with white ballet flats"
              className={adminInput}
            />
            <span className="mt-1 block text-xs text-rose">Read out to shoppers who use screen readers.</span>
          </label>
        )}
      </section>

      <section className="grid gap-4 rounded-[18px] border border-seam bg-white p-5">
        <label>
          <span className={adminLabel}>Name</span>
          <input name="name" required maxLength={60} defaultValue={piece?.name} placeholder="e.g. Lilac Satin Slip Skirt" className={adminInput} />
        </label>

        <fieldset>
          <legend className={adminLabel}>Category</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((option) => (
              <label key={option.slug} className={chip(category === option.slug)}>
                <input
                  type="radio"
                  name="category"
                  value={option.slug}
                  required
                  checked={category === option.slug}
                  onChange={() => pickCategory(option.slug)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          <span className={adminLabel}>Price (₹)</span>
          <input
            name="price"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            defaultValue={piece?.price}
            placeholder="e.g. 599"
            className={`${adminInput} max-w-40`}
          />
        </label>

        <fieldset>
          <legend className={adminLabel}>Sizes it fits</legend>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <label key={size} className={chip(sizes.includes(size))}>
                <input
                  type="checkbox"
                  name="sizes"
                  value={size}
                  checked={sizes.includes(size)}
                  onChange={() => setSizes((list) => toggle(list, size))}
                  className="sr-only"
                />
                {size}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          <span className={adminLabel}>Main colour</span>
          <select name="colour" required defaultValue={piece?.colour ?? ""} className={`${adminInput} cursor-pointer`}>
            <option value="" disabled>
              Pick a colour…
            </option>
            {COLOURS.map((colour) => (
              <option key={colour} value={colour}>
                {colour[0].toUpperCase() + colour.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className={adminLabel}>Style (one or two)</legend>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((style) => (
              <label key={style.value} className={chip(styles.includes(style.value))}>
                <input
                  type="checkbox"
                  name="styles"
                  value={style.value}
                  checked={styles.includes(style.value)}
                  onChange={() => setStyles((list) => toggle(list, style.value))}
                  className="sr-only"
                />
                {style.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={adminLabel}>Fit</legend>
          <div className="flex flex-wrap gap-2">
            {FITS.map((option) => (
              <label key={option} className={`${chip(fit === option)} capitalize`}>
                <input
                  type="radio"
                  name="fit"
                  value={option}
                  required
                  checked={fit === option}
                  onChange={() => setFit(option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          <span className={adminLabel}>Description (optional)</span>
          <textarea name="description" rows={3} maxLength={1000} defaultValue={piece?.description} className={`${adminInput} resize-y`} />
        </label>

        {piece && (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" name="hidden" defaultChecked={piece.hidden} className="size-4 cursor-pointer accent-cherry" />
            Hide from shop
          </label>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-seam pt-4">
          <button type="submit" disabled={busy || !canSave} className={primaryButton}>
            {saving ? "Saving…" : uploading.length > 0 ? "Uploading photos…" : piece ? "Save changes" : "Add to shop"}
          </button>
          <Link href="/admin/pieces" className={secondaryButton}>
            Cancel
          </Link>
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-cherry">
            {state.error}
          </p>
        )}
      </section>
    </form>
  );
}

// Hide or show a piece from the list, without opening it.
export function HideToggle({ id, hidden, canSave }: { id: string; hidden: boolean; canSave: boolean }) {
  const [pending, startTransition] = useTransition();
  const [problem, setProblem] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        disabled={pending || !canSave}
        onClick={() => startTransition(async () => setProblem((await setPieceHidden(id, !hidden)).error ?? null))}
        className="cursor-pointer text-[13px] text-rose underline-offset-4 hover:text-cherry hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : hidden ? "Show in shop" : "Hide"}
      </button>
      {problem && <span className="w-full text-xs text-cherry">{problem}</span>}
    </>
  );
}
