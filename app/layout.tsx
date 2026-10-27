import type { Metadata } from "next";
import { Caveat, Instrument_Serif, Jost } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
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
  subsets: ["latin"],
});

// Handwriting, for the scrapbook notes on the log in and sign up pages.
const caveat = Caveat({
  variable: "--font-caveat",
  weight: ["500", "600"],
  subsets: ["latin"],
});

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
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* Each route group adds its own header (and footer) around the page. */}
        <CartProvider catalog={catalog}>{children}</CartProvider>
      </body>
    </html>
  );
}
