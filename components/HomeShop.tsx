"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, getProducts, type CategorySlug } from "@/lib/products";
import { ProductGrid } from "./ProductGrid";
import { tabClass, tabListClass } from "./tabs";

const FEATURED = 4;

export function HomeShop() {
  const [active, setActive] = useState<CategorySlug>("tops");
  const category = categories.find((c) => c.slug === active)!;
  const products = getProducts(active);

  return (
    <section id="shop" aria-labelledby="home-shop-heading" className="px-[6vw] pb-28 pt-24 md:pt-32">
      <div data-reveal className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-sage-deep">Just in</p>
          <h2 id="home-shop-heading" className="mt-3 font-serif text-5xl leading-[0.95] text-wine md:text-6xl">
            Fresh off <em className="text-cherry">the rail</em>
          </h2>
          <p className="mt-4 max-w-md text-wine/75">{category.blurb}</p>
        </div>

        <div role="tablist" aria-label="Categories" className={tabListClass}>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              role="tab"
              id={`tab-${c.slug}`}
              aria-selected={c.slug === active}
              aria-controls="home-shop-panel"
              onClick={() => setActive(c.slug)}
              className={tabClass(c.slug === active)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="tabpanel"
        id="home-shop-panel"
        aria-labelledby={`tab-${active}`}
        className="mt-12"
      >
        {/* Keyed so the cards rise in again after switching category. */}
        <ProductGrid key={active} products={products.slice(0, FEATURED)} />
      </div>

      <p className="mt-16 text-center">
        <Link
          href={`/${category.slug}`}
          className="group inline-flex items-center gap-3 rounded-full border border-cherry/30 bg-white/60 py-2 pl-6 pr-2 text-cherry shadow-[var(--shadow-rest)] backdrop-blur transition-[background-color,color,box-shadow] duration-300 hover:bg-cherry hover:text-white hover:shadow-[var(--shadow-lift)]"
        >
          View all {products.length} {category.label.toLowerCase()}
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-cherry text-white transition-[background-color,color,rotate] duration-300 group-hover:-rotate-45 group-hover:bg-white group-hover:text-cherry"
          >
            →
          </span>
        </Link>
      </p>
    </section>
  );
}
