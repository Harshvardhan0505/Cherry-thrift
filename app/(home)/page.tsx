import Image from "next/image";
import Link from "next/link";
import { CherrySticker, Polaroid } from "@/components/AuthShell";
import { CherryIcon } from "@/components/CherryIcon";
import { HomeShop } from "@/components/HomeShop";
import { InstagramIcon } from "@/components/InstagramIcon";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { RibbonBow } from "@/components/RibbonBow";
import { Tilt } from "@/components/Tilt";
import { categories, formatPrice, getProduct, getProducts, type CategorySlug } from "@/lib/products";
import { about, site } from "@/lib/site";

// The photo on each category tile.
const CATEGORY_COVERS: Record<CategorySlug, string> = {
  tops: "top-white-asymmetric",
  skirts: "skirt-pink-floral",
  purses: "purse-teal",
};

// Small photos tucked into the corners of the Instagram card.
const FEED = [
  { id: "top-white-button", className: "left-8 top-10 -rotate-[9deg]" },
  { id: "skirt-red-gingham", className: "-bottom-6 left-24 rotate-[6deg]" },
  { id: "purse-striped", className: "right-10 top-8 rotate-[8deg]" },
  { id: "skirt-navy-polka", className: "-bottom-4 right-28 -rotate-[5deg]" },
];

const PROMISES = [...about.values.map((value) => value.title), "One of a kind", "Pre-loved"];

export default function Home() {
  const skirtsFrom = formatPrice(Math.min(...getProducts("skirts").map((p) => p.price)));
  const pieceCount = categories.reduce((total, c) => total + getProducts(c.slug).length, 0);

  return (
    <>
      <Hero skirtsFrom={skirtsFrom} pieceCount={pieceCount} />
      <PromiseRibbon />
      <CategoryTiles />
      <HomeShop />
      <Story />
      <InstagramCard />
      <RevealOnScroll />
    </>
  );
}

