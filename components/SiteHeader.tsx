import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import { CartButton } from "./CartButton";
import { InstagramIcon } from "./InstagramIcon";
import { OrdersLink } from "./OrdersLink";

// `overlay` is for the home page, where the header sits on top of the hero
// photo in white.
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const linkClass = `underline-offset-8 decoration-1 transition-colors hover:underline ${
    overlay ? "hover:text-white/80" : "hover:text-cherry"
  }`;

  return (
    <header
      className={
        overlay
          ? "absolute inset-x-0 top-0 z-30 text-white"
          : "relative z-30 border-b border-petal bg-white text-wine"
      }
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-[6vw] py-5 sm:gap-x-6 md:gap-x-12 md:py-6">
        <Link
          href="/"
          className={`text-xl font-medium uppercase tracking-[0.18em] sm:text-2xl sm:tracking-[0.22em] md:text-[1.75rem] ${overlay ? "" : "text-cherry"}`}
        >
          {site.name}
        </Link>

        <nav
          aria-label="Main"
          className="order-3 flex w-full gap-6 text-[0.95rem] md:order-none md:w-auto md:gap-9"
        >
          {categories.map((category) => (
            <Link key={category.slug} href={`/${category.slug}`} className={linkClass}>
              {category.label}
            </Link>
          ))}
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <Link href={site.blogUrl} className={linkClass}>
            Blog
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 text-[0.95rem] sm:gap-4">
          <OrdersLink className={linkClass} iconClass={overlay ? "" : "text-cherry"} />
          <Link href="/#contact" className={`hidden sm:inline ${linkClass}`}>
            Contact
          </Link>
          <span aria-hidden="true" className={`hidden h-4 w-px sm:block ${overlay ? "bg-white/50" : "bg-petal"}`} />
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Cherry Thrifts on Instagram (${site.instagram.handle})`}
            className={`transition-colors ${overlay ? "hover:text-white/80" : "text-cherry hover:text-wine"}`}
          >
            <InstagramIcon className="size-5" />
          </a>
          <CartButton className={overlay ? "hover:text-white/80" : undefined} />
        </div>
      </div>
    </header>
  );
}
