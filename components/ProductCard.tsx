import Image from "next/image";
import { formatPrice, type Product } from "@/lib/products";
import { SizeButtons } from "./SizeButtons";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <div className="product-card__photo">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="(min-width: 1024px) 22vw, 44vw"
          className="object-cover"
        />
        {/* Shown over the photo on hover or keyboard focus. */}
        <div className="product-card__sizes">
          <p className="text-sm font-medium uppercase tracking-[0.2em]">Add:</p>
          <SizeButtons
            product={product}
            buttonClass="cursor-pointer px-3 py-0.5 uppercase tracking-[0.12em] underline-offset-4 hover:text-cherry hover:underline"
            activeClass="font-medium text-cherry underline"
          />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 px-4 py-3">
        <h3 className="text-[0.95rem] text-wine">{product.name}</h3>
        <p className="shrink-0 font-medium text-cherry">{formatPrice(product.price)}</p>
      </div>

      {/* Touch screens have no hover, so the sizes sit under the name instead. */}
      <div className="product-card__sizes-inline">
        <SizeButtons
          product={product}
          buttonClass="cursor-pointer rounded-full border border-petal px-2.5 py-1 text-xs uppercase tracking-wide"
          activeClass="border-cherry bg-cherry text-white"
        />
      </div>
    </article>
  );
}
