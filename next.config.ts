import type { NextConfig } from "next";

/**
 * Long-lived immutable cache for static media assets — combined with the
 * Cloudflare CDN cache rule on /videos/* (Edge TTL 1 year, cache 200 + 206
 * for range requests). The filenames are stable; if a video is ever
 * re-encoded, version the filename (e.g. -v2) instead of overwriting,
 * otherwise the CDN edge cache must be purged manually.
 */
const STATIC_MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/videos/:path*",
        headers: [
          { key: "Cache-Control", value: STATIC_MEDIA_CACHE_CONTROL },
        ],
      },
      {
        source: "/frames/:path*",
        headers: [
          { key: "Cache-Control", value: STATIC_MEDIA_CACHE_CONTROL },
        ],
      },
      {
        source: "/frames-mobile/:path*",
        headers: [
          { key: "Cache-Control", value: STATIC_MEDIA_CACHE_CONTROL },
        ],
      },
    ];
  },
};

export default nextConfig;
