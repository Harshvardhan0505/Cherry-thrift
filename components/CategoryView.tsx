import type { Metadata } from "next";
import Link from "next/link";
import { categories, getProducts, type CategorySlug } from "@/lib/products";
import { ProductGrid } from "./ProductGrid";
import { tabClass } from "./tabs";

function findCategory(slug: CategorySlug) {
  return categories.find((category) => category.slug === slug)!;
}

export function categoryMetadata(slug: CategorySlug): Metadata {
  const category = findCategory(slug);
  return { title: category.label, description: category.blurb };
}

export function CategoryView({ slug }: { slug: CategorySlug }) {
  const category = findCategory(slug);
  const products = getProducts(slug);

  return (
    <div className="px-[6vw] pb-32 pt-14">
      <header className="text-center">
        <h1 className="font-serif text-6xl text-cherry-deep md:text-7xl">{category.label}</h1>
        <p className="mx-auto mt-4 max-w-xl text-rosewood">{category.blurb}</p>
      </header>

      <nav aria-label="Categories" className="mt-10 flex justify-center gap-8 sm:gap-14">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/${c.slug}`}
            aria-current={c.slug === slug ? "page" : undefined}
            className={tabClass(c.slug === slug)}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <p className="mt-10 text-sm text-rosewood">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
      </p>
      <div className="mt-5">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
