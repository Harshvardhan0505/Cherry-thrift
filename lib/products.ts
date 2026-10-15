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
  // Path under /public, and a description of the photo for screen readers.
  image: string;
  alt: string;
};

// Placeholder catalogue. The photos are free stock images from Unsplash
// (see PHOTO_CREDITS.md); swap in real product shots and details.
export const products: Product[] = [
  {
    id: "top-cherry-corset",
    category: "tops",
    name: "Cherry Satin Corset Top",
    price: 549,
    colour: "red",
    styles: ["going-out", "romantic"],
    fit: "structured",
    image: "/photos/top-cherry-corset.jpg",
    alt: "Cherry red satin corset top with a lace-up front, worn with white jeans",
  },
  {
    id: "top-blue-cami",
    category: "tops",
    name: "Sky Blue Ribbed Cami",
    price: 299,
    colour: "light blue",
    styles: ["casual"],
    fit: "fitted",
    image: "/photos/top-blue-cami.jpg",
    alt: "Light blue ribbed cami crop top worn with white jeans",
  },
  {
    id: "top-lavender-halter",
    category: "tops",
    name: "Lavender Crochet Halter",
    price: 399,
    colour: "lavender",
    styles: ["boho"],
    fit: "fitted",
    image: "/photos/top-lavender-halter.jpg",
    alt: "Back view of a lavender crochet halter top tied at the neck and back, worn with white shorts",
  },
  {
    id: "top-beige-v",
    category: "tops",
    name: "Caramel V-Neck Crop",
    price: 329,
    colour: "beige",
    styles: ["casual", "boho"],
    fit: "fitted",
    image: "/photos/top-beige-v.jpg",
    alt: "Caramel ribbed V-neck crop top worn with a denim skirt",
  },
  {
    id: "top-white-asymmetric",
    category: "tops",
    name: "Ivory Asymmetric Rib Top",
    price: 449,
    colour: "white",
    styles: ["going-out", "edgy"],
    fit: "fitted",
    image: "/photos/top-white-asymmetric.jpg",
    alt: "Ivory ribbed one-shoulder top with a pointed asymmetric hem, worn with blue jeans",
  },
  {
    id: "top-pink-tank",
    category: "tops",
    name: "Pink Ribbed Tank",
    price: 279,
    colour: "pink",
    styles: ["casual"],
    fit: "fitted",
    image: "/photos/top-pink-tank.jpg",
    alt: "Pink ribbed high-neck tank top worn with white jeans",
  },
  {
    id: "top-white-button",
    category: "tops",
    name: "White Button Cami",
    price: 349,
    colour: "white",
    styles: ["romantic", "casual"],
    fit: "fitted",
    image: "/photos/top-white-button.jpg",
    alt: "White cami crop top with a snap-button front and frilled edge, worn with striped jeans",
  },
  {
    id: "top-sage-tank",
    category: "tops",
    name: "Sage Ribbed Tank",
    price: 299,
    colour: "sage",
    styles: ["casual", "boho"],
    fit: "fitted",
    image: "/photos/top-sage-tank.jpg",
    alt: "Sage green ribbed tank top worn with a printed skirt",
  },

  {
    id: "skirt-burgundy-tiered",
    category: "skirts",
    name: "Burgundy Tiered Maxi",
    price: 699,
    colour: "burgundy",
    styles: ["boho", "casual"],
    fit: "flowy",
    image: "/photos/skirt-burgundy-tiered.jpg",
    alt: "Burgundy tiered maxi skirt with a drawstring waist, worn with a white tank top and black boots on a zebra crossing",
  },
  {
    id: "skirt-cream-tiered",
    category: "skirts",
    name: "Cream Tiered Maxi",
    price: 649,
    colour: "cream",
    styles: ["boho", "romantic"],
    fit: "flowy",
    image: "/photos/skirt-cream-tiered.jpg",
    alt: "Cream tiered maxi skirt worn with a black crop top and tan sandals on a sunlit cobbled street",
  },
  {
    id: "skirt-black-satin",
    category: "skirts",
    name: "Black Satin Slip Skirt",
    price: 749,
    colour: "black",
    styles: ["going-out", "classic"],
    fit: "fitted",
    image: "/photos/skirt-black-satin.jpg",
    alt: "Black satin maxi skirt worn with a red halter top, gold chain belt and black heels outside a Paris café",
  },
  {
    id: "skirt-pink-floral",
    category: "skirts",
    name: "Pink Floral Ruffle Maxi",
    price: 599,
    colour: "pink",
    styles: ["romantic"],
    fit: "flowy",
    image: "/photos/skirt-pink-floral.jpg",
    alt: "Pink floral chiffon maxi skirt with a ruffled hem, worn with a white lace-trim cami and white ballet flats beside a flower stall",
  },
  {
    id: "skirt-red-gingham",
    category: "skirts",
    name: "Red Gingham Tiered Maxi",
    price: 579,
    colour: "red",
    styles: ["romantic", "casual"],
    fit: "flowy",
    image: "/photos/skirt-red-gingham.jpg",
    alt: "Red and white gingham tiered maxi skirt worn with a white corset top and red ballet flats against a pink wall",
  },
  {
    id: "skirt-navy-polka",
    category: "skirts",
    name: "Navy Polka Dot Maxi",
    price: 629,
    colour: "navy",
    styles: ["romantic", "classic"],
    fit: "fitted",
    image: "/photos/skirt-navy-polka.jpg",
    alt: "Navy maxi skirt with small white polka dots, worn with a white off-shoulder crop top and black heels on stone steps",
  },
  {
    id: "skirt-denim-slit",
    category: "skirts",
    name: "Denim Slit Maxi",
    price: 699,
    colour: "denim",
    styles: ["casual", "edgy"],
    fit: "fitted",
    image: "/photos/skirt-denim-slit.jpg",
    alt: "Light-wash denim maxi skirt with a front slit, worn with a pink bandeau top and wedge sandals on a seaside promenade",
  },
  {
    id: "skirt-sage-tiered",
    category: "skirts",
    name: "Sage Tiered Maxi",
    price: 629,
    colour: "sage",
    styles: ["boho", "casual"],
    fit: "flowy",
    image: "/photos/skirt-sage-tiered.jpg",
    alt: "Sage green tiered maxi skirt worn with a cream crop top and white trainers outside a bookshop",
  },

  {
    id: "purse-yellow",
    category: "purses",
    name: "Yellow Croc Handbag",
    price: 849,
    colour: "yellow",
    styles: ["going-out"],
    fit: "structured",
    image: "/photos/purse-yellow.jpg",
    alt: "Yellow croc-textured handbag with a top handle",
  },
  {
    id: "purse-striped",
    category: "purses",
    name: "Striped Buckle Handbag",
    price: 799,
    colour: "brown",
    styles: ["boho"],
    fit: "structured",
    image: "/photos/purse-striped.jpg",
    alt: "Hand holding a tan handbag with red, black and brown buckled stripes",
  },
  {
    id: "purse-teal",
    category: "purses",
    name: "Teal Flap Handbag",
    price: 749,
    colour: "teal",
    styles: ["classic", "going-out"],
    fit: "structured",
    image: "/photos/purse-teal.jpg",
    alt: "Teal leather flap handbag with a gold clasp",
  },
  {
    id: "purse-black-tote",
    category: "purses",
    name: "Black Pleated Tote",
    price: 699,
    colour: "black",
    styles: ["casual", "classic"],
    fit: "flowy",
    image: "/photos/purse-black-tote.jpg",
    alt: "Hand holding a black pleated tote bag by its handles",
  },
  {
    id: "purse-navy",
    category: "purses",
    name: "Navy Top-Handle Bag",
    price: 729,
    colour: "navy",
    styles: ["classic"],
    fit: "structured",
    image: "/photos/purse-navy.jpg",
    alt: "Woman holding a navy blue structured top-handle bag",
  },
  {
    id: "purse-print-saddle",
    category: "purses",
    name: "Print-Trim Saddle Bag",
    price: 649,
    colour: "black",
    styles: ["boho", "going-out"],
    fit: "structured",
    image: "/photos/purse-print-saddle.jpg",
    alt: "Black saddle bag with blue and orange printed sides and a gold chain",
  },
  {
    id: "purse-brown-satchel",
    category: "purses",
    name: "Brown Leather Satchel",
    price: 899,
    colour: "brown",
    styles: ["classic", "boho"],
    fit: "structured",
    image: "/photos/purse-brown-satchel.jpg",
    alt: "Brown leather satchel with a top handle and twist lock",
  },
  {
    id: "purse-tan-tote",
    category: "purses",
    name: "Tan Suede Tote",
    price: 599,
    colour: "beige",
    styles: ["casual", "boho"],
    fit: "flowy",
    image: "/photos/purse-tan-tote.jpg",
    alt: "Woman reaching into a tan suede tote with black handles",
  },
];

const categorySizes: Record<CategorySlug, string[]> = {
  tops: ["XS", "S", "M", "Free size"],
  skirts: ["XS", "S", "M", "Free size"],
  purses: ["Free size"],
};

export function getSizes(product: Product): string[] {
  return product.sizes ?? categorySizes[product.category];
}

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProducts(slug: CategorySlug): Product[] {
  return products.filter((product) => product.category === slug);
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}
