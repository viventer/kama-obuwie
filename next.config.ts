import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "storage.googleapis.com",
      "a.allegroimg.allegrosandbox.pl",
      "a.allegroimg.pl",
      "allegroimg.pl",
      "allegro.pl.allegrosandbox.pl",
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "128mb",
    },
  },
};

export default nextConfig;
