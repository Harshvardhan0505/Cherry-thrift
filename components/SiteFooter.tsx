import Link from "next/link";
import { categories } from "@/lib/products";
import { site } from "@/lib/site";
import { InstagramIcon } from "./InstagramIcon";

const headingClass = "font-serif text-3xl text-cherry-deep";
const linkClass = "underline-offset-4 hover:text-cherry hover:underline";

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-8 bg-petal text-cherry-deep">
      <div className="grid gap-x-10 gap-y-12 px-[6vw] pb-10 pt-16 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.7fr_1.3fr]">
        <div>
          <h2 className={headingClass}>Shop</h2>
          <ul className="mt-6 space-y-3">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/${category.slug}`} className={linkClass}>
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Read</h2>
          <ul className="mt-6 space-y-3">
            <li>
              <Link href={site.blogUrl} className={linkClass}>
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Contact</h2>
          <ul className="mt-6 space-y-3">
            <li>{site.contact.name}</li>
            <li>
              Email:{" "}
              <a href={`mailto:${site.contact.email}`} className={`[overflow-wrap:anywhere] ${linkClass}`}>
                {site.contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>Connect with us</h2>
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 inline-flex items-center gap-3 ${linkClass}`}
          >
            <InstagramIcon className="size-6" />
            {site.instagram.handle}
          </a>
        </div>
      </div>

      <p className="mx-[6vw] border-t border-cherry-deep/40 py-5 text-sm text-rosewood">
        © {site.name}
      </p>
    </footer>
  );
}
