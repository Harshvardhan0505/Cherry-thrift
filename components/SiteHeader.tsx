import Link from "next/link";
import { Suspense } from "react";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import { AccountLink } from "./AccountLink";
import { CartButton } from "./CartButton";
import { HeaderShell } from "./HeaderShell";
import { InstagramIcon } from "./InstagramIcon";
import { Logo } from "./Logo";

// `overlay` is for the home page, where the header starts clear on top of the
// hero photo in white. Colours come from .site-header in globals.css.
export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const linkClass = "nav-link hover:text-[var(--header-hover)]";
  const iconClass = "text-[var(--header-accent)] transition-colors hover:text-[var(--header-hover)]";

  return (
    <HeaderShell overlay={overlay}>
      <Link href="/" className="group site-header__logo">
        <Logo />
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
        <Suspense>
          <AccountLink className={linkClass} iconClass="text-[var(--header-accent)]" />
        </Suspense>
        <Link href="/#contact" className={`hidden sm:inline ${linkClass}`}>
          Contact
        </Link>
        <span aria-hidden="true" className="hidden h-4 w-px bg-current opacity-30 sm:block" />
        <a
          href={site.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Cherry Thrifts on Instagram (${site.instagram.handle})`}
          className={iconClass}
        >
          <InstagramIcon className="size-5" />
        </a>
        <CartButton className={iconClass} />
      </div>
    </HeaderShell>
  );
}
