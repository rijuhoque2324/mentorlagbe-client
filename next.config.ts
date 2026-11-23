import type { NextConfig } from "next";

/**
 * The Express API is proxied through this origin so Better Auth's session
 * cookie is first-party. That keeps users signed in on reload even in
 * browsers that block third-party cookies.
 */
const API_PROXY_TARGET = (
  process.env.API_PROXY_TARGET?.trim() || "http://localhost:5000"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${API_PROXY_TARGET}/api/auth/:path*` },
      { source: "/api/v1/:path*", destination: `${API_PROXY_TARGET}/api/v1/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "*.ibb.co" },
    ],
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
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
