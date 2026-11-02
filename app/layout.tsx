import type { Metadata } from "next";
import { Caveat, Instrument_Serif, Jost } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { PageTransitionProvider } from "@/components/PageTransition";
import { INTRO_KEY } from "@/lib/motion";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  // latin-ext carries the rupee sign used in prices.
  subsets: ["latin", "latin-ext"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  // Italic for the home page line, "Thrifted, *not basic*".
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Handwriting, for the scrapbook notes on the log in and sign up pages.
const caveat = Caveat({
  variable: "--font-caveat",
  weight: ["500", "600"],
  subsets: ["latin"],
});

const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_KEY}"))document.documentElement.classList.add("intro-seen")}catch(e){document.documentElement.classList.add("intro-seen")}`;

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Cached, so this is part of the prerendered page rather than a wait.
  const catalog = await getCatalog();
  return (
    <html
      lang="en"
      className={`${jost.variable} ${instrumentSerif.variable} ${caveat.variable} h-full antialiased`}
      // The script below may add `intro-seen` before React loads.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before the first paint: the home page intro plays once per
            visit, so skip it if it has already played in this tab. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SEEN_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        {/* Each route group adds its own header (and footer) around the page. */}
        <PageTransitionProvider>
          <CartProvider catalog={catalog}>{children}</CartProvider>
        </PageTransitionProvider>
      </body>
    </html>
  );
}
