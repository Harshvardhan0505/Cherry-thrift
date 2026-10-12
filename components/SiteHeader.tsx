import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import { InstagramIcon } from "./InstagramIcon";

const linkClass =
  "underline-offset-8 decoration-1 transition-colors hover:text-cherry-deep hover:underline";

export function SiteHeader() {
  return (
    <header className="relative z-30 bg-wall text-cherry">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-[6vw] py-6 md:gap-x-12 md:py-8">
        <Link
          href="/"
          className="text-xl font-medium uppercase tracking-[0.22em] sm:text-2xl md:text-[1.75rem]"
        >
          {site.name}
        </Link>

        <nav
          aria-label="Shop"
          className="order-3 flex w-full gap-7 text-[0.95rem] md:order-none md:w-auto md:gap-9"
        >
          {categories.map((category) => (
            <Link key={category.slug} href={`/${category.slug}`} className={linkClass}>
              {category.label}
            </Link>
          ))}
          <Link href={site.blogUrl} className={linkClass}>
            Blog
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-4 text-[0.95rem]">
          <Link href="/#contact" className={`hidden sm:inline ${linkClass}`}>
            Contact
          </Link>
          <span aria-hidden="true" className="hidden h-4 w-px bg-cherry/50 sm:block" />
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Cherry Thrifts on Instagram (${site.instagram.handle})`}
            className="transition-colors hover:text-cherry-deep"
          >
            <InstagramIcon className="size-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
