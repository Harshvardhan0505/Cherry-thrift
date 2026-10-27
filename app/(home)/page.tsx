import Image from "next/image";
import Link from "next/link";
import { HomeShop } from "@/components/HomeShop";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";

export default async function Home() {
  const catalog = await getCatalog();
  return (
    <>
      {/* The background matches the photo's wall, so it reads as one surface
          while the photo loads. */}
      <section className="hero relative h-[clamp(520px,54vw,760px)] overflow-hidden bg-[#69644d]">
        <Image
          src="/photos/hero-skirt-rail.jpg"
          alt="Long skirts in cream, navy polka dot, red gingham, blush, cherry red and sage hanging on a wooden rail against a sage green wall, beside a branch of white blossom"
          fill
          preload
          sizes="100vw"
          className="object-cover object-top"
        />
        {/* Soft shadow in the corner so the white text stays readable. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_95%_80%_at_0%_100%,rgb(0_0_0/0.62),transparent_70%)] md:bg-[radial-gradient(ellipse_60%_95%_at_0%_100%,rgb(0_0_0/0.62),transparent_70%)]"
        />
        <div className="absolute bottom-10 left-[6vw] right-[6vw] text-white [text-shadow:0_1px_16px_rgb(0_0_0/0.6)] md:bottom-16">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-white/85">New in</p>
          <h1 className="mt-2 font-serif text-6xl leading-none md:text-7xl">Long skirts</h1>
          <Link
            href="/skirts"
            className="mt-6 inline-block rounded-md bg-petal px-7 py-3.5 text-lg font-medium text-wine transition-colors [text-shadow:none] hover:bg-white"
          >
            Shop skirts →
          </Link>
        </div>
      </section>

      <HomeShop products={catalog} />

      <section className="bg-sage px-[6vw] py-20">
        <p className="mx-auto max-w-3xl text-center font-serif text-4xl leading-tight text-wine md:text-5xl">
          {site.tagline}
        </p>
      </section>
    </>
  );
}
