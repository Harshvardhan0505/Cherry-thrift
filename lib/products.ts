export const categories = [
  {
    slug: "tops",
    label: "Tops",
    blurb: "Baby tees, camis and long sleeves that go with everything.",
  },
  {
    slug: "skirts",
    label: "Skirts",
    blurb: "Long, pleated and mini skirts with plenty of twirl left in them.",
  },
  {
    slug: "purses",
    label: "Purses",
    blurb: "Shoulder bags and totes to finish the outfit.",
  },
  {
    slug: "jeans",
    label: "Jeans",
    blurb: "Straight and flared denim, already perfectly broken in.",
  },
] as const;

export type Category = (typeof categories)[number];
export type CategorySlug = Category["slug"];

export type Art = {
  kind:
    | "tee"
    | "cami"
    | "longsleeve"
    | "maxi"
    | "mini"
    | "pleated"
    | "shoulder"
    | "tote"
    | "straight"
    | "flare";
  color: string;
  pattern?: "dots" | "stripes";
  accent?: string;
};

export type Product = {
  id: string;
  category: CategorySlug;
  name: string;
  price: number;
  size: string;
  condition: "Like new" | "Excellent" | "Gently used" | "Good";
  note: string;
  art: Art;
};

const CHERRY = "#B5163F";
const WINE = "#6A1B36";
const ROSE = "#E8638A";
const PINK = "#F48FB1";
const BLUSH = "#F6BDCB";
const CREAM = "#FFF3E6";
const INK = "#2B1B22";

