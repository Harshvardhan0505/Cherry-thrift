import Link from "next/link";
import { HeroRack } from "@/components/HeroRack";
import { HomeShop } from "@/components/HomeShop";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <section className="relative h-[clamp(420px,50vw,680px)] overflow-hidden bg-wall">
        <HeroRack className="absolute left-1/2 top-0 w-[clamp(640px,78vw,1300px)] -translate-x-1/2" />
        <div className="absolute bottom-7 left-[6vw] rounded-md bg-blush/95 px-5 py-3 text-cherry shadow-sm">
          <h1 className="text-xl font-medium md:text-2xl">New in: Long Skirts</h1>
          <Link
            href="/skirts"
            className="mt-1 inline-block border-b border-cherry pb-0.5 transition-colors hover:border-cherry-deep hover:text-cherry-deep"
          >
            Shop skirts →
          </Link>
        </div>
      </section>

      <HomeShop />

      <section className="px-[6vw] pb-28">
        <p className="mx-auto max-w-3xl text-center font-serif text-4xl leading-tight text-cherry-deep md:text-5xl">
          {site.tagline}
        </p>
      </section>
    </>
  );
}
