import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "storage.googleapis.com",
      "a.allegroimg.allegrosandbox.pl",
      "a.allegroimg.pl",
      "allegroimg.pl",
      "a.allegroimg.com",
      "allegro.pl.allegrosandbox.pl",
    ],
  },
  // Keep WASM Snowball stemmer out of Turbopack/webpack bundles — its
  // import.meta.url + readFileSync(wasm) path breaks when rewritten.
  serverExternalPackages: ["multilingual-stemmer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "128mb",
    },
  },
};

export default nextConfig;
