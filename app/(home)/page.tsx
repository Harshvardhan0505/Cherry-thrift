import { HomeShop } from "@/components/HomeShop";
import { Intro } from "@/components/Intro";
import { RevealText } from "@/components/motion/RevealText";
import { Ribbon } from "@/components/Ribbon";
import { ParallaxComponent } from "@/components/ui/parallax-scrolling";
import { InstagramIcon } from "@/components/InstagramIcon";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { getCatalog } from "@/lib/catalog";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";

export default async function Home() {
  const catalog = await getCatalog();
  return (
    <>
      <Intro />

      {/* The skirt rail in layers, with "Cherry Thrifts" sinking behind it as you scroll. */}
      <ParallaxComponent />

      {/* The shop as a pink sheet that overlaps the bottom of the rail and
          slides up over it as you scroll, with the ribbon along its top edge. */}
      <div className="relative z-10 -mt-[12svh] overflow-hidden rounded-t-[2rem] bg-blush shadow-[0_-16px_40px_rgb(74_20_32/0.22)] md:rounded-t-[3rem]">
        <Ribbon />
        <HomeShop products={catalog} />
      </div>

      <section className="bg-sage px-[6vw] py-20">
        <RevealText
          as="p"
          text={site.tagline}
          className="mx-auto max-w-3xl text-center font-serif text-4xl leading-tight text-wine md:text-5xl"
        />
      </section>

      {/* A full-screen call to action the page uncovers as you reach the end,
          just before the footer. */}
      <CinematicFooter
        word="cherry"
        heading="Ready to thrift?"
        primary={categories.map((category) => ({ label: `Shop ${category.label.toLowerCase()}`, href: `/${category.slug}` }))}
        secondary={[
          { label: "Our story", href: "/about" },
          { label: "Instagram", href: site.instagram.url, external: true, icon: <InstagramIcon className="size-4" /> },
          { label: "Email us", href: `mailto:${site.contact.email}` },
        ]}
        note={`© ${site.name}`}
        by={site.name}
      />
    </>
  );
}
