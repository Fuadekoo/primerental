import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Ignore build errors
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "20gb",
    },
  },
};

export default nextConfig;
