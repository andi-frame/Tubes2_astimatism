import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['static.wikia.nocookie.net'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
