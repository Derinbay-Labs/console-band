import type { NextConfig } from "next";

// Static export for Firebase Hosting (ADR 0001): no server, middleware, rewrites or redirects.
// `out/` is deployed as plain files.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  poweredByHeader: false,
  experimental: { globalNotFound: true },
};

export default nextConfig;
