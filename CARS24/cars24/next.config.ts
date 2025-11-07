import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, { dev, isServer, webpack }) => {
    if (dev && !isServer) {
      // Fix for webpack hot-update 404 errors
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      // Ensure HMR is properly configured
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      };
    }
    return config;
  },
  // Improve Fast Refresh reliability
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Disable webpack cache to avoid stale hot-update files
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
