import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="stagger-in grid grid-cols-2 gap-x-3.5 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4 lg:gap-x-7">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
