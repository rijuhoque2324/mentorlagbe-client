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
  async redirects() {
    return [
      { source: "/dashboard/student/applications", destination: "/dashboard/student/my-applications", permanent: true },
      { source: "/dashboard/tutor/tuitions/new", destination: "/dashboard/tutor/post-tuition", permanent: true },
      { source: "/dashboard/tutor/tuitions/:path*", destination: "/dashboard/tutor/my-tuitions/:path*", permanent: true },
      { source: "/dashboard/tutor/tuitions", destination: "/dashboard/tutor/my-tuitions", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "*.ibb.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
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
