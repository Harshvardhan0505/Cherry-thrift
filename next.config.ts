import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Piece photos are shrunk on the phone before upload, one per request;
    // this leaves room under Vercel's 4.5 MB request limit.
    serverActions: { bodySizeLimit: "4mb" },
  },
  images: {
    // Piece photos come from Sanity's image CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/za4keqjy/**" }],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
