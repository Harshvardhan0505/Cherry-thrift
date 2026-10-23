import Image from "next/image";
import logo from "@/public/brand/logo.png";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import HalftoneWordmarkFooter, { type FooterColumn } from "./effects/halftone-wordmark-footer";

const columns: FooterColumn[] = [
  {
    title: "Shop",
    links: categories.map((category) => ({ label: category.label, href: `/${category.slug}` })),
  },
  {
    title: "About",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Blog", href: site.blogUrl },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: site.contact.email, href: `mailto:${site.contact.email}` },
      { label: `Instagram ${site.instagram.handle}`, href: site.instagram.url, external: true },
    ],
  },
];

// "cherry" printed huge in blush dots along the bottom, on deep wine. The dots
// part around the pointer and warm to cherry pink. Shared by every page.
export function SiteFooter() {
  return (
    <HalftoneWordmarkFooter
      id="contact"
      wordmark="cherry"
      // White on the dark footer.
      label={<Image src={logo} alt={site.name} sizes="160px" className="h-auto w-28 brightness-0 invert md:w-32" />}
      meta="Tops · Skirts · Purses"
      statement={<p>{site.tagline}</p>}
      columns={columns}
      note={`© ${new Date().getFullYear()} ${site.name}`}
      palette={{ background: "#3d0f1a", ink: "#fce8ec", warm: "#ff7d9c" }}
      // Canvas fonts need the real family name; next/font registers this one.
      fontFamily='"Instrument Serif", Georgia, serif'
      fontWeight={400}
      monoFamily="var(--font-jost), system-ui, sans-serif"
      dotGap={5}
      crop={0.1}
      // The word is fitted to the width, so its height scales with vw. The
      // last term is a 700px floor up to 720px wide, where the link columns
      // stack two-up and stand taller; it drops to nothing just above that.
      height="max(560px, calc(320px + 30vw), clamp(0px, calc((740px - 100vw) * 50), 700px))"
      className="scroll-mt-8"
    />
  );
}
