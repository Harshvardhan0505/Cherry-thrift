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
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-rose">Add to cart</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            <SizeButtons
              product={product}
              buttonClass="cursor-pointer rounded-full border border-wine/15 bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.12em] transition-colors hover:border-cherry hover:bg-cherry hover:text-white"
              activeClass="!border-cherry !bg-cherry !text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 px-4 pb-4 pt-3.5">
        <h3 className="text-[0.95rem] leading-snug text-wine">{product.name}</h3>
        <p className="shrink-0 font-medium tabular-nums text-cherry">{formatPrice(product.price)}</p>
      </div>

      {/* Touch screens have no hover, so the sizes sit under the name instead. */}
      <div className="product-card__sizes-inline">
        <SizeButtons
          product={product}
          buttonClass="cursor-pointer rounded-full border border-petal px-2.5 py-1 text-xs uppercase tracking-wide transition-colors"
          activeClass="border-cherry bg-cherry text-white"
        />
      </div>
    </article>
  );
}
