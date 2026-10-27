import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getSizes, type Product } from "./products";
import { sanity, urlFor } from "./sanity";
import { supabase } from "./supabase";

// Every published piece with at least one photo that isn't hidden, newest
// first. The first
// photo is the one the shop shows, cropped to the cards' 4:5 around the
// focus point set in the Studio.
const PIECES_QUERY = `*[_type == "piece" && defined(slug.current) && defined(photos[0].asset) && hidden != true]
  | order(_createdAt desc, name asc) {
    "id": slug.current,
    name,
    category,
    price,
    sizes,
    colour,
    styles,
    fit,
    "pairsWith": pairsWith[]->slug.current,
    "photo": photos[0]{ asset, crop, hotspot, alt, "lqip": asset->metadata.lqip }
  }`;

type PieceRow = Omit<Product, "image" | "alt" | "lqip"> & {
  photo: { asset: { _ref: string }; alt?: string; lqip?: string };
};

function toProduct(row: PieceRow): Product {
  const { photo, ...piece } = row;
  const product: Product = {
    ...piece,
    styles: piece.styles ?? [],
    pairsWith: piece.pairsWith?.filter(Boolean),
    image: urlFor(photo).width(1200).height(1500).fit("crop").auto("format").url(),
    alt: photo.alt || piece.name,
    lqip: photo.lqip,
  };
  return { ...product, sizes: getSizes(product) };
}

// Cache tags: actions that sell or free a piece refresh SOLD_TAG, and ones
// that add or change a piece refresh PIECES_TAG, with updateTag.
export const SOLD_TAG = "sold";
export const PIECES_TAG = "pieces";

// The ids of pieces already in an order.
async function soldIds(): Promise<Set<string>> {
  const { data, error } = await supabase().from("sold_pieces").select("piece_id");
  if (error) throw error;
  return new Set(data.map((row) => row.piece_id));
}

// The catalogue for the shop's pages, with sold pieces marked and moved to
// the end. Refreshed about every minute, so a piece published in the Studio
// shows up shortly after; placing or cancelling an order refreshes it at once
// (see SOLD_TAG).
export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheTag(PIECES_TAG, SOLD_TAG);
  cacheLife("minutes");
  // Straight from Sanity rather than its CDN, so an edit saved in the admin
  // panel shows up as soon as this cache is refreshed.
  const [rows, sold] = await Promise.all([
    sanity.withConfig({ useCdn: false }).fetch<PieceRow[]>(PIECES_QUERY),
    soldIds(),
  ]);
  const products = rows.map((row) => ({ ...toProduct(row), sold: sold.has(row.id) }));
  return [...products.filter((product) => !product.sold), ...products.filter((product) => product.sold)];
}


// The very latest catalogue, straight from Sanity, for placing an order at
// today's prices.
export async function getFreshCatalog(): Promise<Product[]> {
  return (await sanity.withConfig({ useCdn: false }).fetch<PieceRow[]>(PIECES_QUERY)).map(toProduct);
}

export const findProduct = (catalog: Product[], id: string) => catalog.find((product) => product.id === id);
