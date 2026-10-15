import type { Metadata } from "next";
import { blogPosts } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: "Styling notes and thrifting stories from Cherry Thrifts.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-[6vw] pb-32 pt-14">
      <header className="text-center">
        <h1 className="font-serif text-6xl text-cherry md:text-7xl">Blog</h1>
        <p className="mt-4 text-wine/80">Styling notes and thrifting stories.</p>
      </header>

      {blogPosts.length === 0 ? (
        <p className="mt-16 rounded-xl bg-white px-6 py-12 text-center text-rose">
          No posts yet. The first one is on its way.
        </p>
      ) : (
        <ul className="mt-14 divide-y divide-petal">
          {blogPosts.map((post) => (
            <li key={post.url} className="py-8">
              <p className="text-sm text-rose">{post.date}</p>
              <h2 className="mt-1 font-serif text-3xl text-wine">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:text-cherry hover:underline"
                >
                  {post.title}
                </a>
              </h2>
              <p className="mt-2 text-wine/80">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
