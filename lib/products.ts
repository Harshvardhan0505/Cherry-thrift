export const categories = [
  {
    slug: "tops",
    label: "Tops",
    blurb: "Corsets, camis, halters and crop tops for going out.",
  },
  {
    slug: "skirts",
    label: "Skirts",
    blurb: "Long skirts in tiers, prints and solids, with plenty of twirl left in them.",
  },
  {
    slug: "purses",
    label: "Purses",
    blurb: "Handbags and totes to finish the outfit.",
  },
] as const;

export type Category = (typeof categories)[number];
export type CategorySlug = Category["slug"];

// The pieces themselves live in Sanity (see lib/catalog.ts); this file keeps
// their shape and the shop's fixed categories.

// What the cart's recommendation looks at when matching pieces (see
// lib/recommend.ts). `colour` is the main colour family of the piece.
export type Colour =
  | "white"
  | "cream"
  | "black"
  | "beige"
  | "brown"
  | "denim"
  | "burgundy"
  | "red"
  | "pink"
  | "lavender"
  | "light blue"
  | "navy"
  | "sage"
  | "yellow"
  | "teal";
export type Style = "boho" | "romantic" | "going-out" | "casual" | "edgy" | "classic";
export type Fit = "fitted" | "flowy" | "structured";

// The choices offered when adding a piece (they match the Sanity form).
export const COLOURS: Colour[] = [
  "white", "cream", "black", "beige", "brown", "denim", "burgundy", "red",
  "pink", "lavender", "light blue", "navy", "sage", "yellow", "teal",
];
export const STYLES: { value: Style; label: string }[] = [
  { value: "boho", label: "Boho" },
  { value: "romantic", label: "Romantic" },
  { value: "going-out", label: "Going out" },
  { value: "casual", label: "Casual" },
  { value: "edgy", label: "Edgy" },
  { value: "classic", label: "Classic" },
];
export const FITS: Fit[] = ["fitted", "flowy", "structured"];
export const SIZES = ["XS", "S", "M", "Free size"];

export type Product = {
  id: string;
  category: CategorySlug;
  name: string;
  price: number;
  // Sizes this piece can be ordered in. Leave out to use the category's list.
  sizes?: string[];
  colour: Colour;
  styles: Style[];
  fit: Fit;
  // Optional hand-picked matches (product ids), tried before the automatic match.
  pairsWith?: string[];
  // The main photo's address, a description of it for screen readers, and a
  // tiny blurred copy to show while it loads.
  image: string;
  alt: string;
  lqip?: string;
  // In someone's order already (every piece is one of a kind).
  sold?: boolean;
};


const categorySizes: Record<CategorySlug, string[]> = {
  tops: ["XS", "S", "M", "Free size"],
  skirts: ["XS", "S", "M", "Free size"],
  purses: ["Free size"],
};

export function getSizes(product: Product): string[] {
  return product.sizes ?? categorySizes[product.category];
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}
