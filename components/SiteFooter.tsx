import HalftoneWordmarkFooter, { type FooterColumn } from "@/components/ui/halftone-wordmark-footer";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";

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
      { label: "Email us", href: `mailto:${site.contact.email}` },
      { label: "Instagram", href: site.instagram.url },
    ],
  },
];

// The big "cherry thrifts" printed in dots, in the shop's wine and blush;
// dots pushed by the pointer warm to cherry.
// The header's "Contact" link scrolls here.
export function SiteFooter() {
  return (
    <div id="contact" className="scroll-mt-8">
      <HalftoneWordmarkFooter
        wordmark="cherry thrifts"
        label={site.name}
        meta="Pre-loved, hand-picked"
        columns={columns}
        palette={{ background: "#4a1420", ink: "#fce8ec", warm: "#b5123e" }}
        fontFamily='"Instrument Serif", Georgia, serif'
        fontWeight={400}
        monoFamily="var(--font-jost), system-ui, sans-serif"
        crop={0.12}
        dotGap={5}
        // The word is as wide as the screen, so it's shorter on phones: the
        // footer shrinks with it rather than leaving a gap above.
        height="clamp(340px, 24vw + 150px, 500px)"
      />
    </div>
  );
}
