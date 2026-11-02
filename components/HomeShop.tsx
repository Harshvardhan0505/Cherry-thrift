"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { WorksWheel } from "@/components/ui/works-wheel";
import { categories, formatPrice, type CategorySlug, type Product } from "@/lib/products";
import { RevealText } from "./motion/RevealText";
import { SizeButtons } from "./SizeButtons";

const wide = "(min-width: 768px)";
const subscribeWide = (onChange: () => void) => {
  const query = window.matchMedia(wide);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

// `products` is the whole catalogue; the tabs show a few from each category.
export function HomeShop({ products }: { products: Product[] }) {
  const [active, setActive] = useState<CategorySlug>("tops");
  const category = categories.find((c) => c.slug === active)!;
  // Every piece still for sale in the chosen category, on the wheel.
  const pieces = products.filter((product) => product.category === active && !product.sold);
  // Phones get a narrower card and a tighter ring, so the ring fits across the screen.
  const isWide = useSyncExternalStore(subscribeWide, () => window.matchMedia(wide).matches, () => false);
  const listRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  // The cherry pill slides behind whichever tab is chosen. Until it's been
  // placed (or without JavaScript), the chosen tab paints its own background.
  useLayoutEffect(() => {
    const list = listRef.current;
    const pill = pillRef.current;
    if (!list || !pill) return;
    const place = () => {
      const tab = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!tab) return;
      pill.style.width = `${tab.offsetWidth}px`;
      pill.style.height = `${tab.offsetHeight}px`;
      pill.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
    };
    place();
    // Switched on a frame later, so the first placement doesn't slide in from the corner.
    const frame = requestAnimationFrame(() => {
      list.dataset.ready = "true";
    });
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", place);
    };
  }, [active]);

  return (
    <section id="shop" aria-labelledby="home-shop-title" className="scroll-mt-4 px-[6vw] pb-28 pt-14 md:pt-16">
      <div className="mb-10 text-center md:mb-12">
        <RevealText
          id="home-shop-title"
          text="Fresh on the rail"
          className="font-serif text-5xl leading-none text-wine md:text-6xl"
        />
        {/* A handwritten note, like the ones on the log in page. */}
        <p className="mt-3 inline-block -rotate-2 text-balance font-hand text-2xl font-medium text-cherry md:text-[1.7rem]">
          only one of each, so grab it before it&apos;s gone ♡
        </p>
      </div>

      <div
        ref={listRef}
        role="tablist"
        aria-label="Categories"
        className="group relative mx-auto flex w-fit gap-1 rounded-full border border-petal bg-white p-1"
      >
        <span
          ref={pillRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 rounded-full bg-cherry opacity-0 shadow-[0_6px_16px_rgb(181_18_62/0.28)] group-data-[ready=true]:opacity-100 group-data-[ready=true]:transition-[transform,width] group-data-[ready=true]:duration-500 group-data-[ready=true]:ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none!"
        />
        {categories.map((c) => {
          const on = c.slug === active;
          return (
            <button
              key={c.slug}
              type="button"
              role="tab"
              id={`tab-${c.slug}`}
              aria-selected={on}
              aria-controls="home-shop-panel"
              onClick={() => setActive(c.slug)}
              className={`relative z-[1] cursor-pointer rounded-full px-5 py-2 text-[1.02rem] transition-colors duration-300 ${
                on ? "bg-cherry text-white group-data-[ready=true]:bg-transparent" : "text-wine hover:text-cherry"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="home-shop-panel"
        aria-labelledby={`tab-${active}`}
        className="mt-6"
      >
        {/* Full width, out of the section's side padding. A fresh wheel for each
            category, starting as a ring around its name. */}
        <div className="-mx-[6vw] h-[78svh] md:h-[min(86svh,820px)]">
          <WorksWheel
            key={active}
            label={category.label}
            // No badge over the photos.
            action=""
            cardRatio={0.8}
            // Bigger cards need a tighter ring to still fit the frame when it's closed.
            cardHeight={0.58}
            cardMaxWidth={isWide ? 0.6 : 0.62}
            ringRadius={isWide ? 0.58 : 0.45}
            items={pieces.map((piece) => ({
              title: piece.name,
              image: piece.image,
              alt: piece.alt,
              blurDataURL: piece.lqip,
              href: `/${piece.category}`,
            }))}
            details={(_, index) => {
              const piece = pieces[index];
              return (
                <>
                  <p className="text-lg font-medium text-cherry">{formatPrice(piece.price)}</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                    <SizeButtons
                      product={piece}
                      buttonClass="cursor-pointer rounded-full border border-petal bg-white px-3 py-1 text-xs uppercase tracking-wide text-wine transition-colors hover:border-cherry hover:text-cherry"
                      activeClass="border-cherry bg-cherry text-white hover:text-white"
                      flyFrom={() => document.querySelector<HTMLImageElement>(`#works-wheel-${index} img`)}
                    />
                  </div>
                </>
              );
            }}
          />
        </div>
        <p className="mt-3 text-center text-sm text-rose">
          <span className="hidden md:inline">Scroll or drag over the wheel to turn it, or pick a name.</span>
          <span className="md:hidden">Swipe sideways on the wheel to browse.</span>
        </p>
      </div>

      <p className="mt-12 text-center">
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
