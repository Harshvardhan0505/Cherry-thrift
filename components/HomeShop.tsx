"use client";

import Link from "next/link";
import { useState } from "react";
import { categories, getProducts, type CategorySlug } from "@/lib/products";
import { ProductGrid } from "./ProductGrid";
import { tabClass } from "./tabs";

const FEATURED = 4;

export function HomeShop() {
  const [active, setActive] = useState<CategorySlug>("tops");
  const category = categories.find((c) => c.slug === active)!;

  return (
    <section aria-label="Shop by category" className="px-[6vw] pb-28 pt-14">
      <div role="tablist" aria-label="Categories" className="flex flex-wrap justify-center gap-2 sm:gap-4">
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

      <div
        role="tabpanel"
        id="home-shop-panel"
        aria-labelledby={`tab-${active}`}
        className="mt-12"
      >
        <ProductGrid products={getProducts(active).slice(0, FEATURED)} />
      </div>

      <p className="mt-24 text-center">
        <Link
          href={`/${category.slug}`}
          className="border-b border-cherry pb-1 text-cherry transition-colors hover:border-wine hover:text-wine"
        >
          View all {category.label.toLowerCase()} →
        </Link>
      </p>
    </section>
  );
}
