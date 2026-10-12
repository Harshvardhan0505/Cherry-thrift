import Image from "next/image";
import Link from "next/link";
import { HomeShop } from "@/components/HomeShop";
import { site } from "@/lib/site";

export default function Home() {
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
        <div className="absolute bottom-8 left-[6vw] rounded-md bg-white px-6 py-5 shadow-sm md:bottom-12 md:left-auto md:right-[6vw]">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-sage-deep">New in</p>
          <h1 className="mt-1 font-serif text-4xl text-cherry md:text-5xl">Long skirts</h1>
          <Link
            href="/skirts"
            className="mt-3 inline-block border-b border-cherry pb-0.5 text-cherry transition-colors hover:border-wine hover:text-wine"
          >
            Shop skirts →
          </Link>
        </div>
      </section>

      <HomeShop />

      <section className="bg-sage px-[6vw] py-20">
        <p className="mx-auto max-w-3xl text-center font-serif text-4xl leading-tight text-wine md:text-5xl">
          {site.tagline}
        </p>
      </section>
    </>
  );
}
