import { formatPrice, type Product } from "@/lib/products";
import { Garment } from "./Garment";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card" tabIndex={0}>
      <div className="product-card__inner">
        <div className="product-card__backdrop" />

        <div className="relative">
          <div className="flex aspect-[5/6] items-center justify-center overflow-hidden bg-tile">
            <Garment
              art={product.art}
              id={product.id}
              className="product-card__art h-[82%] w-[82%]"
            />
          </div>
          <div className="flex items-baseline justify-between gap-3 pb-3 pt-3">
            <h3 className="text-[0.95rem] text-cherry-deep">{product.name}</h3>
            <p className="shrink-0 font-medium text-cherry">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div className="product-card__details">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-rosewood">Size</dt>
            <dd>{product.size}</dd>
            <dt className="text-rosewood">Condition</dt>
            <dd>{product.condition}</dd>
          </dl>
          <p className="mt-2 text-sm text-rosewood">{product.note}</p>
        </div>
      </div>
    </article>
  );
}
