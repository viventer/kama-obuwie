import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["firebasestorage.googleapis.com", "storage.googleapis.com"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "128mb",
    },
  },
};

export default nextConfig;
