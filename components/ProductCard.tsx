import Image from "next/image";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card" tabIndex={0}>
      <div className="product-card__inner">
        <div className="product-card__photo">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(min-width: 1024px) 22vw, 44vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-baseline justify-between gap-3 px-4 py-3">
          <h3 className="text-[0.95rem] text-wine">{product.name}</h3>
          <p className="shrink-0 font-medium text-cherry">{formatPrice(product.price)}</p>
        </div>

        <div className="product-card__details">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-rose">Size</dt>
            <dd>{product.size}</dd>
            <dt className="text-rose">Condition</dt>
            <dd>{product.condition}</dd>
          </dl>
          <p className="mt-2 text-sm text-rose">{product.note}</p>
        </div>
      </div>
    </article>
  );
}
