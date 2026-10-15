import type { Metadata } from "next";
import { about, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: about.intro,
};

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-[6vw] pb-20 pt-14">
        <header className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-sage-deep">
            Our story
          </p>
          <h1 className="mt-4 font-serif text-6xl text-cherry md:text-7xl">About</h1>
        </header>

        <p className="mt-12 font-serif text-3xl leading-snug text-wine">{about.intro}</p>
        <div className="mt-8 space-y-5 text-lg text-wine/85">
          {about.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <section aria-label="What we care about" className="bg-sage px-[6vw] py-16">
        <ul className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-3">
          {about.values.map((value) => (
            <li key={value.title}>
              <h2 className="font-serif text-3xl text-wine">{value.title}</h2>
              <p className="mt-3 text-wine/85">{value.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="px-[6vw] py-20 text-center">
        <p className="text-lg text-wine/85">New pieces are shared on Instagram first.</p>
        <a
          href={site.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-cherry px-8 py-3 font-medium text-white transition-colors hover:bg-wine"
        >
          Follow {site.instagram.handle}
        </a>
      </div>
    </>
  );
}
