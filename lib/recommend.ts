import type { Colour, Product } from "./products";

// Colours that go with almost anything.
const NEUTRALS = new Set<Colour>(["white", "cream", "black", "beige", "brown", "denim"]);

// Colour pairs that look good together beyond the neutrals. Each pair works
// both ways.
const GOOD_PAIRS: [Colour, Colour][] = [
  ["burgundy", "pink"],
  ["burgundy", "sage"],
  ["burgundy", "navy"],
  ["red", "navy"],
  ["red", "pink"],
  ["pink", "sage"],
  ["pink", "navy"],
  ["pink", "lavender"],
  ["lavender", "sage"],
  ["light blue", "pink"],
  ["light blue", "yellow"],
  ["light blue", "navy"],
  ["navy", "yellow"],
  ["sage", "yellow"],
  ["teal", "pink"],
];

// Pairs that look muddy or clash next to each other.
const BAD_PAIRS: [Colour, Colour][] = [
  ["black", "navy"],
  ["burgundy", "red"],
  ["teal", "sage"],
];

const both = (pairs: [Colour, Colour][]) =>
  new Set(pairs.flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`]));
const good = both(GOOD_PAIRS);
const bad = both(BAD_PAIRS);

function colourScore(a: Colour, b: Colour): number {
  if (bad.has(`${a}|${b}`)) return -2;
  if (good.has(`${a}|${b}`)) return 3;
  // A neutral with a colour lets the colour stand out.
  if (NEUTRALS.has(a) !== NEUTRALS.has(b)) return 2;
  // Two neutrals are safe but quiet; the same colour twice is flat.
  if (NEUTRALS.has(a) && NEUTRALS.has(b)) return a === b ? 0 : 1;
  return 0;
}

const isOutfit = (a: Product, b: Product) =>
  (a.category === "tops" && b.category === "skirts") ||
  (a.category === "skirts" && b.category === "tops");

// Balance the silhouette of a top and skirt: a flowy skirt wants a fitted
// top, and so on. Bags don't change the silhouette.
function fitScore(a: Product, b: Product): number {
  if (!isOutfit(a, b)) return 0;
  if ((a.fit === "flowy") !== (b.fit === "flowy")) return 2;
  return a.fit === b.fit ? 0 : 1;
}

function pairScore(a: Product, b: Product): number {
  const sharedStyle = a.styles.some((style) => b.styles.includes(style)) ? 2 : 0;
  // A top for a skirt (or the other way round) completes an outfit, so it
  // comes before a bag.
  const outfit = isOutfit(a, b) ? 1 : 0;
  return colourScore(a.colour, b.colour) + sharedStyle + fitScore(a, b) + outfit;
}

// Small, stable number from the cart, used to choose between equally good
// picks so different carts don't all get the same suggestion.
function cartSeed(inCart: Product[]): number {
  let seed = 0;
  for (const piece of inCart) for (const char of piece.id) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  return seed;
}

// The one piece to suggest for this cart, and the cart piece it goes with.
// Hand-picked pairings come first; otherwise every other piece is scored
// against everything in the cart, favouring categories the shopper hasn't
// picked yet (a top for a skirt, then a purse to finish the look).
export function recommendFor(
  inCart: Product[],
  products: Product[],
): { product: Product; goesWith: Product } | undefined {
  if (inCart.length === 0) return undefined;
  // Sold pieces can't be added, so they're never suggested.
  products = products.filter((product) => !product.sold);
  const taken = new Set(inCart.map((product) => product.id));
  const pickedCategories = new Set(inCart.map((product) => product.category));

  for (const piece of [...inCart].reverse()) {
    const match = piece.pairsWith
      ?.map((id) => products.find((product) => product.id === id))
      .find((product) => product && !taken.has(product.id));
    if (match) return { product: match, goesWith: piece };
  }

  const scored: { product: Product; goesWith: Product; score: number }[] = [];
  for (const candidate of products) {
    if (taken.has(candidate.id)) continue;
    let score = pickedCategories.has(candidate.category) ? -6 : 0;
    let goesWith = inCart[0];
    let bestPair = -Infinity;
    for (const piece of inCart) {
      const pair = pairScore(candidate, piece);
      score += pair;
      if (pair > bestPair) {
        bestPair = pair;
        goesWith = piece;
      }
    }
    scored.push({ product: candidate, goesWith, score });
  }
  if (scored.length === 0) return undefined;

  // Choose among the pieces that tie for the best match.
  const top = Math.max(...scored.map((entry) => entry.score));
  const shortlist = scored.filter((entry) => entry.score === top);
  const pick = shortlist[cartSeed(inCart) % shortlist.length];
  return { product: pick.product, goesWith: pick.goesWith };
}