function Hero({ skirtsFrom, pieceCount }: { skirtsFrom: string; pieceCount: number }) {
  return (
    // The background matches the photo's wall, so it reads as one surface
    // while the photo loads.
    <section
      data-header-dark
      className="relative isolate flex h-[clamp(640px,100svh,980px)] items-end overflow-hidden bg-[#69644d]"
    >
      <Image
        src="/photos/hero-skirt-rail.jpg"
        alt="Long skirts in cream, navy polka dot, red gingham, blush, cherry red and sage hanging on a wooden rail against a sage green wall, beside a branch of white blossom"
        fill
        preload
        sizes="100vw"
        className="hero-photo -z-10 object-cover object-top"
      />
      {/* Shade at the top for the header, and a wine glow in the corner so the
          white text stays readable. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(30_8_14/0.45),transparent_24%),linear-gradient(to_top,rgb(30_8_14/0.55),transparent_50%),radial-gradient(ellipse_120%_80%_at_0%_100%,rgb(48_10_20/0.85),transparent_72%)] md:bg-[linear-gradient(to_bottom,rgb(30_8_14/0.4),transparent_20%),linear-gradient(to_top,rgb(30_8_14/0.5),transparent_45%),radial-gradient(ellipse_75%_95%_at_0%_100%,rgb(48_10_20/0.88),transparent_72%)]"
      />

      <div className="w-full px-[6vw] pb-14 md:pb-20">
        <div className="flex items-end justify-between gap-10">
          <div className="max-w-3xl text-white">
            <p className="hero-rise inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.28em] backdrop-blur-md">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-petal motion-safe:animate-pulse" />
              New in · Long skirts
            </p>
            <h1
              className="hero-rise mt-6 font-serif text-[clamp(3.6rem,9vw,8.5rem)] leading-[0.88] [text-shadow:0_2px_30px_rgb(0_0_0/0.3)]"
              style={{ "--rise-delay": "120ms" } as React.CSSProperties}
            >
              Long skirts,
              <br />
              <em className="text-petal">twice</em> loved.
            </h1>
            <p
              className="hero-rise mt-6 max-w-md text-lg leading-relaxed text-white/85"
              style={{ "--rise-delay": "240ms" } as React.CSSProperties}
            >
              Tiered, printed and solid maxis with plenty of twirl left in them. Hand-picked, one of a kind,
              from {skirtsFrom}.
            </p>
            <div
              className="hero-rise mt-8 flex flex-wrap gap-3"
              style={{ "--rise-delay": "360ms" } as React.CSSProperties}
            >
              <Link
                href="/skirts"
                className="group inline-flex items-center gap-4 rounded-full bg-petal py-2 pl-7 pr-2 text-lg font-medium text-wine shadow-[0_18px_40px_-18px_rgb(0_0_0/0.6)] transition-colors duration-300 hover:bg-white"
              >
                Shop skirts
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-full bg-cherry text-white transition-[rotate] duration-300 group-hover:-rotate-45"
                >
                  →
                </span>
              </Link>
              <Link
                href="#shop"
                className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-7 py-3 text-lg text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/25"
              >
                See what&apos;s new
              </Link>
            </div>
          </div>

          <div className="hero-rise hidden lg:block" style={{ "--rise-delay": "520ms" } as React.CSSProperties}>
            <Tilt glare max={12} className="relative rounded-[28px]">
              <div className="w-72 rounded-[28px] border border-white/30 bg-white/15 p-7 text-white shadow-[0_40px_80px_-30px_rgb(0_0_0/0.55)] backdrop-blur-xl">
                <CherryIcon className="size-10 drop-shadow" />
                <p className="mt-5 font-serif text-6xl leading-none">{pieceCount}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
                  Pieces on the rails
                </p>
                <p className="mt-5 border-t border-white/25 pt-4 text-[0.95rem] leading-relaxed text-white/85">
                  Every one is one of a kind. When it&apos;s gone, it&apos;s gone.
                </p>
              </div>
            </Tilt>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.32em] text-white/70 md:flex"
      >
        Scroll
        <span className="h-10 w-px overflow-hidden bg-white/25">
          <span className="scroll-cue block size-full bg-white" />
        </span>
      </div>
    </section>
  );
}

// A cherry ribbon of the shop's promises, scrolling sideways. The same words
// appear in the story section, so screen readers skip it.
function PromiseRibbon() {
  return (
    <div aria-hidden="true" className="overflow-hidden bg-cherry py-4 text-white md:py-5">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {[...PROMISES, ...PROMISES].map((promise, i) => (
              <li key={i} className="flex items-center gap-8 pr-8 font-serif text-2xl md:text-3xl">
                <span className={i % 2 ? "italic text-petal" : ""}>{promise}</span>
                <span className="text-base text-petal">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

function CategoryTiles() {
  return (
    <section aria-labelledby="categories-heading" className="pt-24 md:pt-32">
      <div data-reveal className="flex items-end justify-between gap-6 px-[6vw]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-sage-deep">Shop the rails</p>
          <h2 id="categories-heading" className="mt-3 font-serif text-5xl leading-[0.95] text-wine md:text-6xl">
            Find your <em className="text-cherry">next favourite</em>
          </h2>
        </div>
        <p className="hidden max-w-xs text-wine/75 md:block">{site.description}</p>
      </div>

      {/* Phones swipe through the tiles; wider screens see all three. */}
      <ul className="mt-12 flex snap-x snap-mandatory scroll-px-[6vw] gap-4 overflow-x-auto px-[6vw] pb-6 [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-6 md:overflow-visible">
        {categories.map((category, i) => {
          const cover = getProduct(CATEGORY_COVERS[category.slug])!;
          const count = getProducts(category.slug).length;
          return (
            <li
              key={category.slug}
              data-reveal
              style={{ "--reveal-delay": `${i * 120}ms` } as React.CSSProperties}
              className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-auto"
            >
              <Tilt glare max={6} className="relative rounded-[28px]">
                <Link
                  href={`/${category.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-petal shadow-[var(--shadow-rest)] transition-shadow duration-500 hover:shadow-[var(--shadow-float)]"
                >
                  <Image
                    src={cover.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 30vw, 78vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:scale-105"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgb(48_10_20/0.85),rgb(48_10_20/0.1)_55%,transparent)]"
                  />
                  <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-wine backdrop-blur">
                    {count} pieces
                  </span>
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white">
                    <span>
                      <span className="block font-serif text-4xl lg:text-5xl">{category.label}</span>
                      <span className="mt-1.5 block text-sm leading-snug text-white/80">{category.blurb}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-lg text-cherry transition-[background-color,color,rotate] duration-500 group-hover:-rotate-45 group-hover:bg-cherry group-hover:text-white"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </Tilt>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// A scrapbook of real pieces, floating at different depths so the stack
// tilts in 3D under the pointer, beside the shop's story.
function Story() {
  const depth = (px: number) => ({ "--depth": px }) as React.CSSProperties;

  return (
    <section aria-labelledby="story-heading" className="grain overflow-hidden bg-sage px-[6vw] py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div data-reveal aria-hidden="true" className="flex justify-center">
          <Tilt max={14}>
            <div className="relative h-[450px] w-[310px] [transform-style:preserve-3d] sm:h-[560px] sm:w-[440px]">
              <div className="absolute inset-0" style={depth(20)}>
                <Polaroid
                  id="skirt-sage-tiered"
                  caption="sage tiers"
                  className="left-0 top-14 w-[150px] -rotate-8 text-lg sm:w-[200px] sm:text-[22px]"
                  photoClass="h-[180px] sm:h-[240px]"
                  position="center 35%"
                  sizes="200px"
                >
                  <span className="washi absolute -top-3 left-1/2 z-[4] h-6 w-20 -translate-x-1/2 -rotate-6 opacity-80" />
                </Polaroid>
              </div>
              <div className="absolute inset-0" style={depth(70)}>
                <Polaroid
                  id="top-cherry-corset"
                  caption="the satin corset ♡"
                  className="right-0 top-0 w-[165px] rotate-6 text-lg sm:w-[230px] sm:text-[22px]"
                  photoClass="h-[190px] sm:h-[240px]"
                  position="center 45%"
                  sizes="230px"
                >
                  <span className="absolute -right-5 -top-2 z-[4] h-6 w-20 rotate-[38deg] bg-cherry/15 opacity-80" />
                </Polaroid>
              </div>
              <div className="absolute inset-0" style={depth(120)}>
                <Polaroid
                  id="purse-yellow"
                  caption="sunny little bag"
                  className="bottom-0 left-[40%] w-[150px] sm:left-[16%] -rotate-3 text-lg sm:w-[200px] sm:text-[22px]"
                  photoClass="h-[150px] sm:h-[200px]"
                  sizes="200px"
                />
              </div>
              <div className="absolute inset-0" style={depth(160)}>
                <CherrySticker className="bottom-24 right-2 size-16 sm:bottom-32 sm:right-6 sm:size-20" />
                <RibbonBow
                  id="story-bow"
                  tone="cherry"
                  className="absolute -left-3 -top-4 w-16 -rotate-12 drop-shadow-[0_10px_12px_rgb(74_20_32/0.25)] sm:w-20"
                />
              </div>
            </div>
          </Tilt>
        </div>

        <div data-reveal style={{ "--reveal-delay": "150ms" } as React.CSSProperties}>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-sage-deep">Our story</p>
          <h2 id="story-heading" className="mt-4 font-serif text-5xl leading-[1.02] text-wine md:text-6xl">
            {site.tagline}
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-wine/80">{about.intro}</p>

          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {about.values.map((value, i) => (
              <li key={value.title} className="border-t border-wine/20 pt-4">
                <span className="font-serif text-lg text-cherry">0{i + 1}</span>
                <h3 className="mt-1 font-serif text-2xl text-wine">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-wine/75">{value.text}</p>
              </li>
            ))}
          </ul>

          <Link
            href="/about"
            className="group mt-10 inline-flex items-center gap-3 font-medium text-cherry"
          >
            <span className="nav-link">Read our story</span>
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function InstagramCard() {
  return (
    <section aria-labelledby="instagram-heading" className="px-[6vw] py-24 md:py-28">
      <div
        data-reveal
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-white px-7 py-16 text-center shadow-[var(--shadow-rest)] md:px-16 md:py-24"
      >
        {FEED.map(({ id, className }) => {
          const product = getProduct(id)!;
          return (
            <div
              key={id}
              aria-hidden="true"
              className={`absolute hidden aspect-[4/5] w-32 overflow-hidden rounded-2xl bg-petal shadow-[var(--shadow-lift)] lg:block xl:w-36 ${className}`}
            >
              <Image src={product.image} alt="" fill sizes="144px" className="object-cover" />
            </div>
          );
        })}

        <InstagramIcon className="mx-auto size-8 text-cherry" />
        <h2 id="instagram-heading" className="mx-auto mt-5 max-w-xl font-serif text-5xl leading-[1.02] text-wine md:text-6xl">
          New pieces land on <em className="text-cherry">Instagram</em> first
        </h2>
        <p className="mx-auto mt-5 max-w-md text-wine/75">
          Follow along to catch each find before it&apos;s gone. Most pieces are one of a kind.
        </p>
        <a
          href={site.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-cherry px-8 py-3.5 font-medium text-white shadow-[0_14px_30px_-14px_rgb(181_18_62/0.8)] transition-[background-color,box-shadow] duration-300 hover:bg-wine hover:shadow-[var(--shadow-lift)]"
        >
          Follow {site.instagram.handle}
        </a>
      </div>
    </section>
  );
}