export const products: Product[] = [
  {
    id: "top-cherry-baby-tee",
    category: "tops",
    name: "Cherry Baby Tee",
    price: 349,
    size: "S · bust 32 in",
    condition: "Like new",
    note: "Soft cotton rib with a cropped, fitted cut.",
    art: { kind: "tee", color: CHERRY },
  },
  {
    id: "top-blush-cami",
    category: "tops",
    name: "Blush Satin Cami",
    price: 299,
    size: "XS–S · adjustable straps",
    condition: "Gently used",
    note: "Light satin that layers well under a shirt.",
    art: { kind: "cami", color: BLUSH },
  },
  {
    id: "top-rosewood-long-sleeve",
    category: "tops",
    name: "Rosewood Long Sleeve",
    price: 449,
    size: "M · bust 34 in",
    condition: "Like new",
    note: "Stretchy jersey, worn only a couple of times.",
    art: { kind: "longsleeve", color: "#8E2F4A" },
  },
  {
    id: "top-polka-tee",
    category: "tops",
    name: "Polka Dot Tee",
    price: 379,
    size: "M · bust 34 in",
    condition: "Excellent",
    note: "Relaxed fit with a bright white polka print.",
    art: { kind: "tee", color: ROSE, pattern: "dots" },
  },
  {
    id: "top-cream-cami",
    category: "tops",
    name: "Cream Ribbed Cami",
    price: 279,
    size: "S · bust 32 in",
    condition: "Like new",
    note: "Ribbed knit basic with no pilling.",
    art: { kind: "cami", color: CREAM },
  },
  {
    id: "top-bubblegum-stripe-tee",
    category: "tops",
    name: "Bubblegum Stripe Tee",
    price: 329,
    size: "L · bust 38 in",
    condition: "Good",
    note: "Oversized fit. Slight fading at the collar.",
    art: { kind: "tee", color: PINK, pattern: "stripes" },
  },
  {
    id: "top-wine-long-sleeve",
    category: "tops",
    name: "Wine Fitted Long Sleeve",
    price: 429,
    size: "S · bust 32 in",
    condition: "Excellent",
    note: "Deep wine colour with a close, flattering fit.",
    art: { kind: "longsleeve", color: WINE },
  },
  {
    id: "top-midnight-cami",
    category: "tops",
    name: "Midnight Cami",
    price: 299,
    size: "M · adjustable straps",
    condition: "Like new",
    note: "A plain black cami for nights out.",
    art: { kind: "cami", color: INK },
  },

  {
    id: "skirt-cherry-maxi",
    category: "skirts",
    name: "Cherry Maxi Skirt",
    price: 599,
    size: "S · waist 26 in · length 38 in",
    condition: "Like new",
    note: "Flowy cotton with an elastic back waist.",
    art: { kind: "maxi", color: CHERRY },
  },
  {
    id: "skirt-blush-pleated",
    category: "skirts",
    name: "Blush Pleated Midi",
    price: 549,
    size: "M · waist 28 in · length 30 in",
    condition: "Excellent",
    note: "Sharp pleats that have held their shape.",
    art: { kind: "pleated", color: "#F4B6C6" },
  },
  {
    id: "skirt-denim-mini",
    category: "skirts",
    name: "Denim Button Mini",
    price: 449,
    size: "S · waist 26 in · length 15 in",
    condition: "Gently used",
    note: "Mid-wash denim with a button front.",
    art: { kind: "mini", color: "#6F8FB3" },
  },
  {
    id: "skirt-polka-maxi",
    category: "skirts",
    name: "Polka Dot Maxi",
    price: 649,
    size: "M · waist 28 in · length 39 in",
    condition: "Like new",
    note: "Lined rayon with lots of swing.",
    art: { kind: "maxi", color: ROSE, pattern: "dots" },
  },
  {
    id: "skirt-wine-satin-maxi",
    category: "skirts",
    name: "Wine Satin Maxi",
    price: 699,
    size: "S · waist 26 in · length 40 in",
    condition: "Excellent",
    note: "Heavy satin with a soft sheen and a side zip.",
    art: { kind: "maxi", color: WINE },
  },
  {
    id: "skirt-cream-pleated",
    category: "skirts",
    name: "Cream Pleated Midi",
    price: 499,
    size: "L · waist 30 in · length 29 in",
    condition: "Like new",
    note: "Fully lined, with no marks or stains.",
    art: { kind: "pleated", color: CREAM },
  },
  {
    id: "skirt-rose-mini",
    category: "skirts",
    name: "Rose Button Mini",
    price: 399,
    size: "XS · waist 24 in · length 14 in",
    condition: "Good",
    note: "Corduroy mini. One replaced button.",
    art: { kind: "mini", color: "#D9567C" },
  },
  {
    id: "skirt-black-maxi",
    category: "skirts",
    name: "Black Everyday Maxi",
    price: 549,
    size: "M · waist 28 in · length 38 in",
    condition: "Excellent",
    note: "Jersey knit that doesn't crease.",
    art: { kind: "maxi", color: INK },
  },

  {
    id: "purse-cherry-shoulder",
    category: "purses",
    name: "Cherry Shoulder Bag",
    price: 799,
    size: "One size · 26 cm wide",
    condition: "Like new",
    note: "Faux leather with a gold clasp and clean lining.",
    art: { kind: "shoulder", color: CHERRY },
  },
  {
    id: "purse-blush-tote",
    category: "purses",
    name: "Blush Mini Tote",
    price: 499,
    size: "One size · 24 cm wide",
    condition: "Excellent",
    note: "Sturdy canvas that fits a book and a bottle.",
    art: { kind: "tote", color: BLUSH },
  },
  {
    id: "purse-cream-baguette",
    category: "purses",
    name: "Cream Baguette Bag",
    price: 699,
    size: "One size · 28 cm wide",
    condition: "Gently used",
    note: "Light scuffs on the base, clean inside.",
    art: { kind: "shoulder", color: CREAM },
  },
  {
    id: "purse-rose-tote",
    category: "purses",
    name: "Rose Canvas Tote",
    price: 349,
    size: "One size · 34 cm wide",
    condition: "Good",
    note: "Roomy everyday tote with an inner pocket.",
    art: { kind: "tote", color: ROSE },
  },
  {
    id: "purse-wine-shoulder",
    category: "purses",
    name: "Wine Shoulder Bag",
    price: 849,
    size: "One size · 27 cm wide",
    condition: "Like new",
    note: "Structured shape with a magnetic flap.",
    art: { kind: "shoulder", color: WINE },
  },
  {
    id: "purse-polka-tote",
    category: "purses",
    name: "Polka Dot Tote",
    price: 399,
    size: "One size · 32 cm wide",
    condition: "Excellent",
    note: "Cotton tote with a zip top.",
    art: { kind: "tote", color: PINK, pattern: "dots" },
  },
  {
    id: "purse-black-shoulder",
    category: "purses",
    name: "Black Shoulder Bag",
    price: 749,
    size: "One size · 25 cm wide",
    condition: "Excellent",
    note: "A classic shape that goes with everything.",
    art: { kind: "shoulder", color: INK },
  },
  {
    id: "purse-candy-stripe-tote",
    category: "purses",
    name: "Candy Stripe Tote",
    price: 379,
    size: "One size · 36 cm wide",
    condition: "Like new",
    note: "Striped canvas, big enough for a beach day.",
    art: { kind: "tote", color: CREAM, pattern: "stripes", accent: ROSE },
  },

  {
    id: "jeans-classic-straight",
    category: "jeans",
    name: "Classic Blue Straight",
    price: 699,
    size: "Waist 28 in · length 40 in",
    condition: "Excellent",
    note: "High-rise, straight leg, no stretch.",
    art: { kind: "straight", color: "#6F8FB3" },
  },
  {
    id: "jeans-light-flare",
    category: "jeans",
    name: "Light Wash Flare",
    price: 749,
    size: "Waist 26 in · length 41 in",
    condition: "Like new",
    note: "Seventies-style flare with a little stretch.",
    art: { kind: "flare", color: "#A9C3DE" },
  },
  {
    id: "jeans-pink-flare",
    category: "jeans",
    name: "Pink Flare Jeans",
    price: 799,
    size: "Waist 28 in · length 40 in",
    condition: "Like new",
    note: "Dyed denim that hasn't faded.",
    art: { kind: "flare", color: "#F29CB4" },
  },
  {
    id: "jeans-black-straight",
    category: "jeans",
    name: "Black Straight Jeans",
    price: 649,
    size: "Waist 30 in · length 39 in",
    condition: "Gently used",
    note: "Mid-rise. Slightly softened at the knees.",
    art: { kind: "straight", color: INK },
  },
  {
    id: "jeans-indigo-flare",
    category: "jeans",
    name: "Indigo Flare",
    price: 799,
    size: "Waist 27 in · length 42 in",
    condition: "Excellent",
    note: "Dark rinse with a long inseam.",
    art: { kind: "flare", color: "#3F5A85" },
  },
  {
    id: "jeans-cream-straight",
    category: "jeans",
    name: "Cream Straight Jeans",
    price: 699,
    size: "Waist 28 in · length 39 in",
    condition: "Like new",
    note: "Off-white denim with no marks.",
    art: { kind: "straight", color: CREAM },
  },
  {
    id: "jeans-cherry-straight",
    category: "jeans",
    name: "Cherry Straight Jeans",
    price: 749,
    size: "Waist 26 in · length 38 in",
    condition: "Excellent",
    note: "A bold red pair with a cropped ankle.",
    art: { kind: "straight", color: CHERRY },
  },
  {
    id: "jeans-vintage-straight",
    category: "jeans",
    name: "Vintage Mid Wash",
    price: 599,
    size: "Waist 32 in · length 40 in",
    condition: "Good",
    note: "Relaxed fit with natural fading on the thighs.",
    art: { kind: "straight", color: "#86A3C4" },
  },
];

export function getProducts(slug: CategorySlug): Product[] {
  return products.filter((product) => product.category === slug);
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}
