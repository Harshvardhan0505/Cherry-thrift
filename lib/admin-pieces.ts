import "server-only";
import type { CategorySlug, Colour, Fit, Style } from "./products";
import { sanity, urlFor } from "./sanity";
import { supabase } from "./supabase";

// One photo as the admin form handles it: the Sanity image, a small preview,
// and (for photos already saved) the key that keeps its crop settings.
export type PiecePhoto = { key?: string; assetId: string; preview: string; alt?: string };

export type AdminPiece = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  sizes: string[];
  colour: Colour;
  styles: Style[];
  fit: Fit;
  description: string;
  hidden: boolean;
  photos: PiecePhoto[];
  createdAt: string;
};

export type AdminPieceRow = AdminPiece & {
  // The order it's in, if it's sold.
  sold: { orderId: string; number: number } | null;
};

const preview = (assetId: string) => urlFor({ asset: { _ref: assetId } }).width(320).height(400).fit("crop").auto("format").url();

const FIELDS = `
  _id,
  "slug": slug.current,
  name,
  category,
  price,
  sizes,
  colour,
  styles,
  fit,
  description,
  hidden,
  _createdAt,
  photos[]{ _key, alt, "assetId": asset._ref }
`;

type Row = {
  _id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  sizes?: string[];
  colour: Colour;
  styles?: Style[];
  fit: Fit;
  description?: string;
  hidden?: boolean;
  _createdAt: string;
  photos?: { _key: string; alt?: string; assetId?: string }[];
};

function toPiece(row: Row): AdminPiece {
  return {
    id: row._id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: row.price,
    sizes: row.sizes ?? [],
    colour: row.colour,
    styles: row.styles ?? [],
    fit: row.fit,
    description: row.description ?? "",
    hidden: row.hidden === true,
    createdAt: row._createdAt,
    photos: (row.photos ?? [])
      .filter((photo) => photo.assetId)
      .map((photo) => ({ key: photo._key, assetId: photo.assetId!, preview: preview(photo.assetId!), alt: photo.alt })),
  };
}

const fresh = () => sanity.withConfig({ useCdn: false });

// Every published piece, hidden ones too, newest first, with what's sold.
export async function listAdminPieces(): Promise<AdminPieceRow[]> {
  const [rows, { data: sold, error }] = await Promise.all([
    fresh().fetch<Row[]>(`*[_type == "piece" && defined(slug.current)] | order(_createdAt desc, name asc) { ${FIELDS} }`),
    supabase().from("sold_pieces").select("piece_id, orders (id, number)"),
  ]);
  if (error) throw error;
  const soldBy = new Map(
    sold.map((row) => {
      const order = row.orders as unknown as { id: string; number: number } | null;
      return [row.piece_id, order ? { orderId: order.id, number: order.number } : null];
    }),
  );
  return rows.map((row) => ({ ...toPiece(row), sold: soldBy.get(row.slug) ?? null }));
}

export async function getAdminPiece(id: string): Promise<AdminPiece | null> {
  if (!/^[\w.-]{1,128}$/.test(id) || id.startsWith("drafts.")) return null;
  const row = await fresh().fetch<Row | null>(`*[_type == "piece" && _id == $id][0]{ ${FIELDS} }`, { id });
  return row ? toPiece(row) : null;
}

export const piecePhotoPreview = preview;
