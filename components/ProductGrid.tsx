import type { Product } from "@/lib/products";
import { RevealGrid } from "./motion/RevealGrid";
import { ProductCard } from "./ProductCard";

// `replayKey` changes when the grid shows a different set (the home page tabs),
// so the new cards animate in.
export function ProductGrid({ products, replayKey }: { products: Product[]; replayKey?: string }) {
  return (
    <RevealGrid replayKey={replayKey} className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4 lg:gap-x-7">
      {products.map((product) => (
        // Full height, so every card in a row matches the tallest (a long name can wrap to two lines).
        <div key={product.id} data-reveal className="h-full">
          <ProductCard product={product} />
        </div>
      ))}
    </RevealGrid>
  );
}
